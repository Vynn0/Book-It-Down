import { useState } from 'react'

export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info'

export interface NotificationState {
  open: boolean
  message: string
  severity: NotificationSeverity
}

export interface UseNotificationReturn {
  notification: NotificationState
  showNotification: (message: string, severity?: NotificationSeverity) => void
  hideNotification: () => void
}

export const useNotification = (): UseNotificationReturn => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  })

  const showNotification = (message: string, severity: NotificationSeverity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }))
  }

  return {
    notification,
    showNotification,
    hideNotification
  }
}
