'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Gift, Users, Calendar, Check, X, AlertCircle, Loader2, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { razorpayPayment } from '@/lib/razorpay';

import { PLANS, PLAN_TIER, getYearlyDiscountedPrice } from '@/lib/subscription';

interface SubscriptionData {
  plan: PLAN_TIER;
  planExpiry: Date;
  isLocked: boolean;
  referralCode?: string;
}

export default function SubscriptionManager() {
  const { profile } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
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
        plan: profile?.dairy?.plan || PLAN_TIER.BASIC,
        planExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isLocked: false,
        referralCode: 'DD' + Math.random().toString(36).substring(7).toUpperCase(),
      });
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = async (planKey: PLAN_TIER) => {
    setPaymentLoading(true);
    try {
      const planData = PLANS[planKey];
      let amount = planData.monthlyPrice;

      if (billingCycle === 'yearly') {
        const discounted = getYearlyDiscountedPrice(planKey, profile?.id || 'demo');
        amount = Math.floor(discounted.price / 12); // Total price for checkout would be discounted.price
        // Actually, Razorpay needs total amount
        const totalAmount = discounted.price;
        await razorpayPayment.openCheckout({
          amount: totalAmount * 100,
          currency: 'INR',
          name: 'DigiDoodh',
          description: `${planData.name} Yearly Subscription`,
          handler: async () => {
            // ... handling
          }
        });
      } else {
        await razorpayPayment.openCheckout({
          amount: amount * 100,
          currency: 'INR',
          name: 'DigiDoodh',
          description: `${planData.name} Monthly Subscription`,
          handler: async () => {
            // ... handling
          },
        });
      }
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
                {PLANS[subscription?.plan as PLAN_TIER]?.name || 'Basic'}
              </p>
              <p className="text-sm text-muted-foreground">
                ₹{PLANS[subscription?.plan as PLAN_TIER]?.monthlyPrice || 0}/month
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


        <TabsContent value="plans" className="space-y-6">
          <div className="flex justify-center mb-8">
            <div className="bg-muted p-1 rounded-xl flex items-center gap-1 border-2 border-border">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-md text-dairy-600' : 'text-muted-foreground'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white shadow-md text-saffron-600' : 'text-muted-foreground'}`}
              >
                Yearly
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-[10px] px-1.5 py-0 h-4">
                  SAVE 15%+
                </Badge>
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[PLAN_TIER.BASIC, PLAN_TIER.PREMIUM, PLAN_TIER.PREMIUM_PLUS].map((planKey) => {
              const planData = PLANS[planKey];
              const isCurrentPlan = subscription?.plan === planKey;
              const yearlyInfo = getYearlyDiscountedPrice(planKey, profile?.id || 'demo');

              return (
                <Card key={planKey} className={`relative overflow-hidden border-2 transition-all hover:shadow-xl ${isCurrentPlan ? 'border-dairy-500 bg-dairy-50/30' : 'border-border'}`}>
                  {planKey === PLAN_TIER.PREMIUM_PLUS && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-saffron-500 text-white text-[10px] font-bold px-8 py-1 rotate-45 translate-x-3 translate-y-3">
                        POPULAR
                      </div>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {planKey === PLAN_TIER.PREMIUM_PLUS ? <Crown className="h-5 w-5 text-saffron-500" /> : <Package className="h-5 w-5 text-dairy-500" />}
                      {planData.name}
                    </CardTitle>
                    <CardDescription className="flex flex-col">
                      <span className="text-3xl font-bold text-foreground">
                        ₹{billingCycle === 'monthly' ? planData.monthlyPrice : Math.floor(yearlyInfo.price / 12)}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </span>
                      {billingCycle === 'yearly' && (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">
                          Billed ₹{yearlyInfo.price.toLocaleString('en-IN')}/year ({yearlyInfo.discountPercent}% OFF)
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-dairy-500" />
                        <span className="font-medium">{planData.limits.farmers === 'unlimited' ? 'Unlimited' : planData.limits.farmers} Farmers</span>
                      </li>
                      {planData.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full h-12 rounded-xl font-bold text-lg ${isCurrentPlan ? 'bg-muted text-muted-foreground' : 'bg-dairy-600 hover:bg-dairy-700 shadow-lg shadow-dairy-100'}`}
                      disabled={isCurrentPlan || paymentLoading}
                      onClick={() => handleUpgradePlan(planKey)}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Upgrade Now'}
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
    </div >
  );
}