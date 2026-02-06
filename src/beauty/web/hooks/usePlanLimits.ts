'use client';

import { useAuth } from '@/contexts/AuthContext';
import { PLANS, PLAN_TIER, FeatureKey } from '@/lib/subscription';

export const usePlanLimits = () => {
    const { profile } = useAuth();

    // Default to BASIC if not specified or trial
    const currentPlanId: PLAN_TIER = profile?.dairy?.plan || PLAN_TIER.BASIC;
    const currentPlan = PLANS[currentPlanId] || PLANS[PLAN_TIER.BASIC];

    const hasFeature = (feature: FeatureKey): boolean => {
        return currentPlan.features.includes(feature);
    };

    const isFeatureGated = (feature: FeatureKey): boolean => {
        return !hasFeature(feature);
    };

    const getRemainingFarmers = (currentCount: number) => {
        if (currentPlan.limits.farmers === 'unlimited') return Infinity;
        return Math.max(0, currentPlan.limits.farmers - currentCount);
    };

    const getRemainingStaff = (currentCount: number) => {
        if (currentPlan.limits.staff === 'unlimited') return Infinity;
        return Math.max(0, currentPlan.limits.staff - currentCount);
    };

    const checkLimit = (type: 'farmers' | 'staff', currentCount: number): boolean => {
        const limit = currentPlan.limits[type];
        if (limit === 'unlimited') return true;
        return currentCount < limit;
    };

    return {
        currentPlan,
        currentPlanId,
        hasFeature,
        isFeatureGated,
        getRemainingFarmers,
        getRemainingStaff,
        checkLimit
    };
};
