import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'
import type { DatabaseUser } from '../types/user'

interface UseUsersReturn {
  users: DatabaseUser[]
  isLoading: boolean
  error: string | null
  refetchUsers: () => Promise<void>
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<DatabaseUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data: usersData, error: usersError } = await supabase
        .from('user')
        .select(`
          user_id,
          name,
          email,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (usersError) {
        throw new Error(usersError.message)
      }

      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_role')
        .select(`
          user_id,
          role_id,
          roles(role_id, role_name)
        `)

      if (rolesError) {
        console.warn('Error fetching user roles:', rolesError)
      }

      const usersWithRoles = usersData?.map(user => {
        const userRoles = userRolesData?.filter(ur => ur.user_id === user.user_id) || []
        const roles = userRoles.map(ur => ({
          role_id: ur.role_id,
          role_name: (ur.roles as any)?.role_name || 'Unknown'
        }))

        return {
          ...user,
          user_id: String(user.user_id || ''),
          roles
        }
      }) || []

      console.log('Fetched users:', usersWithRoles)
      setUsers(usersWithRoles)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      setError(error.message || 'Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    isLoading,
    error,
    refetchUsers: fetchUsers
  }
}