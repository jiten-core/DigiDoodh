/**
 * DigiDhoodh Plan Types
 * 
 * NOTE: The actual pricing constants are in @/lib/pricing.ts
 * This file is for backwards compatibility with legacy code.
 * 
 * OFFICIAL PRICING (GST Included):
 * - BASIC: ₹199/mo or ₹1,999/year
 * - PREMIUM: ₹299/mo or ₹2,999/year (⭐ MOST CHOSEN)
 * - PREMIUM+: ₹599/mo or ₹5,999/year
 */

import { PRICING_PLANS, type PlanKey } from './pricing';

export interface PlanData {
    key: PlanKey;
    name: string;
    emoji: string;
    monthlyPrice: number;
    yearlyPrice: number;
    maxFarmers: number | 'unlimited';
    maxStaff: number | 'unlimited';
    features: string[];
    notIncluded: string[];
}

// Re-export for backwards compatibility
export const PLANS: Record<string, PlanData> = {
    BASIC: {
        key: 'BASIC',
        name: 'Basic',
        emoji: '🟩',
        monthlyPrice: PRICING_PLANS.BASIC.monthlyPrice, // ₹199
        yearlyPrice: PRICING_PLANS.BASIC.yearlyPrice, // ₹1,999
        maxFarmers: PRICING_PLANS.BASIC.maxFarmers, // 300
        maxStaff: PRICING_PLANS.BASIC.maxStaff, // 1
        features: PRICING_PLANS.BASIC.features as unknown as string[],
        notIncluded: PRICING_PLANS.BASIC.notIncluded as unknown as string[],
    },
    PREMIUM: {
        key: 'PREMIUM',
        name: 'Premium',
        emoji: '🟧',
        monthlyPrice: PRICING_PLANS.PREMIUM.monthlyPrice, // ₹299
        yearlyPrice: PRICING_PLANS.PREMIUM.yearlyPrice, // ₹2,999
        maxFarmers: PRICING_PLANS.PREMIUM.maxFarmers, // 600
        maxStaff: PRICING_PLANS.PREMIUM.maxStaff, // 3
        features: PRICING_PLANS.PREMIUM.features as unknown as string[],
        notIncluded: PRICING_PLANS.PREMIUM.notIncluded as unknown as string[],
    },
    PREMIUM_PLUS: {
        key: 'PREMIUM_PLUS',
        name: 'Premium+',
        emoji: '🟦',
        monthlyPrice: PRICING_PLANS.PREMIUM_PLUS.monthlyPrice, // ₹599
        yearlyPrice: PRICING_PLANS.PREMIUM_PLUS.yearlyPrice, // ₹5,999
        maxFarmers: 'unlimited',
        maxStaff: 'unlimited',
        features: PRICING_PLANS.PREMIUM_PLUS.features as unknown as string[],
        notIncluded: [],
    },
};

/**
 * @deprecated Use getPlanByKey from @/lib/pricing instead
 */
export function getPlanDetails(planKey: string): PlanData | null {
    return PLANS[planKey.toUpperCase()] || null;
}

/**
 * Check if user is on a paid plan
 */
export function isPaidPlan(planKey: string): boolean {
    const key = planKey.toUpperCase();
    return key === 'BASIC' || key === 'PREMIUM' || key === 'PREMIUM_PLUS';
}

/**
 * Get plan display name with emoji
 */
export function getPlanDisplayName(planKey: string): string {
    const plan = PLANS[planKey.toUpperCase()];
    if (!plan) return planKey;
    return `${plan.emoji} ${plan.name}`;
}
