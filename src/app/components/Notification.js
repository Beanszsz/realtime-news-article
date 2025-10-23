'use client'

import { useEffect } from 'react'

export default function Notification({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  const styles = {
    success: 'bg-emerald-500/90 border-emerald-400',
    error: 'bg-red-500/90 border-red-400',
    info: 'bg-blue-500/90 border-blue-400',
    warning: 'bg-yellow-500/90 border-yellow-400'
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: '●',
    warning: '!'
  }

  return (
    <div className={`${styles[type]} backdrop-blur-sm text-white px-5 py-3 rounded border shadow-2xl flex items-center gap-3 min-w-[280px] animate-slide-in`}>
      <span className="text-base font-bold">{icons[type]}</span>
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="text-white hover:text-gray-200 font-bold text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}
