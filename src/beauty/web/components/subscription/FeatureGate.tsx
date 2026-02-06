'use client';

import React from 'react';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { FeatureKey, PLANS } from '@/lib/subscription';
import { Lock, Crown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface FeatureGateProps {
    feature: FeatureKey;
    children: React.ReactNode;
    fallback?: 'hidden' | 'disabled' | 'overlay';
}

export function FeatureGate({ feature, children, fallback = 'overlay' }: FeatureGateProps) {
    const { hasFeature, currentPlanId } = usePlanLimits();
    const { i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';

    const hasAccess = hasFeature(feature);

    if (hasAccess) {
        return <>{children}</>;
    }

    if (fallback === 'hidden') {
        return null;
    }

    if (fallback === 'disabled') {
        return (
            <div className="opacity-50 pointer-events-none relative group">
                {children}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
            </div>
        );
    }

    // Default: Overlay with upgrade prompt
    return (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-dairy-200 dark:border-dairy-800 p-4">
            <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 bg-dairy-100 dark:bg-dairy-900 rounded-full flex items-center justify-center mb-4 text-dairy-600">
                    <Crown className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2">
                    {isHindi ? 'यह प्रीमियम फीचर है' : 'Premium Feature'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-[200px]">
                    {isHindi
                        ? 'इस फीचर का उपयोग करने के लिए अपना प्लान अपग्रेड करें।'
                        : 'Upgrade your plan to unlock this feature and more.'}
                </p>
                <Link href="/dashboard/settings?tab=subscription">
                    <Button size="sm" className="bg-dairy-600 hover:bg-dairy-700 text-white rounded-full px-6">
                        {isHindi ? 'अपग्रेड करें' : 'Upgrade Now'}
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </Link>
            </div>
            <div className="opacity-20 pointer-events-none blur-[1px]">
                {children}
            </div>
        </div>
    );
}
