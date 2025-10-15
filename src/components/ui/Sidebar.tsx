import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import {
  Group,
  MeetingRoom,
  History,
  EventAvailable,
  Groups,
} from '@mui/icons-material'
import { useLocation } from 'react-router-dom'
import { useRoleBasedRouting, useNavigation } from '../../hooks'

const drawerWidth = 240

interface SidebarProps {
  activeView: string
  onMenuClick: (view: string) => void
  open: boolean
  onClose: () => void
}

export function Sidebar({ activeView, onMenuClick, open, onClose }: SidebarProps) {
  const { isAdmin, isRoomManager, isEmployee } = useRoleBasedRouting()
  const {
    goToAdminDashboard,
    goToRoomManagement,
    goToSearch,
    goToBookingHistory,
    goToCurrentBooking, // pastikan ada di hook useNavigation
    goToAllUsersBookings,
  } = useNavigation()
  const location = useLocation()

  // Centralized navigation with fallbacks
  const handleRouterNavigation = (view: string) => {
    console.log('Sidebar navigation:', view) // Debug log
    try {
      switch (view) {
        case 'userManagement':
          goToAdminDashboard()
          break
        case 'roomManagement':
          goToRoomManagement()
          break
        case 'addBooking':
          goToSearch()
          break
        case 'currentBooking':
          if (goToCurrentBooking) {
            goToCurrentBooking()
          } else {
            console.warn('goToCurrentBooking not available, using fallback')
            onMenuClick(view)
          }
          break
        case 'bookingHistory':
          goToBookingHistory()
          break
        case 'allUsersBookings': // <-- 3. TAMBAHKAN CASE BARU
          goToAllUsersBookings();
          break;
        default:
          console.warn('Unhandled view:', view, 'using onMenuClick fallback')
          onMenuClick(view)
      }
    } catch (error) {
      console.error('Navigation error for view:', view, error)
      onMenuClick(view)
    }
  }

  // Determine active view based on current route
  const getActiveView = () => {
    const path = location.pathname
    console.log('Current path:', path) // Debug log
    if (path.includes('/admin/dashboard')) return 'userManagement'
    if (path.includes('/rooms/management')) return 'roomManagement'
    if (path.includes('/history')) return 'bookingHistory' // ✅ Added this case
    if (path.includes('/current')) return 'currentBooking' // ✅ Fixed path check
    if (path.includes('/admin/all-bookings')) return 'allUsersBookings'; // <-- 4. TAMBAHKAN PENGECEKAN PATH
    if (path.includes('/searchpage')) return activeView || 'addBooking'
    if (path.includes('/rooms/') && path.includes('/book')) return 'addBooking'
    return activeView
  }

  const currentActiveView = getActiveView()

  const getMenuItems = () => {
    const allMenuItems = [
      { text: 'User Management', icon: <Group />, view: 'userManagement', roles: ['admin'] },
      { text: 'Room Management', icon: <MeetingRoom />, view: 'roomManagement', roles: ['admin', 'room-manager'] },
      { text: 'Add Booking', icon: <EventAvailable />, view: 'addBooking', roles: ['admin', 'room-manager', 'employee'] },
      { text: 'Current Booking', icon: <History />, view: 'currentBooking', roles: ['admin', 'room-manager', 'employee'] }, // ✅ baru
      { text: 'Booking History', icon: <History />, view: 'bookingHistory', roles: ['admin', 'room-manager', 'employee'] },
      { text: 'All User Bookings', icon: <Groups />, view: 'allUsersBookings', roles: ['admin'] },
    ]

    return allMenuItems.filter(item => {
      if (isAdmin() && item.roles.includes('admin')) return true
      if (isRoomManager() && item.roles.includes('room-manager')) return true
      if (isEmployee() && item.roles.includes('employee')) return true
      return false
    })
  }

  const menuItems = getMenuItems()

  return (
    <Drawer
      variant="persistent"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'secondary.main',
          color: 'white',
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Book It Down
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List sx={{ pt: 0 }}>
          {menuItems.map(item => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={currentActiveView === item.view}
                onClick={() => handleRouterNavigation(item.view)}
                sx={{
                  p: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                  },
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}

