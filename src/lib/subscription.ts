
export enum PLAN_TIER {
    BASIC = 'basic',
    PREMIUM = 'premium',
    PREMIUM_PLUS = 'premium_plus'
}

export type FeatureKey =
    | 'milk_collection'
    | 'pdf_bills'
    | 'whatsapp_bills'
    | 'unlimited_whatsapp'
    | 'reports'
    | 'advanced_reports'
    | 'staff_management'
    | 'buyer_management'
    | 'inventory'
    | 'product_requests'
    | 'hardware_unlock'
    | 'multi_language';

export interface PlanDetails {
    name: string;
    monthlyPrice: number;
    yearlyPriceBase: number;
    features: FeatureKey[];
    limits: {
        farmers: number | 'unlimited';
        staff: number | 'unlimited';
        editHistoryDays: number;
    };
}

export const PLANS: Record<PLAN_TIER, PlanDetails> = {
    [PLAN_TIER.BASIC]: {
        name: 'Basic',
        monthlyPrice: 199,
        yearlyPriceBase: 199 * 12,
        features: ['milk_collection', 'pdf_bills', 'whatsapp_bills', 'multi_language'],
        limits: {
            farmers: 300,
            staff: 1,
            editHistoryDays: 30
        }
    },
    [PLAN_TIER.PREMIUM]: {
        name: 'Premium',
        monthlyPrice: 299,
        yearlyPriceBase: 299 * 12,
        features: ['milk_collection', 'pdf_bills', 'unlimited_whatsapp', 'reports', 'buyer_management', 'multi_language'],
        limits: {
            farmers: 600,
            staff: 3,
            editHistoryDays: 90
        }
    },
    [PLAN_TIER.PREMIUM_PLUS]: {
        name: 'Premium+',
        monthlyPrice: 599,
        yearlyPriceBase: 599 * 12,
        features: [
            'milk_collection',
            'pdf_bills',
            'unlimited_whatsapp',
            'advanced_reports',
            'buyer_management',
            'staff_management',
            'inventory',
            'product_requests',
            'hardware_unlock',
            'multi_language'
        ],
        limits: {
            farmers: 'unlimited',
            staff: 'unlimited',
            editHistoryDays: 365
        }
    }
};

/**
 * Calculates a randomized yearly discount between 15% and 18%.
 * Seed is used to keep the discount consistent for a specific dairy/user.
 */
export const getYearlyDiscountedPrice = (plan: PLAN_TIER, seed: string = 'default') => {
    const base = PLANS[plan].yearlyPriceBase;
    // Simple pseudo-random using seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const randomPercent = 15 + (Math.abs(hash) % 4); // 15, 16, 17, or 18
    const discount = Math.floor(base * (randomPercent / 100));
    return {
        price: base - discount,
        discountPercent: randomPercent,
        savings: discount
    };
};

export const hasAccess = (plan: PLAN_TIER, feature: FeatureKey): boolean => {
    const planDetails = PLANS[plan];
    if (!planDetails) return false;

    // Feature aliases/grouping
    if (feature === 'whatsapp_bills' && planDetails.features.includes('unlimited_whatsapp')) return true;
    if (feature === 'reports' && planDetails.features.includes('advanced_reports')) return true;

    return planDetails.features.includes(feature);
};

export const getPlanLimits = (plan: PLAN_TIER) => {
    return PLANS[plan]?.limits || PLANS[PLAN_TIER.BASIC].limits;
};

