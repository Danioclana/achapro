'use client'

import { motion } from 'framer-motion'

export default function LoadingSpinner({ fullScreen = true }: { fullScreen?: boolean }) {
  const spinner = (
    <motion.div
      aria-label="Carregando..."
      role="status"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
    />
  )

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-sm"
      >
        {spinner}
      </motion.div>
    )
  }

  return spinner
}
