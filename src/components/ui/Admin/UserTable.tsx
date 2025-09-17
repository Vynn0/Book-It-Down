import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import { getRoleColor } from '../../../utils/roleUtils';

interface UserRole {
  role_id: number;
  role_name: string;
}

interface DatabaseUser {
  user_id: string;
  name: string;
  email: string;
  created_at: string;
  roles?: UserRole[];
}

interface UserTableProps {
  users: DatabaseUser[];
  isLoading: boolean;
  error: string | null;
  onAddUser?: () => void;
  onEditUser?: (user: DatabaseUser) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, isLoading, error, onAddUser, onEditUser }) => {

  return (
    <Paper sx={{ mt: 7, mb: 4 }}>
      <Box sx={{ borderBottom: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ pb: 3 }}>
            <Typography variant="h5" component="h2" color="secondary">
              Users Management
            </Typography>
            <Typography variant="body2" color="text.secondary" pt={1}>
              Manage all users in the system
            </Typography>
          </Box>
          {onAddUser && (
            <Button
              variant="contained"
              size="medium"
              startIcon={<PersonAdd />}
              onClick={onAddUser}
              sx={{
                backgroundColor: '#FF9B0F', // Orange from theme
                color: 'white',
                '&:hover': {
                  backgroundColor: '#e6890e', // Darker orange on hover
                },
                fontWeight: 'bold',
                px: 2.5,
                py: 1
              }}
            >
              Add New User
            </Button>
          )}
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            {error}
          </Alert>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Roles</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.user_id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {user.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Chip
                              key={role.role_id}
                              label={role.role_name}
                              size="small"
                              color={getRoleColor(role.role_name)}
                              variant="outlined"
                            />
                          ))
                        ) : (
                          <Chip
                            label="No Role"
                            size="small"
                            variant="outlined"
                            color="default"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          if (onEditUser) {
                            onEditUser(user);
                          }
                        }}
                        sx={{
                          backgroundColor: '#FF9B0F', // Orange from theme
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#e6890e', // Darker orange on hover
                          },
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          px: 2,
                          py: 0.5
                        }}
                        aria-label={`Edit ${user.name}`}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default UserTable;
