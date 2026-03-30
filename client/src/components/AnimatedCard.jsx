import { motion } from 'framer-motion'

export default function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0, 
  hover = true,
  glow = false,
  ...props 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={hover ? { 
        scale: 1.02, 
        y: -2,
        boxShadow: glow ? '0 20px 40px rgba(168, 85, 247, 0.15)' : undefined
      } : undefined}
      whileTap={{ scale: 0.98 }}
      className={`glass rounded-2xl transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}