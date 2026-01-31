// Auth API Route - Complete Implementation with Supabase
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - Login or Signup
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { action, email, phone, password, otp, name, dairyName, referralCode } = body

        switch (action) {
            case 'login_email': {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (error) {
                    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
                }

                return NextResponse.json({ success: true, data })
            }

            case 'send_otp': {
                const { data, error } = await supabase.auth.signInWithOtp({
                    phone,
                    options: { channel: 'sms' }
                })

                if (error) {
                    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
                }

                return NextResponse.json({ success: true, message: 'OTP sent successfully' })
            }

            case 'verify_otp': {
                const { data, error } = await supabase.auth.verifyOtp({
                    phone,
                    token: otp,
                    type: 'sms',
                })

                if (error) {
                    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
                }

                return NextResponse.json({ success: true, data })
            }

            case 'signup': {
                // Create auth user
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { name, phone }
                    }
                })

                if (authError) {
                    return NextResponse.json({ success: false, error: authError.message }, { status: 400 })
                }

                if (!authData.user) {
                    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 400 })
                }

                // Create user profile
                const { data: user, error: userError } = await supabase
                    .from('users')
                    .insert({
                        id: authData.user.id,
                        email,
                        phone,
                        name,
                        role: 'DAIRY_OWNER',
                        language: 'en',
                    })
                    .select()
                    .single()

                if (userError) {
                    return NextResponse.json({ success: false, error: userError.message }, { status: 400 })
                }

                // Create dairy
                const { data: dairy, error: dairyError } = await supabase
                    .from('dairies')
                    .insert({
                        name: dairyName,
                        email,
                        phone,
                        userId: user.id,
                        status: 'TRIAL',
                        planExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
                        whatsappCredits: 100,
                    })
                    .select()
                    .single()

                if (dairyError) {
                    return NextResponse.json({ success: false, error: dairyError.message }, { status: 400 })
                }

                // Apply referral code if provided
                if (referralCode) {
                    try {
                        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/referrals`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ referralCode, newDairyId: dairy.id })
                        })
                    } catch (e) {
                        console.error('Failed to apply referral:', e)
                    }
                }

                return NextResponse.json({
                    success: true,
                    data: { user, dairy },
                    message: 'Account created successfully!'
                })
            }

            case 'logout': {
                const { error } = await supabase.auth.signOut()

                if (error) {
                    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
                }

                return NextResponse.json({ success: true, message: 'Logged out successfully' })
            }

            case 'reset_password': {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
                })

                if (error) {
                    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
                }

                return NextResponse.json({ success: true, message: 'Password reset email sent' })
            }

            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// GET - Get current user
export async function GET(request: Request) {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
        }

        // Get full profile
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select(`
        *,
        dairy:dairies(*),
        farmer:farmers(*),
        staff:staff(*),
        buyer:buyers(*)
      `)
            .eq('id', user.id)
            .single()

        if (profileError) {
            return NextResponse.json({ success: false, error: profileError.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, data: profile })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
