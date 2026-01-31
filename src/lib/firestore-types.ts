export interface PlanData {
    name: string;
    price: number;
    features: string[];
}

export const PLANS: Record<string, PlanData> = {
    free: {
        name: 'Free',
        price: 0,
        features: ['Basic Milk Collection', 'Farmer Management', 'Local Reports']
    },
    premium: {
        name: 'Premium',
        price: 499,
        features: ['WhatsApp Notifications', 'Cloud Backup', 'Advanced Analytics', 'Multi-staff Access']
    },
    premium_plus: {
        name: 'Premium Plus',
        price: 999,
        features: ['Custom Branding', 'GST Billing', 'Inventory Management', '24/7 Priority Support']
    }
};
