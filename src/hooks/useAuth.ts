import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../utils/supabase'
import bcrypt from 'bcryptjs'

export interface User {
  userID: string
  name: string
  email: string
  created_at: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
}

// Create Auth Context
const AuthContext = createContext<UseAuthReturn | undefined>(undefined)

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const useAuthLogic = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('authenticated_user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true
          })
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }))

    try {
      // Fetch user from database
      const { data: users, error } = await supabase
        .from('user')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .limit(1)

      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      if (!users || users.length === 0) {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return {
          success: false,
          message: 'Invalid email or password'
        }
      }

      const user = users[0]

      // Compare password with hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return {
          success: false,
          message: 'Invalid email or password'
        }
      }

      // Create user object without password
      const authenticatedUser: User = {
        userID: user.userid || user.userID,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }

      // Store user in localStorage
      localStorage.setItem('authenticated_user', JSON.stringify(authenticatedUser))

      // Update auth state
      setAuthState({
        user: authenticatedUser,
        isLoading: false,
        isAuthenticated: true
      })

      return {
        success: true,
        message: 'Login successful!'
      }

    } catch (error: any) {
      console.error('Login error:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('authenticated_user')
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    })
  }

  return {
    ...authState,
    login,
    logout
  }
}

export { AuthContext }
