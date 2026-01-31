'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Gift, Users, Calendar, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { razorpayPayment } from '@/lib/razorpay';
import { PLANS } from '@/lib/firestore-types';

interface SubscriptionData {
  plan: string;
  planExpiry: Date;
  isLocked: boolean;
  referralCode?: string;
}

export default function SubscriptionManager() {
  const { profile } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralMessage, setReferralMessage] = useState('');
  const [referralLoading, setReferralLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
  }, [profile]);

  const fetchSubscriptionData = async () => {
    try {
      // Demo mode logic
      setSubscription({
        plan: 'premium',
        planExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isLocked: false,
        referralCode: 'DEMO12345',
      });
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = async (planKey: string) => {
    setPaymentLoading(true);
    try {
      const planData = PLANS[planKey as keyof typeof PLANS];
      await razorpayPayment.openCheckout({
        amount: planData.price * 100,
        currency: 'INR',
        name: 'DigiDoodh',
        description: `${planData.name} Plan Subscription`,
        handler: async () => {
          setSubscription(prev => prev ? {
            ...prev,
            plan: planKey,
            planExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          } : null);
          alert(`Payment successful! Upgraded to ${planData.name} plan.`);
        },
      });
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const generateReferralCode = async () => {
    setReferralLoading(true);
    try {
      const mockCode = 'DEMO' + Math.random().toString(36).substring(7).toUpperCase();
      setSubscription(prev => prev ? { ...prev, referralCode: mockCode } : null);
    } finally {
      setReferralLoading(false);
    }
  };

  const applyReferralCode = async () => {
    if (!referralCode.trim()) return;
    setReferralLoading(true);
    try {
      setTimeout(() => {
        setReferralMessage('Success! You earned 15 days free subscription!');
        setReferralLoading(false);
      }, 1000);
    } catch (error) {
      setReferralMessage('Failed to apply referral code');
      setReferralLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (subscription?.referralCode) {
      navigator.clipboard.writeText(subscription.referralCode);
    }
  };

  const getDaysRemaining = () => {
    if (!subscription?.planExpiry) return 0;
    const now = new Date();
    const expiry = new Date(subscription.planExpiry);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium_plus': return 'bg-purple-500';
      case 'premium': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${getPlanColor(subscription?.plan || 'free')} text-white`}>
                  {subscription?.plan?.toUpperCase() || 'FREE'}
                </Badge>
                {subscription?.isLocked && (
                  <Badge variant="destructive">LOCKED</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {getDaysRemaining()} days remaining
              </p>
              <p className="text-xs text-muted-foreground">
                Expires: {subscription?.planExpiry ? new Date(subscription.planExpiry).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {PLANS[subscription?.plan as keyof typeof PLANS]?.name || 'Free'}
              </p>
              <p className="text-sm text-muted-foreground">
                ₹{PLANS[subscription?.plan as keyof typeof PLANS]?.price || 0}/month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">Upgrade Plans</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(PLANS).map(([planKey, planData]) => {
              const isCurrentPlan = subscription?.plan === planKey;
              return (
                <Card key={planKey} className={`${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {planData.name}
                      {isCurrentPlan && <Check className="h-5 w-5 text-green-500" />}
                    </CardTitle>
                    <CardDescription>
                      ₹{planData.price}/month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {planData.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      disabled={isCurrentPlan || paymentLoading}
                      onClick={() => handleUpgradePlan(planKey)}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Purchase'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Your Referral Code
              </CardTitle>
              <CardDescription>
                Share this code with friends and earn 15 days free subscription!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription?.referralCode ? (
                <div className="flex items-center gap-2">
                  <Input value={subscription.referralCode} readOnly />
                  <Button onClick={copyReferralCode} variant="outline">
                    Copy
                  </Button>
                </div>
              ) : (
                <Button onClick={generateReferralCode} disabled={referralLoading}>
                  {referralLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate Code'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Apply Referral Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label htmlFor="referralCode">Referral Code</Label>
                <div className="flex gap-2">
                  <Input
                    id="referralCode"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter referral code"
                  />
                  <Button onClick={applyReferralCode} disabled={referralLoading}>
                    Apply
                  </Button>
                </div>
                {referralMessage && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{referralMessage}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}