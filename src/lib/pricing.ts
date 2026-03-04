/**
 * DigiDhoodh Official Pricing Plans
 * ===================================
 * These are the LOCKED prices from the PRD.
 * DO NOT modify without proper authorization.
 * 
 * All prices include GST.
 * Only Dairy Owner pays - Farmers & Staff are FREE.
 */

export const PRICING_PLANS = {
    BASIC: {
        key: 'BASIC' as const,
        name: 'Basic',
        emoji: '🟩',
        color: 'green',
        monthlyPrice: 199,
        yearlyPrice: 1999,
        effectiveMonthly: 166, // When paid yearly
        maxFarmers: 300,
        maxStaff: 1,
        maxRateCharts: 1,
        editHistoryDays: 30,
        whatsappLimit: 'limited',
        features: [
            'Milk collection (Morning/Evening)',
            'FAT/SNF auto rate calculation',
            '1 rate chart',
            'Farmer ledger',
            'Advance & loan management',
            '10-day / monthly billing',
            'PDF bill generation',
            'WhatsApp (limited)',
            'Offline mode + auto sync',
            'Simple dashboard',
            'Multi-language UI',
            'Farmer login (view only)',
        ],
        notIncluded: [
            'Inventory',
            'Product requests',
            'Unlimited WhatsApp',
            'Advanced reports',
        ],
        bestFor: 'Small village dairies (< 300 farmers)',
    },
    PREMIUM: {
        key: 'PREMIUM' as const,
        name: 'Premium',
        emoji: '🟧',
        color: 'orange',
        badge: '⭐ MOST CHOSEN',
        monthlyPrice: 299,
        yearlyPrice: 2999,
        effectiveMonthly: 249, // When paid yearly
        maxFarmers: 600,
        maxStaff: 3,
        maxRateCharts: -1, // Multiple
        editHistoryDays: 90,
        whatsappLimit: 'unlimited',
        features: [
            'Everything in BASIC',
            'Unlimited WhatsApp notifications',
            'Multiple rate charts',
            'Farmer-specific rates',
            'Staff permission controls',
            'Advanced reports',
            'Faster support',
            'No ads anywhere',
        ],
        notIncluded: [
            'Inventory & product sales',
        ],
        bestFor: 'Growing dairies (300-600 farmers)',
    },
    PREMIUM_PLUS: {
        key: 'PREMIUM_PLUS' as const,
        name: 'Premium+',
        emoji: '🟦',
        color: 'blue',
        monthlyPrice: 599,
        yearlyPrice: 5999,
        effectiveMonthly: 499, // When paid yearly
        maxFarmers: -1, // Unlimited
        maxStaff: -1, // Unlimited
        maxRateCharts: -1, // Unlimited
        editHistoryDays: 365,
        whatsappLimit: 'unlimited',
        features: [
            'Everything in PREMIUM',
            '✅ Inventory management',
            '✅ Farmer product request system',
            '✅ Product sales to farmers',
            '✅ Auto ledger adjustment',
            '✅ GST invoice (optional)',
            '✅ Priority support',
            '✅ Unlimited exports',
        ],
        notIncluded: [],
        bestFor: 'Large dairies & cooperative societies',
    },
} as const;

export type PlanKey = keyof typeof PRICING_PLANS;
export type Plan = typeof PRICING_PLANS[PlanKey];

/**
 * Get plan details by key
 */
export function getPlanByKey(key: PlanKey): Plan {
    return PRICING_PLANS[key];
}

/**
 * Trial period configuration
 */
export const TRIAL_CONFIG = {
    durationDays: 21,
    plan: 'PREMIUM' as PlanKey, // Trial gives PREMIUM features
    noCardRequired: true,
    autoExpires: true,
};

/**
 * Referral program configuration
 */
export const REFERRAL_CONFIG = {
    bonusDaysForReferrer: 30, // Extra 30 days for person who refers
    bonusDaysForReferred: 0, // No extra days for new user (they get standard trial)
    maxReferrals: -1, // Unlimited
};

/**
 * Check if a plan has a specific feature
 */
export function planHasFeature(
    planKey: PlanKey,
    feature: 'inventory' | 'productRequests' | 'gstInvoice' | 'unlimitedWhatsApp'
): boolean {
    const plan = PRICING_PLANS[planKey];

    switch (feature) {
        case 'inventory':
        case 'productRequests':
        case 'gstInvoice':
            return planKey === 'PREMIUM_PLUS';
        case 'unlimitedWhatsApp':
            return planKey === 'PREMIUM' || planKey === 'PREMIUM_PLUS';
        default:
            return false;
    }
}

/**
 * Get plan limits
 */
export function getPlanLimits(planKey: PlanKey) {
    const plan = PRICING_PLANS[planKey];
    return {
        maxFarmers: plan.maxFarmers === -1 ? Infinity : plan.maxFarmers,
        maxStaff: plan.maxStaff === -1 ? Infinity : plan.maxStaff,
        maxRateCharts: plan.maxRateCharts === -1 ? Infinity : plan.maxRateCharts,
        editHistoryDays: plan.editHistoryDays,
    };
}

/**
 * Compare two plans
 * Returns: -1 if planA < planB, 0 if equal, 1 if planA > planB
 */
export function comparePlans(planA: PlanKey, planB: PlanKey): -1 | 0 | 1 {
    const order: Record<PlanKey, number> = {
        BASIC: 1,
        PREMIUM: 2,
        PREMIUM_PLUS: 3,
    };

    if (order[planA] < order[planB]) return -1;
    if (order[planA] > order[planB]) return 1;
    return 0;
}

/**
 * Get upgrade path from current plan
 */
export function getUpgradePath(currentPlan: PlanKey): PlanKey[] {
    switch (currentPlan) {
        case 'BASIC':
            return ['PREMIUM', 'PREMIUM_PLUS'];
        case 'PREMIUM':
            return ['PREMIUM_PLUS'];
        case 'PREMIUM_PLUS':
            return [];
    }
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, period: 'monthly' | 'yearly' = 'monthly'): string {
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    });

    const formatted = formatter.format(amount);
    return `${formatted}${period === 'monthly' ? '/month' : '/year'}`;
}
