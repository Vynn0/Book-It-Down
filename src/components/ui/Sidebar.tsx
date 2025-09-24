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
import { useLocation } from 'react-router-dom'
import { useRoleBasedRouting, useNavigation } from '../../hooks'

const drawerWidth = 240

interface SidebarProps {
  activeView: string;
  onMenuClick: (view: string) => void;
  open: boolean; // Prop baru
  onClose: () => void; // Prop baru
}

// ... (import dan kode lainnya)

export function Sidebar({ activeView, onMenuClick, open, onClose }: SidebarProps) {
  const { isAdmin, isRoomManager, isEmployee } = useRoleBasedRouting();
  const { 
    goToAdminDashboard, 
    goToRoomManagement, 
    goToSearch,
    goToBookingHistory
  } = useNavigation();
  const location = useLocation();

  // Centralized navigation with fallbacks
  const handleRouterNavigation = (view: string) => {
    try {
      switch (view) {
        case 'userManagement':
          goToAdminDashboard();
          break;
        case 'roomManagement':
          goToRoomManagement();
          break;
        case 'addBooking':
          goToSearch();
          break;
        case 'bookingHistory':
          goToBookingHistory();
          break;
        default:
          // Fallback to state-based navigation
          onMenuClick(view);
      }
    } catch (error) {
      // Fallback to prop-based navigation if centralized navigation fails
      onMenuClick(view);
    }
  };

  // Determine active view based on current route
  const getActiveView = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return 'userManagement';
    if (path.includes('/rooms/management')) return 'roomManagement';
    if (path.includes('/searchpage')) {
      // For searchpage, always use the activeView prop if provided
      // This ensures the sidebar reflects the current view state
      return activeView || 'addBooking';
    }
    if (path.includes('/rooms/') && path.includes('/book')) {
      // When on a booking page, highlight "Add Booking"
      return 'addBooking';
    }
    return activeView;
  };

  const currentActiveView = getActiveView();

  const getMenuItems = () => {
    const allMenuItems = [
      { text: 'User Management', icon: <Group />, view: 'userManagement', roles: ['admin'] },
      { text: 'Room Management', icon: <MeetingRoom />, view: 'roomManagement', roles: ['admin', 'room-manager'] },
      { text: 'Add Booking', icon: <History />, view: 'addBooking', roles: ['admin', 'room-manager', 'employee'] },
      { text: 'Booking History', icon: <History />, view: 'bookingHistory', roles: ['admin', 'room-manager', 'employee'] }
    ];

    // Logika filter yang disederhanakan dan diperbaiki
    return allMenuItems.filter(item => {
      if (isAdmin() && item.roles.includes('admin')) return true;
      if (isRoomManager() && item.roles.includes('room-manager')) return true;
      // Pastikan employee hanya melihat peran employee dan bukan yang lain secara tidak sengaja
      if (isEmployee() && item.roles.includes('employee')) return true;
      return false;
    });
  };

  const menuItems = getMenuItems();

  // ... sisa komponen tidak berubah
  return (
    <Drawer
      // Perubahan di sini
      variant="persistent" // Mengubah dari permanent menjadi temporary
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Meningkatkan performa di mobile
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
        <List sx={{ pt: 0 }}> {/* pt adalah singkatan dari paddingTop */}
          {menuItems.map((item) => (
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
  );
}