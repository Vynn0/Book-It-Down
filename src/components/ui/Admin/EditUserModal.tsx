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
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Alert
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useState, useEffect } from 'react'
import type { DatabaseUser, Role } from '../../../types/user'
import { supabase } from '../../../utils/supabase'
import { getRoleColor } from '../../../utils/roleUtils'
import { useAuth } from '../../../hooks/useAuth'

interface EditUserModalProps {
    open: boolean
    user: DatabaseUser | null
    onClose: () => void
    onEditUser?: (user: DatabaseUser) => void
    onConfirmEdit?: (userId: string, newName: string, newRoleIds: number[]) => void
}

function EditUserModal({ open, user, onClose, onEditUser, onConfirmEdit }: EditUserModalProps) {
    const [isEditMode, setIsEditMode] = useState(false)
    const [editedName, setEditedName] = useState('')
    const [editedRoleIds, setEditedRoleIds] = useState<number[]>([])
    const [availableRoles, setAvailableRoles] = useState<Role[]>([])
    const [isLoadingRoles, setIsLoadingRoles] = useState(false)
    
    // Get current logged-in user
    const { user: currentUser } = useAuth()
    
    // Check if the user being viewed is the same as the logged-in user
    // Convert both IDs to strings to ensure consistent comparison
    const isViewingOwnProfile = currentUser && user && (
        String(currentUser.userID) === String(user.user_id) || 
        currentUser.email?.toLowerCase() === user.email?.toLowerCase()
    )

    // Fetch available roles from database
    const fetchRoles = async () => {
        try {
            setIsLoadingRoles(true)
            const { data: roles, error } = await supabase
                .from('roles')
                .select('role_id, role_name')
                .order('role_name')

            if (error) {
                throw error
            }

            setAvailableRoles(roles || [])
        } catch (error) {
            console.error('Error fetching roles:', error)
        } finally {
            setIsLoadingRoles(false)
        }
    }

    // Reset edit mode and form data when modal opens/closes or user changes
    useEffect(() => {
        if (user) {
            setEditedName(user.name)
            setEditedRoleIds(user.roles?.map(role => role.role_id) || [])
        }
        setIsEditMode(false)

        // Fetch roles when modal opens
        if (open) {
            fetchRoles()
        }
    }, [user, open])

    const handleEditClick = () => {
        // Prevent editing own profile
        if (isViewingOwnProfile) {
            return
        }
        
        setIsEditMode(true)
        if (user && onEditUser) {
            onEditUser(user)
        }
    }

    const handleConfirmClick = () => {
        if (user && onConfirmEdit && editedName.trim()) {
            onConfirmEdit(user.user_id, editedName.trim(), editedRoleIds)
            setIsEditMode(false)
        }
    }

    const handleCancelEdit = () => {
        setIsEditMode(false)
        if (user) {
            setEditedName(user.name) // Reset to original name
            setEditedRoleIds(user.roles?.map(role => role.role_id) || []) // Reset to original roles
        }
    }

    const handleClose = () => {
        setIsEditMode(false)
        if (user) {
            setEditedName(user.name) // Reset to original name
            setEditedRoleIds(user.roles?.map(role => role.role_id) || []) // Reset to original roles
        }
        onClose()
    }

    const handleRoleChange = (event: SelectChangeEvent<number[]>) => {
        const value = event.target.value
        setEditedRoleIds(typeof value === 'string' ? [] : value as number[])
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ color: '#3C355F', fontWeight: 'bold', fontSize: '1.25rem' }}>
                    {isEditMode ? 'Edit User Details' : 'View User Details'}
                </Box>
            </DialogTitle>
            <DialogContent>
                {user && (
                    <Box sx={{ pt: 2 }}>
                        {/* Show alert when viewing own profile */}
                        {isViewingOwnProfile && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    <strong>Note:</strong> You are viewing your own profile. For security reasons, you cannot edit your own account details.
                                </Typography>
                            </Alert>
                        )}
                        
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                            User Information
                        </Typography>

                        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f8f9fa' }}>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Full Name
                                </Typography>
                                {isEditMode ? (
                                    <TextField
                                        fullWidth
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        sx={{ mt: 1 }}
                                        placeholder="Enter user's full name"
                                    />
                                ) : (
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {user.name}
                                    </Typography>
                                )}
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Email
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {user.email}
                                </Typography>
                                {isEditMode && (
                                    <Typography variant="caption" color="text.secondary">
                                        (Email cannot be edited)
                                    </Typography>
                                )}
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Role(s)
                                </Typography>
                                {isEditMode ? (
                                    <FormControl fullWidth sx={{ mt: 1 }}>
                                        <InputLabel>Select Roles</InputLabel>
                                        <Select
                                            multiple
                                            value={editedRoleIds}
                                            onChange={handleRoleChange}
                                            input={<OutlinedInput label="Select Roles" />}
                                            renderValue={(selected) => (
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {selected.map((roleId) => {
                                                        const role = availableRoles.find(r => r.role_id === roleId)
                                                        return role ? (
                                                            <Chip
                                                                key={roleId}
                                                                label={role.role_name}
                                                                size="small"
                                                                color={getRoleColor(role.role_name)}
                                                                sx={{ fontWeight: 'bold' }}
                                                            />
                                                        ) : null
                                                    })}
                                                </Box>
                                            )}
                                            disabled={isLoadingRoles}
                                        >
                                            {availableRoles.map((role) => (
                                                <MenuItem key={role.role_id} value={role.role_id}>
                                                    <Chip
                                                        label={role.role_name}
                                                        size="small"
                                                        color={getRoleColor(role.role_name)}
                                                        variant="outlined"
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <Box sx={{ mt: 0.5 }}>
                                        {user.roles && user.roles.length > 0 ? (
                                            user.roles.map((role, index) => (
                                                <Chip
                                                    key={index}
                                                    label={role.role_name}
                                                    color={getRoleColor(role.role_name)}
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
                                )}
                                {isEditMode && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                        Select one or more roles for this user
                                    </Typography>
                                )}
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
                    onClick={handleClose}
                    sx={{
                        color: '#3C355F',
                        '&:hover': { backgroundColor: '#f5f5f5' }
                    }}
                >
                    Close
                </Button>

                {isEditMode ? (
                    <>
                        <Button
                            onClick={handleCancelEdit}
                            sx={{
                                color: '#666',
                                '&:hover': { backgroundColor: '#f5f5f5' }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleConfirmClick}
                            disabled={
                                !editedName.trim() ||
                                (editedName === user?.name &&
                                    JSON.stringify(editedRoleIds.sort()) === JSON.stringify(user?.roles?.map(r => r.role_id).sort() || []))
                            }
                            sx={{
                                backgroundColor: '#4CAF50',
                                '&:hover': { backgroundColor: '#45a049' },
                                '&:disabled': { backgroundColor: '#ccc' }
                            }}
                        >
                            Confirm
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleEditClick}
                        disabled={!!isViewingOwnProfile}
                        sx={{
                            backgroundColor: isViewingOwnProfile ? '#ccc' : '#FF9B0F',
                            '&:hover': { 
                                backgroundColor: isViewingOwnProfile ? '#ccc' : '#e88a00' 
                            },
                            '&:disabled': { 
                                backgroundColor: '#ccc',
                                color: '#666'
                            }
                        }}
                    >
                        {isViewingOwnProfile ? 'Cannot Edit Own Profile' : 'Edit User'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default EditUserModal
