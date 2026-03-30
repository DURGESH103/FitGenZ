import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000, // 10 second timeout
})

// Attach access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

// Enhanced response interceptor with better error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message)
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout')
      toast.error('Request timed out. Please try again.')
      return Promise.reject(error)
    }

    // Handle 401 errors (authentication)
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      try {
        console.log('Attempting token refresh...')
        const { data } = await axios.post('/api/auth/refresh', {}, { 
          withCredentials: true,
          timeout: 5000 
        })
        
        const newToken = data.accessToken
        localStorage.setItem('accessToken', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        
        console.log('Token refreshed successfully')
        return api(original)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        processQueue(refreshError, null)
        
        // Clear auth data
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        
        // Show user-friendly message
        toast.error('Session expired. Please log in again.')
        
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle other HTTP errors
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    switch (status) {
      case 400:
        console.error('Bad Request:', message)
        toast.error(message || 'Invalid request')
        break
      case 403:
        console.error('Forbidden:', message)
        toast.error('Access denied')
        break
      case 404:
        console.error('Not Found:', message)
        toast.error('Resource not found')
        break
      case 429:
        console.error('Rate Limited:', message)
        toast.error('Too many requests. Please wait a moment.')
        break
      case 500:
        console.error('Server Error:', message)
        toast.error('Server error. Please try again later.')
        break
      default:
        console.error('HTTP Error:', status, message)
        if (status >= 500) {
          toast.error('Server error. Please try again later.')
        }
    }

    return Promise.reject(error)
  }
)

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken')
  const user = localStorage.getItem('user')
  return !!(token && user)
}

// Helper function to clear auth data
export const clearAuthData = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
  delete api.defaults.headers.common.Authorization
}

// Helper function to set auth data
export const setAuthData = (token, user) => {
  localStorage.setItem('accessToken', token)
  localStorage.setItem('user', JSON.stringify(user))
  api.defaults.headers.common.Authorization = `Bearer ${token}`
}

export default api