'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, onAuthStateChange, signOut as supabaseSignOut } from '@/lib/supabase'

import { PLAN_TIER, FeatureKey, hasAccess } from '@/lib/subscription'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  role: 'PLATFORM_SUPER_ADMIN' | 'INTERNAL_SUPER_ADMIN' | 'DAIRY_OWNER' | 'STAFF' | 'FARMER' | 'BUYER'
  avatar?: string
  language: string
  dairy?: {
    id: string
    name: string
    planExpiresAt?: string
    status: string
    plan: PLAN_TIER
  }
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (email: string, password: string, userData: { name: string; phone?: string; dairyName?: string }) => Promise<{ success: boolean; error?: string }>
  loginWithPhone: (phone: string) => Promise<{ success: boolean; error?: string }>
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  loginAsDemo: () => Promise<{ success: boolean; error?: string }>
  loginAsFarmer: () => Promise<{ success: boolean; error?: string }>
  checkAccess: (feature: FeatureKey) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        // Check for Demo User persistence
        const isDemo = localStorage.getItem('isDemoUser')
        if (isDemo === 'true') {
          restoreDemoUser()
        }
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      // Ignore auth updates if we are in demo mode and no real session exists
      if (!session && typeof window !== 'undefined' && localStorage.getItem('isDemoUser') === 'true') {
        return
      }

      setSession(session)
      setUser(session?.user ?? null)

      if (event === 'SIGNED_IN' && session?.user) {
        fetchProfile(session.user.id)
      }

      if (event === 'SIGNED_OUT') {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          dairy:dairies(id, name, status, planExpiresAt, plan)
        `)
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile({
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          avatar: data.avatar,
          language: data.language || 'en',
          dairy: data.dairy ? {
            ...data.dairy[0],
            plan: data.dairy[0].plan || PLAN_TIER.BASIC // Default to BASIC
          } : undefined,
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  // ... (login, signup, etc implementations remain same)

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const loginWithPhone = async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: 'sms',
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const signup = async (email: string, password: string, userData: { name: string; phone?: string; dairyName?: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            dairyName: userData.dairyName,
          },
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const loginAsDemo = async () => {
    try {
      const demoUser = {
        id: 'demo-user-123',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'demo@digidhoodh.com',
        phone: '',
        app_metadata: { provider: 'email' },
        user_metadata: {},
        created_at: new Date().toISOString(),
      } as User

      const demoProfile: UserProfile = {
        id: 'demo-user-123',
        name: 'Demo Owner',
        email: 'demo@digidhoodh.com',
        role: 'DAIRY_OWNER',
        language: 'en',
        dairy: {
          id: 'demo-dairy-1',
          name: 'Krishna Dairy Farm',
          status: 'active',
          planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          plan: PLAN_TIER.PREMIUM_PLUS // Demo gets everything
        }
      }

      setUser(demoUser)
      setProfile(demoProfile)
      localStorage.setItem('isDemoUser', 'true')
      document.cookie = "isDemoUser=true; path=/; max-age=86400; SameSite=Lax"
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const loginAsFarmer = async () => {
    try {
      const demoFarmer = {
        id: 'demo-farmer-001',
        aud: 'authenticated',
        role: 'authenticated',
        email: 'farmer@digidoodh.com',
        phone: '9876543210',
        app_metadata: { provider: 'phone' },
        user_metadata: {},
        created_at: new Date().toISOString(),
      } as User

      const demoProfile: UserProfile = {
        id: 'demo-farmer-001',
        name: 'Ramesh Kumar',
        email: 'farmer@digidoodh.com',
        role: 'FARMER',
        language: 'hi',
        dairy: {
          id: 'demo-dairy-1',
          name: 'Krishna Dairy Farm',
          status: 'active',
          plan: PLAN_TIER.BASIC
        }
      }

      setUser(demoFarmer)
      setProfile(demoProfile)
      localStorage.setItem('isDemoUser', 'true')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const restoreDemoUser = () => {
    loginAsDemo()
  }

  const logout = async () => {
    localStorage.removeItem('isDemoUser')
    document.cookie = "isDemoUser=; path=/; max-age=0"
    await supabaseSignOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const checkAccess = (feature: FeatureKey): boolean => {
    if (!profile?.dairy?.plan) return false;
    // Super Admin and Internal Admin bypass
    if (profile.role === 'PLATFORM_SUPER_ADMIN' || profile.role === 'INTERNAL_SUPER_ADMIN') return true;
    // Demo user bypass is handled by giving them PREMIUM_PLUS plan above
    return hasAccess(profile.dairy.plan, feature);
  }



  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        login,
        signup,
        loginWithPhone,
        verifyOTP,
        logout,
        refreshProfile,
        loginAsDemo,
        loginAsFarmer,
        checkAccess
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}