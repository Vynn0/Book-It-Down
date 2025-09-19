// import { useState } from "react";
// import EditRoomModal from "../components/ui/EditRoomModal"; // pastikan path benar
// import { RoomCard } from "../components/ui";
// import {
//     Box,
//     Container,
//     Typography,
//     Card,
//     CardContent,
//     CssBaseline,
//     Button,
//     Paper,
//     Divider,
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     Fab,
//     CircularProgress
// } from '@mui/material'
// import { ThemeProvider } from '@mui/material/styles'
// import { appTheme } from '../services'
// import { Add, Refresh } from '@mui/icons-material'
// import { Navbar, NotificationComponent, RoomFormComponent, RoomCard, Sidebar } from '../components/ui'
// import { useRoomManagement, useNotification, useNavigation } from '../hooks'
// import { useState } from 'react'

// // Make props optional since we'll use router hooks
// interface RoomManagementProps {
//   onBack?: () => void;
//   onProfileClick?: () => void;
//   onNavigateToSearch?: () => void;
//   onNavigateToAdmin?: () => void;
// }

// const drawerWidth = 240;

// function RoomManagement({ onBack, onNavigateToSearch, onNavigateToAdmin }: RoomManagementProps) {
//     const { goBack, goToSearch, goToAdminDashboard } = useNavigation();
//     // const { user } = useAuth();
    
//     // Navigation handlers using centralized navigation with prop fallbacks
//     const handleBackNavigation = () => {
//         if (onBack) {
//             onBack();
//         } else {
//             goBack();
//         }
//     };

//     const handleSearchNavigation = () => {
//         if (onNavigateToSearch) {
//             onNavigateToSearch();
//         } else {
//             goToSearch();
//         }
//     };

//     const handleAdminNavigation = () => {
//         if (onNavigateToAdmin) {
//             onNavigateToAdmin();
//         } else {
//             goToAdminDashboard();
//         }
//     };
//     const [isSidebarOpen, setSidebarOpen] = useState(true); // State untuk sidebar
//     const handleSidebarToggle = () => {
//         setSidebarOpen(!isSidebarOpen);
//     };
    
//     const [isModalOpen, setIsModalOpen] = useState(false)
//     // Perubahan: Tambahkan state untuk sidebar dan dapatkan info user
//     const [activeView, setActiveView] = useState('roomManagement');
//     const {
//         rooms,
//         roomForm,
//         isLoading,
//         isLoadingRooms,
//         updateRoomForm,
//         resetForm,
//         addRoom,
//         validateForm,
//         refreshRooms
//     } = useRoomManagement()

//     const {
//         notification,
//         showNotification,
//         hideNotification
//     } = useNotification()

//     const handleAddRoom = async (e: React.FormEvent) => {
//         e.preventDefault()

//         const validationError = validateForm(roomForm)
//         if (validationError) {
//             showNotification(validationError, 'error')
//             return
//         }

//         const result = await addRoom(roomForm)

//         if (result.success) {
//             showNotification(result.message, 'success')
//             resetForm()
//             setIsModalOpen(false)
//         } else {
//             showNotification(result.message, 'error')
//         }
//     }

//     // Handler untuk klik menu sidebar
//     const handleMenuClick = (view: string) => {
//     if (view === 'addBooking') {
//       handleSearchNavigation();
//     } else if (view === 'userManagement') {
//       handleAdminNavigation();
//     } else {
//       setActiveView(view);
//     }
//   };

//     const handleOpenModal = () => {
//         resetForm()
//         setIsModalOpen(true)
//     }

//     const handleCloseModal = () => {
//         setIsModalOpen(false)
//         resetForm()
//     }
//     return (
//         <ThemeProvider theme={appTheme}>
//             <CssBaseline />
//             {/* Perubahan: Ganti layout menjadi flexbox */}
//             <Box sx={{ display: 'flex' }}>
//                 <Sidebar 
//                     activeView={activeView} 
//                     onMenuClick={handleMenuClick} 
//                     open={isSidebarOpen} 
//                     onClose={() => setSidebarOpen(false)} 
//                 />
//                 <Box 
//                 component="main" 
//                 sx={{ 
//                     flexGrow: 1, 
//                     // Perubahan styling untuk efek push (sama seperti di AdminDashboard)
//                     transition: (theme) => theme.transitions.create('margin', {
//                     easing: theme.transitions.easing.sharp,
//                     duration: theme.transitions.duration.leavingScreen,
//                     }),
//                     marginLeft: `-${drawerWidth}px`,
//                     ...(isSidebarOpen && {
//                     transition: (theme) => theme.transitions.create('margin', {
//                         easing: theme.transitions.easing.easeOut,
//                         duration: theme.transitions.duration.enteringScreen,
//                     }),
//                     marginLeft: 0,
//                     }),
//                 }}
//                 >
//                 <Navbar 
//                     title="Room Management" 
//                     onBack={handleBackNavigation} 
//                     onMenuClick={handleSidebarToggle} 
//                 />
//                     <Container maxWidth="lg" sx={{ mt: 2, mb: 4}}>
//                         <Box sx={{ p: 3 }}>
//                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//                                 <Typography variant="h5" color="secondary" gutterBottom>
//                                     Room Management Dashboard
//                                 </Typography>
//                                 <Button
//                                     startIcon={<Refresh />}
//                                     onClick={refreshRooms}
//                                     variant="outlined"
//                                     disabled={isLoadingRooms}
//                                 >
//                                     Refresh
//                                 </Button>
//                             </Box>
//                             <Divider sx={{ mb: 3, borderTop: '1px solid' }} />

//                             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//                                 <Typography variant="body1">
//                                     Manage and view all available rooms in the system
//                                 </Typography>
//                                 <Button
//                                     variant="contained"
//                                     color="primary"
//                                     startIcon={<Add />}
//                                     onClick={handleOpenModal}
//                                 >
//                                     Add New Room
//                                 </Button>
//                             </Box>

//                             <Card sx={{ border: '2px solid rgba(0,0,0,0.2)'}}>
//                                 <CardContent>
//                                     <Typography variant="h6" color="primary" gutterBottom>
//                                         Quick Stats
//                                     </Typography>
//                                     <Typography variant="body2">
//                                         Total Rooms: {rooms.length}
//                                     </Typography>
//                                     <Typography variant="body2">
//                                         Available Rooms: {rooms.length}
//                                     </Typography>
//                                 </CardContent>
//                             </Card>
//                         </Box>

//                         <Paper sx={{ p: 3}}>
//                             <Typography variant="h5" color="secondary" gutterBottom>
//                                 All Rooms
//                             </Typography>
//                             <Divider sx={{ mb: 3, mt: 3, borderTop: '1px solid' }} />
                            
//                             {isLoadingRooms ? (
//                                 <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
//                                     <CircularProgress />
//                                 </Box>
//                             ) : rooms.length === 0 ? (
//                                 <Box sx={{ textAlign: 'center', py: 4 }}>
//                                     <Typography variant="body1" color="text.secondary">
//                                         No rooms found. Add a new room to get started.
//                                     </Typography>
//                                 </Box>
//                             ) : (
//                                 <Box sx={{ 
//                                     display: 'grid',
//                                     gridTemplateColumns: {
//                                         xs: '1fr',
//                                         sm: 'repeat(2, 1fr)',
//                                         md: 'repeat(3, 1fr)'
//                                     },
//                                     gap: 3
//                                 }}>
//                                     {rooms.map((room) => (
//                                         <RoomCard key={room.room_id} room={room} />
//                                     ))}
//                                 </Box>
//                             )}
//                         </Paper>
//                     </Container>

//                     <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
//                         <DialogTitle>Add New Room</DialogTitle>
//                         <DialogContent>
//                             <RoomFormComponent
//                                 roomForm={roomForm}
//                                 isLoading={isLoading}
//                                 onInputChange={updateRoomForm}
//                                 onSubmit={handleAddRoom}
//                                 submitButtonText="Add Room"
//                             />
//                         </DialogContent>
//                         <DialogActions>
//                             <Button onClick={handleCloseModal} disabled={isLoading}>
//                                 Cancel
//                             </Button>
//                         </DialogActions>
//                     </Dialog>

//                     <Fab
//                         color="primary"
//                         aria-label="add room"
//                         sx={{
//                             position: 'fixed',
//                             bottom: 16,
//                             right: 16,
//                         }}
//                         onClick={handleOpenModal}
//                     >
//                         <Add />
//                     </Fab>

//                     <NotificationComponent
//                         notification={notification}
//                         onClose={hideNotification}
//                     />
//                 </Box>
//             </Box>
//         </ThemeProvider>
//     )
// }

// export default RoomManagement

import { useState } from "react";
import EditRoomModal from "../components/ui/EditRoomModal";
import { RoomCard, Navbar, NotificationComponent, RoomFormComponent, Sidebar } from "../components/ui";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CssBaseline,
  Button,
  Paper,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  CircularProgress
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { appTheme } from "../services";
import { Add, Refresh } from "@mui/icons-material";
import { useRoomManagement, useNotification, useNavigation } from "../hooks";

// Props opsional
interface RoomManagementProps {
  onBack?: () => void;
  onProfileClick?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToAdmin?: () => void;
}

const drawerWidth = 240;

function RoomManagement({ onBack, onNavigateToSearch, onNavigateToAdmin }: RoomManagementProps) {
  const { goBack, goToSearch, goToAdminDashboard } = useNavigation();

  // Navigation handlers
  const handleBackNavigation = () => (onBack ? onBack() : goBack());
  const handleSearchNavigation = () => (onNavigateToSearch ? onNavigateToSearch() : goToSearch());
  const handleAdminNavigation = () => (onNavigateToAdmin ? onNavigateToAdmin() : goToAdminDashboard());

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const handleSidebarToggle = () => setSidebarOpen(!isSidebarOpen);

  // Modal Add Room
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Edit Room
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);

  const [activeView, setActiveView] = useState("roomManagement");
  const {
    rooms,
    roomForm,
    isLoading,
    isLoadingRooms,
    updateRoomForm,
    resetForm,
    addRoom,
    validateForm,
    refreshRooms
  } = useRoomManagement();

  const { notification, showNotification, hideNotification } = useNotification();

  // Handler tambah room
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm(roomForm);
    if (validationError) {
      showNotification(validationError, "error");
      return;
    }
    const result = await addRoom(roomForm);
    if (result.success) {
      showNotification(result.message, "success");
      resetForm();
      setIsModalOpen(false);
    } else {
      showNotification(result.message, "error");
    }
  };

  // Handler klik menu sidebar
  const handleMenuClick = (view: string) => {
    if (view === "addBooking") {
      handleSearchNavigation();
    } else if (view === "userManagement") {
      handleAdminNavigation();
    } else {
      setActiveView(view);
    }
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Handler edit room
  const handleViewDetails = (room: any) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRoom(null);
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <Sidebar
          activeView={activeView}
          onMenuClick={handleMenuClick}
          open={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            transition: (theme) =>
              theme.transitions.create("margin", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen
              }),
            marginLeft: `-${drawerWidth}px`,
            ...(isSidebarOpen && {
              transition: (theme) =>
                theme.transitions.create("margin", {
                  easing: theme.transitions.easing.easeOut,
                  duration: theme.transitions.duration.enteringScreen
                }),
              marginLeft: 0
            })
          }}
        >
          <Navbar title="Room Management" onBack={handleBackNavigation} onMenuClick={handleSidebarToggle} />
          <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h5" color="secondary" gutterBottom>
                  Room Management Dashboard
                </Typography>
                <Button startIcon={<Refresh />} onClick={refreshRooms} variant="outlined" disabled={isLoadingRooms}>
                  Refresh
                </Button>
              </Box>
              <Divider sx={{ mb: 3, borderTop: "1px solid" }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="body1">Manage and view all available rooms in the system</Typography>
                <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleOpenModal}>
                  Add New Room
                </Button>
              </Box>

              <Card sx={{ border: "2px solid rgba(0,0,0,0.2)" }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Quick Stats
                  </Typography>
                  <Typography variant="body2">Total Rooms: {rooms.length}</Typography>
                  <Typography variant="body2">Available Rooms: {rooms.length}</Typography>
                </CardContent>
              </Card>
            </Box>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" color="secondary" gutterBottom>
                All Rooms
              </Typography>
              <Divider sx={{ mb: 3, mt: 3, borderTop: "1px solid" }} />

              {isLoadingRooms ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : rooms.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No rooms found. Add a new room to get started.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)"
                    },
                    gap: 3
                  }}
                >
                  {rooms.map((room) => (
                    <RoomCard key={room.room_id} room={room} onSelect={handleViewDetails} />
                  ))}
                </Box>
              )}
            </Paper>
          </Container>

          {/* Modal Add Room */}
          <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogContent>
              <RoomFormComponent
                roomForm={roomForm}
                isLoading={isLoading}
                onInputChange={updateRoomForm}
                onSubmit={handleAddRoom}
                submitButtonText="Add Room"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} disabled={isLoading}>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>

          {/* Modal Edit Room */}
          {selectedRoom && (
            <EditRoomModal
              isOpen={isEditModalOpen}
              onClose={handleCloseEditModal}
              roomData={{
                name: selectedRoom.room_name,
                location: selectedRoom.location,
                capacity: selectedRoom.capacity,
                description: selectedRoom.description,
                images: []
              }}
            />
          )}

          <Fab
            color="primary"
            aria-label="add room"
            sx={{
              position: "fixed",
              bottom: 16,
              right: 16
            }}
            onClick={handleOpenModal}
          >
            <Add />
          </Fab>

          <NotificationComponent notification={notification} onClose={hideNotification} />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default RoomManagement;
