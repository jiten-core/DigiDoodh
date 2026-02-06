import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'test_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
});

export async function POST(req: NextRequest) {
    try {
        const { amount, planId, userId } = await req.json();

        // 1. Create Order
        const order = await razorpay.orders.create({
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                planId,
                userId
            }
        });

        // 2. Log implementation in Database
        const supabase = createAdminClient();
        await supabase.from('payment_transactions').insert({
            dairy_id: userId,
            order_id: order.id,
            amount: amount,
            plan_id: planId,
            status: 'PENDING'
        });

        return NextResponse.json(order);
    } catch (error: any) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
