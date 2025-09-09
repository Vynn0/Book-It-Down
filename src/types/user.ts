// Shared type definitions for user-related data structures

export interface DatabaseUser {
    user_id: string
    name: string
    email: string
    created_at: string
    roles?: Array<{
        role_id: number
        role_name: string
    }>
}

export interface UserRole {
    role_id: number
    role_name: string
}
