import { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import { SessionManager } from '../security/sessionManager'
import bcrypt from 'bcryptjs'

export interface User {
  userID: string
  name: string
  email: string
  created_at: string
  roles: UserRole[]
}

export interface UserRole {
  role_id: number
  role_name: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user: User | null }>
  logout: () => void
  hasRole: (roleId: number) => boolean
  getUserRoles: () => UserRole[]
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

  // Check if user is already logged in (from localStorage) and validate session
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem('authenticated_user')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          
          // Also check if there's a valid session
          const existingSession = SessionManager.getSession()
          if (existingSession && SessionManager.isSessionValid()) {
            console.log('Restored user session on page refresh')
            setAuthState({
              user,
              isLoading: false,
              isAuthenticated: true
            })
          } else {
            // Session expired or invalid, clear user data
            console.log('Session expired, clearing stored user data')
            localStorage.removeItem('authenticated_user')
            SessionManager.clearSession()
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false
            })
          }
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false
          })
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        // Clear potentially corrupted data
        localStorage.removeItem('authenticated_user')
        SessionManager.clearSession()
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user: User | null }> => {
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
          message: 'Invalid email or password',
          user: null
        }
      }

      const user = users[0]

      // Compare password with hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return {
          success: false,
          message: 'Invalid email or password',
          user: null
        }
      }

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_role')
        .select(`
          role_id,
          roles(role_id, role_name)
        `)
        .eq('user_id', user.user_id || user.user_id)

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError)
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return {
          success: false,
          message: 'Error fetching user permissions',
          user: null
        }
      }

      // Map roles to simpler format
      const roles: UserRole[] = userRoles?.map(ur => ({
        role_id: ur.role_id,
        role_name: (ur.roles as any)?.role_name || 'Unknown'
      })) || []

      // Create user object without password
      const authenticatedUser: User = {
        userID: user.user_id || user.userID,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        roles: roles
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
        message: 'Login successful!',
        user: authenticatedUser
      }

    } catch (error: any) {
      console.error('Login error:', error)
      setAuthState(prev => ({ ...prev, isLoading: false }))
      return {
        success: false,
        message: error.message || 'Login failed. Please try again.',
        user: null
      }
    }
  }

  const logout = useCallback(() => {
    // Clear both authentication and session data
    localStorage.removeItem('authenticated_user')
    SessionManager.clearSession()
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    })
  }, [])

  const hasRole = useCallback((roleId: number): boolean => {
    return authState.user?.roles?.some(role => role.role_id === roleId) || false
  }, [authState.user?.roles])

  const getUserRoles = useCallback((): UserRole[] => {
    return authState.user?.roles || []
  }, [authState.user?.roles])

  return useMemo(() => ({
    ...authState,
    login,
    logout,
    hasRole,
    getUserRoles
  }), [authState, login, logout, hasRole, getUserRoles])
}

export { AuthContext }
