import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-8 max-w-md w-full text-center border border-red-500/20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center"
            >
              <AlertTriangle size={32} className="text-red-400" />
            </motion.div>

            <h1 className="text-xl font-bold text-white mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-slate-400 text-sm mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-300 font-mono overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap text-[10px] mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
              >
                <RefreshCw size={16} />
                Reload Page
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/20"
              >
                <Home size={16} />
                Go Home
              </motion.button>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              If this problem persists, please contact support.
            </p>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary