/**
 * useNotification - Hook for showing notifications
 */
import { useState, useCallback } from 'react'

export function useNotification(duration = 3000) {
  const [notification, setNotification] = useState({
    visible: false,
    type: 'info', // 'info' | 'success' | 'warning' | 'error'
    message: '',
  })

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ visible: true, type, message })
    
    if (duration > 0) {
      setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }))
      }, duration)
    }
  }, [duration])

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, visible: false }))
  }, [])

  const notificationStyles = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '16px 24px',
    borderRadius: '8px',
    maxWidth: '400px',
    zIndex: 10000,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    transition: 'transform 0.3s ease, opacity 0.3s ease',
    transform: notification.visible ? 'translateY(0)' : 'translateY(20px)',
    opacity: notification.visible ? 1 : 0,
    pointerEvents: notification.visible ? 'auto' : 'none',
    ...(notification.type === 'success' && { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' }),
    ...(notification.type === 'warning' && { background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }),
    ...(notification.type === 'error' && { background: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a' }),
    ...(notification.type === 'info' && { background: '#e3f2fd', color: '#0d47a1', border: '1px solid #90caf9' }),
  }

  return {
    notification,
    showNotification,
    hideNotification,
    notificationStyles,
    // Convenience methods
    showSuccess: (msg) => showNotification(msg, 'success'),
    showError: (msg) => showNotification(msg, 'error'),
    showWarning: (msg) => showNotification(msg, 'warning'),
    showInfo: (msg) => showNotification(msg, 'info'),
  }
}