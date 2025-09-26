import { useState } from 'react'
import { supabase } from '../../utils/supabase'
import bcrypt from 'bcryptjs'

export interface UserForm {
  name: string
  email: string
  password: string
}

export interface UseUserManagementReturn {
  userForm: UserForm
  isLoading: boolean
  updateUserForm: (field: keyof UserForm, value: string) => void
  resetForm: () => void
  addUser: (userData: UserForm) => Promise<{ success: boolean; message: string }>
  validateForm: (userData: UserForm) => string | null
  resetPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; message: string }>
}

export const useUserManagement = (): UseUserManagementReturn => {
  const [userForm, setUserForm] = useState<UserForm>({
    name: '',
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const updateUserForm = (field: keyof UserForm, value: string) => {
    setUserForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetForm = () => {
    setUserForm({ name: '', email: '', password: '' })
  }

  const validateForm = (userData: UserForm): string | null => {
    if (!userData.name.trim()) return 'Name is required'
    if (!userData.email.trim()) return 'Email is required'
    if (!userData.password.trim()) return 'Password is required'
    if (userData.password.length < 6) return 'Password must be at least 6 characters'

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) return 'Please enter a valid email address'

    return null
  }

  const addUser = async (userData: UserForm): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)

    try {
      // Hash the password using bcrypt
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds)

      // Insert user into Supabase and get the created user
      const { data: newUser, error } = await supabase
        .from('user')
        .insert([
          {
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            password: hashedPassword,
            created_at: new Date().toISOString()
          }
        ])
        .select('user_id')
        .single()

      if (error) {
        throw error
      }

      // Get the Employee role ID (assuming it's role_id = 3, but we'll fetch it dynamically)
      const { data: employeeRole, error: roleError } = await supabase
        .from('roles')
        .select('role_id')
        .eq('role_name', 'Employee')
        .single()

      if (roleError) {
        console.error('Error fetching Employee role:', roleError)
        // Continue without assigning role if role fetch fails
      } else if (employeeRole && newUser) {
        // Assign Employee role to the new user
        const { error: userRoleError } = await supabase
          .from('user_role')
          .insert([
            {
              user_id: newUser.user_id,
              role_id: employeeRole.role_id
            }
          ])

        if (userRoleError) {
          console.error('Error assigning Employee role:', userRoleError)
          // Don't fail the entire operation if role assignment fails
        }
      }

      return {
        success: true,
        message: `User "${userData.name}" added successfully with Employee role!`
      }

    } catch (error: any) {
      console.error('Error adding user:', error)
      return {
        success: false,
        message: error.message || 'Failed to add user. Please try again.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true)

    try {
      // Validate password
      if (!newPassword.trim()) {
        return { success: false, message: 'Password is required' }
      }
      if (newPassword.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' }
      }

      // Hash the new password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

      // Update user password in database
      const { error } = await supabase
        .from('user')
        .update({ password: hashedPassword })
        .eq('user_id', userId)

      if (error) {
        throw error
      }

      return {
        success: true,
        message: 'Password has been reset successfully!'
      }

    } catch (error: any) {
      console.error('Error resetting password:', error)
      return {
        success: false,
        message: error.message || 'Failed to reset password. Please try again.'
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    userForm,
    isLoading,
    updateUserForm,
    resetForm,
    addUser,
    validateForm,
    resetPassword
  }
}
