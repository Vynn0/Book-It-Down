import { useState } from 'react'
import { supabase } from '../utils/supabase'
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

      // Insert user into Supabase
      const { error } = await supabase
        .from('user')
        .insert([
          {
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            password: hashedPassword,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        throw error
      }

      return {
        success: true,
        message: `User "${userData.name}" added successfully!`
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

  return {
    userForm,
    isLoading,
    updateUserForm,
    resetForm,
    addUser,
    validateForm
  }
}
