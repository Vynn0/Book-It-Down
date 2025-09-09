import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Paper,
    Box,
    Divider,
    Chip
} from '@mui/material'
import type { DatabaseUser } from '../../../types/user'

interface EditUserModalProps {
    open: boolean
    user: DatabaseUser | null
    onClose: () => void
    onEditUser?: (user: DatabaseUser) => void
}

function EditUserModal({ open, user, onClose, onEditUser }: EditUserModalProps) {
    const handleEditClick = () => {
        if (user && onEditUser) {
            onEditUser(user)
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h6" sx={{ color: '#3C355F', fontWeight: 'bold' }}>
                    Edit User Details
                </Typography>
            </DialogTitle>
            <DialogContent>
                {user && (
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            User Information
                        </Typography>

                        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Full Name
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {user.name}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Email
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {user.email}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Role(s)
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    {user.roles && user.roles.length > 0 ? (
                                        user.roles.map((role, index) => (
                                            <Chip
                                                key={index}
                                                label={role.role_name}
                                                color={role.role_name === 'admin' ? 'error' :
                                                    role.role_name === 'room_manager' ? 'warning' : 'default'}
                                                size="small"
                                                sx={{ mr: 1, mb: 1, fontWeight: 'bold' }}
                                            />
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No roles assigned
                                        </Typography>
                                    )}
                                </Box>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Created At
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {new Date(user.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onClose}
                    sx={{
                        color: '#3C355F',
                        '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                >
                    Close
                </Button>
                <Button
                    variant="contained"
                    onClick={handleEditClick}
                    sx={{
                        backgroundColor: '#FF9B0F',
                        '&:hover': { backgroundColor: '#e88a00' }
                    }}
                >
                    Edit User
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default EditUserModal
