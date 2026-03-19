
export enum PLAN_TIER {
    FREE = 'free',
    BASIC = 'basic',
    PREMIUM = 'premium',
    PREMIUM_PLUS = 'premium_plus'
}

export type FeatureKey =
    | 'milk_collection'
    | 'pdf_bills'
    | 'whatsapp_bills'
    | 'reports'
    | 'staff_management'
    | 'multiple_devices'
    | 'buyer_management'
    | 'smart_analytics';

export const PLANS = {
    [PLAN_TIER.FREE]: {
        name: 'Free Trial',
        price: 0,
        features: ['milk_collection'] as FeatureKey[],
        limits: {
            farmers: 10,
            staff: 0
        }
    },
    [PLAN_TIER.BASIC]: {
        name: 'Basic',
        price: 199,
        features: ['milk_collection', 'pdf_bills', 'whatsapp_bills'] as FeatureKey[],
        limits: {
            farmers: 50,
            staff: 0
        }
    },
    [PLAN_TIER.PREMIUM]: {
        name: 'Premium',
        price: 299,
        features: ['milk_collection', 'pdf_bills', 'whatsapp_bills', 'reports', 'buyer_management'] as FeatureKey[],
        limits: {
            farmers: 200,
            staff: 1
        }
    },
    [PLAN_TIER.PREMIUM_PLUS]: {
        name: 'Premium+',
        price: 599,
        features: ['milk_collection', 'pdf_bills', 'whatsapp_bills', 'reports', 'buyer_management', 'staff_management', 'multiple_devices', 'smart_analytics'] as FeatureKey[],
        limits: {
            farmers: 1000,
            staff: 5
        }
    }
};

export const hasAccess = (plan: PLAN_TIER, feature: FeatureKey): boolean => {
    const planDetails = PLANS[plan] || PLANS[PLAN_TIER.FREE];
    return planDetails.features.includes(feature);
};

export const getPlanLimits = (plan: PLAN_TIER) => {
    return (PLANS[plan] || PLANS[PLAN_TIER.FREE]).limits;
};
