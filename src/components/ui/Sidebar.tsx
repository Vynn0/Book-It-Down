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
} from '@mui/icons-material'
import { useRoleBasedRouting } from '../../hooks'

const drawerWidth = 240

interface SidebarProps {
  activeView: string
  onMenuClick: (view: string) => void
}

export function Sidebar({ activeView, onMenuClick }: SidebarProps) {
  const { isAdmin, isRoomManager } = useRoleBasedRouting();

  const getMenuItems = () => {
    const allMenuItems = [
      { text: 'User Management', icon: <Group />, view: 'userManagement', roles: ['admin'] },
      { text: 'Room Management', icon: <MeetingRoom />, view: 'roomManagement', roles: ['admin', 'room-manager'] },
      { text: 'Booking History', icon: <History />, view: 'bookingHistory', roles: ['admin', 'room-manager', 'employee'] },
    ];

    return allMenuItems.filter(item => {
      if (isAdmin() && item.roles.includes('admin')) return true;
      if (isRoomManager() && item.roles.includes('room-manager')) return true;
      if (item.roles.includes('employee')) return true;
      return false;
    });
  };

  const menuItems = getMenuItems();

  return (
    <Drawer
      variant="permanent"
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