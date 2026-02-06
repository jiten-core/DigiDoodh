'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PLANS, PLAN_TIER } from '@/lib/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Star, Zap, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { razorpayPayment } from '@/lib/razorpay';
import { supabase } from '@/lib/supabase';

// Dynamically load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function PlanSelection() {
    const { profile, refreshProfile } = useAuth();
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';
    const [loading, setLoading] = useState<string | null>(null);

    const currentPlan = profile?.dairy?.plan || PLAN_TIER.BASIC;

    const handleUpgrade = async (planId: PLAN_TIER) => {
        setLoading(planId);
        try {
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error('Failed to load payment gateway');
                return;
            }

            const plan = PLANS[planId];

            // 1. Create Order
            const response = await fetch('/api/create-order', {
                method: 'POST',
                body: JSON.stringify({
                    amount: plan.monthlyPrice, // For demo, using monthly price
                    planId,
                    userId: profile?.id
                })
            });

            const order = await response.json();
            if (order.error) throw new Error(order.error);

            // 2. Open Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: "DigiDoodh Ultimate",
                description: `Upgrade to ${plan.name} Plan`,
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        const verifyRes = await fetch('/api/verify-payment', {
                            method: 'POST',
                            body: JSON.stringify({
                                ...response,
                                planId,
                                userId: profile?.id
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            toast.success('Payment Successful! Plan Upgraded.');
                            refreshProfile();
                        } else {
                            toast.error('Payment Verification Failed');
                        }
                    } catch (err) {
                        toast.error('Payment Verification Error');
                    }
                },
                prefill: {
                    name: profile?.name,
                    email: profile?.email,
                    contact: profile?.phone
                },
                theme: {
                    color: "#F97316"
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (error: any) {
            console.error('Payment Error:', error);
            toast.error(error.message || 'Payment failed initiation');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(PLANS).map(([key, plan]) => {
                const isCurrent = currentPlan === key;
                const isBasic = key === PLAN_TIER.BASIC;

                return (
                    <Card
                        key={key}
                        className={`relative overflow-hidden transition-all hover:shadow-xl ${isCurrent
                                ? 'border-2 border-dairy-600 shadow-dairy-100 ring-2 ring-dairy-100'
                                : 'border border-border hover:border-dairy-300'
                            }`}
                    >
                        {key === PLAN_TIER.PREMIUM && (
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                                POPULAR
                            </div>
                        )}

                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {key === PLAN_TIER.BASIC && <ShieldCheck className="w-5 h-5 text-gray-500" />}
                                {key === PLAN_TIER.PREMIUM && <Zap className="w-5 h-5 text-amber-500" />}
                                {key === PLAN_TIER.PREMIUM_PLUS && <Star className="w-5 h-5 text-indigo-500" />}
                                <span className="font-display text-2xl">{plan.name}</span>
                            </CardTitle>
                            <CardDescription>
                                {isBasic ? (isHindi ? 'मुफ्त शुरुआत के लिए' : 'For starters') :
                                    key === PLAN_TIER.PREMIUM ? (isHindi ? 'बढ़ते व्यापार के लिए' : 'For growing dairy') :
                                        (isHindi ? 'बड़े पैमाने के लिए' : 'For large scale')}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            <div className="text-3xl font-black text-foreground">
                                ₹{plan.monthlyPrice}
                                <span className="text-sm font-normal text-muted-foreground ml-1">/mo</span>
                            </div>

                            <ul className="space-y-3">
                                {plan.features.slice(0, 5).map(feat => (
                                    <li key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                        <span className="capitalize">{feat.replace(/_/g, ' ')}</span>
                                    </li>
                                ))}
                                {/* Add manual limit text */}
                                <li className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                    {plan.limits.farmers === 'unlimited' ? 'Unlimited Farmers' : `${plan.limits.farmers} Farmers`}
                                </li>
                            </ul>

                            <Button
                                className={`w-full h-12 text-lg font-bold rounded-xl ${isCurrent
                                        ? 'bg-muted text-muted-foreground cursor-default hover:bg-muted'
                                        : 'btn-dairy shadow-lg shadow-dairy-200'
                                    }`}
                                onClick={() => !isCurrent && handleUpgrade(key as PLAN_TIER)}
                                disabled={isCurrent || loading !== null}
                            >
                                {loading === key ? (
                                    <span className="animate-pulse">Processing...</span>
                                ) : isCurrent ? (
                                    isHindi ? 'वर्तमान प्लान' : 'Current Plan'
                                ) : (
                                    isHindi ? 'अपग्रेड करें' : 'Upgrade Now'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
