// Referrals API Route - Complete Implementation
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get referral stats and history
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dairyId = searchParams.get('dairyId')

        if (!dairyId) {
            return NextResponse.json({ success: false, error: 'Dairy ID required' }, { status: 400 })
        }

        // Get dairy's referral code
        const { data: dairy, error: dairyError } = await supabase
            .from('dairies')
            .select('id, name')
            .eq('id', dairyId)
            .single()

        if (dairyError) {
            return NextResponse.json({ success: false, error: dairyError.message }, { status: 400 })
        }

        // Generate referral code (deterministic based on dairy ID)
        const referralCode = `DAIRY${dairy.id.substring(0, 8).toUpperCase()}`

        // Get referrals made by this dairy
        const { data: referrals, error: referralsError } = await supabase
            .from('referrals')
            .select(`
        *,
        referredDairy:dairies!referredDairyId(id, name, phone)
      `)
            .eq('referrerDairyId', dairyId)
            .order('createdAt', { ascending: false })

        if (referralsError) {
            return NextResponse.json({ success: false, error: referralsError.message }, { status: 400 })
        }

        // Calculate stats
        const totalReferrals = referrals?.length || 0
        const completedReferrals = referrals?.filter(r => r.status === 'COMPLETED' || r.status === 'REWARDED').length || 0
        const pendingReferrals = referrals?.filter(r => r.status === 'PENDING').length || 0
        const totalRewardDays = referrals?.filter(r => r.status === 'REWARDED').reduce((sum, r) => sum + r.rewardDays, 0) || 0

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    totalReferrals,
                    completedReferrals,
                    pendingReferrals,
                    totalRewardDays,
                    currentReferralCode: referralCode,
                },
                referrals: referrals || [],
            }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST - Apply referral code during signup
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { referralCode, newDairyId } = body

        if (!referralCode || !newDairyId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        // Find referrer dairy by code
        // Code format: DAIRY{first 8 chars of dairy ID}
        const dairyIdPrefix = referralCode.replace('DAIRY', '').toLowerCase()

        const { data: referrerDairy, error: findError } = await supabase
            .from('dairies')
            .select('id, name')
            .ilike('id', `${dairyIdPrefix}%`)
            .single()

        if (findError || !referrerDairy) {
            return NextResponse.json({ success: false, error: 'Invalid referral code' }, { status: 400 })
        }

        // Prevent self-referral
        if (referrerDairy.id === newDairyId) {
            return NextResponse.json({ success: false, error: 'Cannot use your own referral code' }, { status: 400 })
        }

        // Check if referral already exists
        const { data: existingReferral } = await supabase
            .from('referrals')
            .select('id')
            .eq('referrerDairyId', referrerDairy.id)
            .eq('referredDairyId', newDairyId)
            .single()

        if (existingReferral) {
            return NextResponse.json({ success: false, error: 'Referral already exists' }, { status: 400 })
        }

        // Create referral record
        const { data: referral, error: createError } = await supabase
            .from('referrals')
            .insert({
                referrerDairyId: referrerDairy.id,
                referredDairyId: newDairyId,
                referralCode,
                status: 'PENDING',
                rewardDays: 30,      // Referrer gets 30 days
                referredRewardDays: 15, // Referred gets 15 days
            })
            .select()
            .single()

        if (createError) {
            return NextResponse.json({ success: false, error: createError.message }, { status: 400 })
        }

        // Add 15 days to new dairy's plan
        const { data: newDairy } = await supabase
            .from('dairies')
            .select('planExpiresAt')
            .eq('id', newDairyId)
            .single()

        const currentExpiry = newDairy?.planExpiresAt ? new Date(newDairy.planExpiresAt) : new Date()
        currentExpiry.setDate(currentExpiry.getDate() + 15)

        await supabase
            .from('dairies')
            .update({ planExpiresAt: currentExpiry.toISOString() })
            .eq('id', newDairyId)

        return NextResponse.json({
            success: true,
            data: referral,
            message: 'Referral applied! You got 15 days free!'
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// PATCH - Complete referral and reward referrer
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { referralId, action } = body

        if (action === 'complete') {
            // Get referral
            const { data: referral, error: findError } = await supabase
                .from('referrals')
                .select('*')
                .eq('id', referralId)
                .single()

            if (findError || !referral) {
                return NextResponse.json({ success: false, error: 'Referral not found' }, { status: 404 })
            }

            if (referral.status !== 'PENDING') {
                return NextResponse.json({ success: false, error: 'Referral already processed' }, { status: 400 })
            }

            // Update referral status
            await supabase
                .from('referrals')
                .update({ status: 'COMPLETED' })
                .eq('id', referralId)

            return NextResponse.json({ success: true, message: 'Referral completed' })
        }

        if (action === 'reward') {
            // Get referral
            const { data: referral, error: findError } = await supabase
                .from('referrals')
                .select('*')
                .eq('id', referralId)
                .single()

            if (findError || !referral) {
                return NextResponse.json({ success: false, error: 'Referral not found' }, { status: 404 })
            }

            if (referral.status !== 'COMPLETED') {
                return NextResponse.json({ success: false, error: 'Referral must be completed first' }, { status: 400 })
            }

            // Add reward days to referrer's plan
            const { data: referrerDairy } = await supabase
                .from('dairies')
                .select('planExpiresAt')
                .eq('id', referral.referrerDairyId)
                .single()

            const currentExpiry = referrerDairy?.planExpiresAt ? new Date(referrerDairy.planExpiresAt) : new Date()
            currentExpiry.setDate(currentExpiry.getDate() + referral.rewardDays)

            await supabase
                .from('dairies')
                .update({ planExpiresAt: currentExpiry.toISOString() })
                .eq('id', referral.referrerDairyId)

            // Update referral status
            await supabase
                .from('referrals')
                .update({
                    status: 'REWARDED',
                    rewardedAt: new Date().toISOString()
                })
                .eq('id', referralId)

            return NextResponse.json({ success: true, message: `Rewarded ${referral.rewardDays} days!` })
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
