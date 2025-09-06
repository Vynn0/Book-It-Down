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
  PlaylistAddCheck,
  MeetingRoom,
  History,
  AddHomeWork,
} from '@mui/icons-material'

const drawerWidth = 240

const menuItems = [
  { text: 'User Management', icon: <Group />, view: 'userManagement' },
  { text: 'Booking Request', icon: <PlaylistAddCheck />, view: 'bookingRequest' },
  { text: 'Room List', icon: <MeetingRoom />, view: 'roomList' },
  { text: 'Users Booking History', icon: <History />, view: 'bookingHistory' },
  { text: 'Add Booking', icon: <AddHomeWork />, view: 'addBooking' },
]

interface AdminSidebarProps {
  activeView: string
  onMenuClick: (view: string) => void
}

export function AdminSidebar({ activeView, onMenuClick }: AdminSidebarProps) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'primary.dark', // Warna background sidebar
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
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={activeView === item.view}
                onClick={() => onMenuClick(item.view)}
                sx={{
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