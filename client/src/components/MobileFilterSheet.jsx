import { motion, AnimatePresence } from 'framer-motion'
import { X, Filter } from 'lucide-react'

export default function MobileFilterSheet({ 
  isOpen, 
  onClose, 
  title,
  children 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          >
            <div className="glass rounded-t-3xl border-t border-white/20 max-h-[80vh] overflow-hidden">
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1 bg-white/30 rounded-full" />
              </div>
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-purple-400" />
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
              
              {/* Content */}
              <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}