// Subscriptions API Route - Complete Implementation with Razorpay
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import Razorpay from 'razorpay'
import crypto from 'crypto'

let razorpayInstance: Razorpay | null = null;
function getRazorpay() {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
        })
    }
    return razorpayInstance
}

// Plan details
const PLANS = {
    BASIC: {
        price: 199,
        yearlyPrice: 1990,
        maxFarmers: 300,
        maxBuyers: 50,
        name: 'Basic'
    },
    PREMIUM: {
        price: 299,
        yearlyPrice: 2990,
        maxFarmers: 600,
        maxBuyers: 200,
        name: 'Premium'
    },
    PREMIUM_PLUS: {
        price: 599,
        yearlyPrice: 5990,
        maxFarmers: -1, // Unlimited
        maxBuyers: -1,
        name: 'Premium+'
    },
}

// GET - Get subscription details
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dairyId = searchParams.get('dairyId')

        if (!dairyId) {
            return NextResponse.json({ success: false, error: 'Dairy ID required' }, { status: 400 })
        }

        const { data: dairy, error } = await supabase
            .from('dairies')
            .select(`
        *,
        subscription:subscriptions(*)
      `)
            .eq('id', dairyId)
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        // Get plan details
        const subscription = dairy.subscription?.[0]
        const planDetails = subscription ? PLANS[subscription.plan as keyof typeof PLANS] : null

        return NextResponse.json({
            success: true,
            data: {
                dairy,
                subscription,
                planDetails,
                plans: PLANS,
            }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST - Create Razorpay order for subscription
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { dairyId, plan, isYearly = false } = body

        if (!dairyId || !plan) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        const planDetails = PLANS[plan as keyof typeof PLANS]
        if (!planDetails) {
            return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 })
        }

        const amount = isYearly ? planDetails.yearlyPrice : planDetails.price

        // Create Razorpay order
        const order = await getRazorpay().orders.create({
            amount: amount * 100, // Razorpay expects paise
            currency: 'INR',
            receipt: `sub_${dairyId}_${Date.now()}`,
            notes: {
                dairyId,
                plan,
                isYearly: String(isYearly),
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                plan,
                planName: planDetails.name,
                isYearly,
            }
        })
    } catch (error: any) {
        console.error('Razorpay order error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// PATCH - Verify payment and activate subscription
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const {
            dairyId,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            plan,
            isYearly
        } = body

        // Verify signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex')

        if (expectedSignature !== razorpaySignature) {
            return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 })
        }

        // Calculate subscription dates
        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + (isYearly ? 12 : 1))

        const planDetails = PLANS[plan as keyof typeof PLANS]

        // Create or update subscription
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .upsert({
                plan,
                status: 'ACTIVE',
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                amount: isYearly ? planDetails.yearlyPrice : planDetails.price,
                currency: 'INR',
                razorpayOrderId,
                razorpayPaymentId,
                autoRenew: true,
            })
            .select()
            .single()

        if (subError) {
            return NextResponse.json({ success: false, error: subError.message }, { status: 400 })
        }

        // Update dairy with subscription
        await supabase
            .from('dairies')
            .update({
                subscriptionId: subscription.id,
                planExpiresAt: endDate.toISOString(),
                status: 'ACTIVE',
            })
            .eq('id', dairyId)

        return NextResponse.json({
            success: true,
            message: 'Subscription activated successfully!',
            data: subscription,
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
