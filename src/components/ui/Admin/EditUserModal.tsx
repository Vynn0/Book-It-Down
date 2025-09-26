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
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { useState, useEffect } from 'react'
import type { DatabaseUser, Role } from '../../../types/user'
import { supabase } from '../../../utils/supabase'
import { getRoleColor } from '../../../utils/roleUtils'
import { useAuth } from '../../../hooks/useAuth'
import { useUserManagement } from '../../../hooks/Users/useUserManagement'
import { Visibility, VisibilityOff } from '@mui/icons-material'

interface EditUserModalProps {
    open: boolean
    user: DatabaseUser | null
    onClose: () => void
    onEditUser?: (user: DatabaseUser) => void
    onConfirmEdit?: (userId: string, newName: string, newRoleIds: number[]) => void
    onResetPassword?: () => void
}

function EditUserModal({ open, user, onClose, onEditUser, onConfirmEdit, onResetPassword }: EditUserModalProps) {
    const [isEditMode, setIsEditMode] = useState(false)
    const [isPasswordResetMode, setIsPasswordResetMode] = useState(false)
    const [editedName, setEditedName] = useState('')
    const [editedRoleIds, setEditedRoleIds] = useState<number[]>([])
    const [availableRoles, setAvailableRoles] = useState<Role[]>([])
    const [isLoadingRoles, setIsLoadingRoles] = useState(false)
    
    // Password reset state
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordError, setPasswordError] = useState('')
    
    // Get current logged-in user and user management hook
    const { user: currentUser } = useAuth()
    const { resetPassword, isLoading: isResettingPassword } = useUserManagement()
    
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
        setIsPasswordResetMode(false)
        
        // Reset password fields
        setNewPassword('')
        setConfirmPassword('')
        setPasswordError('')
        setShowPassword(false)
        setShowConfirmPassword(false)

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
        setIsPasswordResetMode(false)
        setPasswordError('')
        if (user) {
            setEditedName(user.name) // Reset to original name
            setEditedRoleIds(user.roles?.map(role => role.role_id) || []) // Reset to original roles
            setNewPassword('')
            setConfirmPassword('')
        }
    }

    const handleClose = () => {
        setIsEditMode(false)
        setIsPasswordResetMode(false)
        setPasswordError('')
        if (user) {
            setEditedName(user.name) // Reset to original name
            setEditedRoleIds(user.roles?.map(role => role.role_id) || []) // Reset to original roles
            setNewPassword('')
            setConfirmPassword('')
        }
        onClose()
    }

    const handlePasswordReset = () => {
        if (isViewingOwnProfile) return
        setIsPasswordResetMode(true)
        setIsEditMode(false)
    }

    const handleConfirmPasswordReset = async () => {
        if (!user) return

        // Validate passwords
        if (!newPassword.trim()) {
            setPasswordError('Password is required')
            return
        }
        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters')
            return
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match')
            return
        }

        // Reset password
        const result = await resetPassword(user.user_id, newPassword)
        
        if (result.success) {
            setPasswordError('')
            setNewPassword('')
            setConfirmPassword('')
            setIsPasswordResetMode(false)
            if (onResetPassword) {
                onResetPassword()
            }
            alert(result.message) // Simple success notification
        } else {
            setPasswordError(result.message)
        }
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
                    {isPasswordResetMode ? 'Reset User Password' : 
                     isEditMode ? 'Edit User Details' : 
                     'View User Details'}
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

                        {/* Password Reset Section */}
                        {isPasswordResetMode && (
                            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#fff9c4' }}>
                                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#f57c00' }}>
                                    Reset Password for {user.name}
                                </Typography>
                                
                                {passwordError && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {passwordError}
                                    </Alert>
                                )}

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        New Password
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        placeholder="Enter new password (min 6 characters)"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        Confirm New Password
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        placeholder="Confirm new password"
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        edge="end"
                                                    >
                                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Box>
                            </Paper>
                        )}
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

                {isPasswordResetMode ? (
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
                            onClick={handleConfirmPasswordReset}
                            disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                            sx={{
                                backgroundColor: '#f57c00',
                                '&:hover': { backgroundColor: '#ef6c00' },
                                '&:disabled': { backgroundColor: '#ccc' }
                            }}
                        >
                            Reset Password
                        </Button>
                    </>
                ) : isEditMode ? (
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
                    <>
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
                        
                        {/* Reset Password Button - Only show for admin and not own profile */}
                        {!isViewingOwnProfile && (
                            <Button
                                variant="outlined"
                                onClick={handlePasswordReset}
                                sx={{
                                    color: '#f57c00',
                                    borderColor: '#f57c00',
                                    '&:hover': { 
                                        backgroundColor: '#fff3e0',
                                        borderColor: '#ef6c00' 
                                    }
                                }}
                            >
                                Reset Password
                            </Button>
                        )}
                    </>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default EditUserModal
