// DigiDhoodh Ultimate - Supabase Client Configuration
// Primary Backend: Supabase (PostgreSQL)

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Use placeholder values if env vars are not set (for demo mode)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// Check if we're in demo mode
export const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://demo.supabase.co'

// Create client with error handling
let supabase: SupabaseClient

try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
        realtime: {
            params: {
                eventsPerSecond: 10,
            },
        },
    })
} catch (error) {
    console.warn('Supabase client creation failed, running in demo mode')
    // Create a mock client for demo mode
    supabase = createClient('https://demo.supabase.co', 'demo-key')
}

export { supabase }

// Admin client for server-side operations (use with caution)
export const createAdminClient = () => {
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
}

// Sync status enum
export enum SYNC_STATUS {
    PENDING = 'PENDING',
    SYNCED = 'SYNCED',
    FAILED = 'FAILED',
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
    console.error('Supabase Error:', error)

    if (error.code === 'PGRST301') {
        return 'No rows found'
    }
    if (error.code === '23505') {
        return 'This record already exists'
    }
    if (error.code === '23503') {
        return 'Related record not found'
    }
    if (error.code === '42501') {
        return 'Permission denied'
    }

    return error.message || 'An unexpected error occurred'
}

// Auth helpers
export const signInWithOTP = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
            channel: 'sms',
        },
    })
    return { data, error }
}

export const verifyOTP = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
    })
    return { data, error }
}

export const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })
    return { data, error }
}

export const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata,
        },
    })
    return { data, error }
}

export const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
}

export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
}

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
}

// Database helpers
export const fetchWithRetry = async (
    tableName: string,
    query: any,
    maxRetries: number = 3
) => {
    let lastError: any

    for (let i = 0; i < maxRetries; i++) {
        try {
            const result = await query
            if (!result.error) {
                return result
            }
            lastError = result.error
        } catch (error) {
            lastError = error
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }

    return { data: null, error: lastError }
}

// Realtime subscriptions
export const subscribeToTable = (
    tableName: string,
    callback: (payload: any) => void
) => {
    return supabase
        .channel(`public:${tableName}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, callback)
        .subscribe()
}

// Storage helpers
export const uploadFile = async (
    bucket: string,
    path: string,
    file: File
) => {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true,
        })
    return { data, error }
}

export const getPublicUrl = (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
}

export const deleteFile = async (bucket: string, paths: string[]) => {
    const { data, error } = await supabase.storage.from(bucket).remove(paths)
    return { data, error }
}

export default supabase
