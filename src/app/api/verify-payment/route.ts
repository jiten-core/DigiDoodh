import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId,
            userId
        } = await req.json();

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // 2. Update Database
        const supabase = createAdminClient();

        // Update Transaction
        await supabase
            .from('payment_transactions')
            .update({
                payment_id: razorpay_payment_id,
                status: 'SUCCESS'
            })
            .eq('order_id', razorpay_order_id);

        // Update Subscription
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // Default to 1 year for now

        await supabase
            .from('dairies')
            .update({
                plan_id: planId,
                subscription_status: 'ACTIVE',
                subscription_end_date: endDate.toISOString()
            })
            .eq('id', userId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
