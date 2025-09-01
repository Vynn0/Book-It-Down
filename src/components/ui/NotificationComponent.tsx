import { Snackbar, Alert } from '@mui/material'
import type { NotificationState } from '../../hooks/useNotification'

interface NotificationComponentProps {
  notification: NotificationState
  onClose: () => void
  autoHideDuration?: number
}

function NotificationComponent({
  notification,
  onClose,
  autoHideDuration = 6000
}: NotificationComponentProps) {
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={notification.severity}
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  )
}

export default NotificationComponent
