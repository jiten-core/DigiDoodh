// DigiDhoodh Design System - Consistent Theming
// This file defines the unified design tokens for the entire app

export const ROLE_THEMES = {
    FARMER: {
        name: 'farmer',
        primary: 'emerald',
        gradient: 'from-emerald-600 to-emerald-900',
        accent: 'emerald-500',
        lightBg: 'emerald-50',
        icon: '👨‍🌾',
        label: {
            en: 'Farmer',
            hi: 'किसान'
        },
        moneyDirection: 'credit', // They RECEIVE money
        milkAction: {
            en: 'Milk Given',
            hi: 'दूध दिया'
        },
        amountLabel: {
            en: 'Amount Dairy Will Pay You',
            hi: 'डेयरी आपको देगी'
        },
        dashboardTitle: {
            en: 'Milk Passbook',
            hi: 'दूध पासबुक'
        }
    },
    BUYER: {
        name: 'buyer',
        primary: 'blue',
        gradient: 'from-blue-600 to-blue-900',
        accent: 'blue-500',
        lightBg: 'blue-50',
        icon: '🛒',
        label: {
            en: 'Buyer',
            hi: 'खरीदार'
        },
        moneyDirection: 'debit', // They PAY money
        milkAction: {
            en: 'Milk Taken',
            hi: 'दूध लिया'
        },
        amountLabel: {
            en: 'Amount You Must Pay',
            hi: 'आपको देना है'
        },
        dashboardTitle: {
            en: 'Purchase History',
            hi: 'खरीद इतिहास'
        }
    },
    DAIRY_OWNER: {
        name: 'dairy',
        primary: 'dairy',
        gradient: 'from-dairy-600 to-dairy-900',
        accent: 'saffron-500',
        lightBg: 'dairy-50',
        icon: '🏪',
        label: {
            en: 'Dairy Owner',
            hi: 'डेयरी मालिक'
        },
        moneyDirection: 'both',
        milkAction: {
            en: 'Milk Collected',
            hi: 'दूध एकत्र'
        },
        amountLabel: {
            en: 'Daily Summary',
            hi: 'दैनिक सारांश'
        },
        dashboardTitle: {
            en: 'Dashboard',
            hi: 'डैशबोर्ड'
        }
    }
} as const;

// Unified UI Components Tokens
export const UI_TOKENS = {
    // Card Styles
    card: {
        base: 'bg-white rounded-2xl shadow-sm border border-neutral-100/50',
        elevated: 'bg-white rounded-3xl shadow-lg border border-neutral-100',
        glass: 'bg-white/10 backdrop-blur-md rounded-xl border border-white/5'
    },

    // Button Styles
    button: {
        primary: 'h-14 rounded-xl font-semibold text-lg shadow-lg',
        secondary: 'h-12 rounded-xl font-medium border-2',
        icon: 'w-12 h-12 rounded-xl'
    },

    // Header Styles
    header: {
        gradient: 'rounded-b-[2.5rem] shadow-xl relative overflow-hidden',
        shape1: 'absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl',
        shape2: 'absolute bottom-[-20%] left-[-10%] w-64 h-64 rounded-full blur-3xl'
    },

    // Transaction Item
    transaction: {
        base: 'p-4 rounded-2xl flex justify-between items-center',
        credit: 'text-emerald-600', // Money coming in
        debit: 'text-red-600' // Money going out
    },

    // Bottom Navigation
    bottomNav: {
        base: 'fixed bottom-6 left-6 right-6',
        container: 'bg-neutral-900/90 backdrop-blur-lg text-white rounded-2xl p-4 shadow-2xl flex justify-around items-center border border-white/10'
    }
} as const;

// Animation Presets
export const ANIMATIONS = {
    fadeInUp: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
    },
    staggerChildren: {
        transition: { staggerChildren: 0.05 }
    },
    scaleOnTap: {
        whileTap: { scale: 0.98 }
    }
} as const;

// Calculation Display (Glass Ledger Transparency)
export const formatCalculationBreakdown = (
    liters: number,
    rate: number,
    fat?: number,
    snf?: number,
    deductions?: { label: string; amount: number }[]
) => {
    const baseAmount = liters * rate;
    const totalDeductions = deductions?.reduce((sum, d) => sum + d.amount, 0) || 0;
    const netAmount = baseAmount - totalDeductions;

    return {
        steps: [
            { label: 'Quantity × Rate', calculation: `${liters}L × ₹${rate}`, result: baseAmount },
            ...(fat ? [{ label: 'FAT', calculation: `${fat}%`, result: null }] : []),
            ...(snf ? [{ label: 'SNF', calculation: `${snf}%`, result: null }] : []),
            ...(deductions?.map(d => ({
                label: d.label,
                calculation: `-₹${d.amount}`,
                result: -d.amount
            })) || [])
        ],
        baseAmount,
        totalDeductions,
        netAmount
    };
};

// Shift Detection (Auto Morning/Evening)
export const getCurrentShift = (): 'Morning' | 'Evening' => {
    const hour = new Date().getHours();
    return hour < 14 ? 'Morning' : 'Evening';
};

// Format Currency (Indian Style)
export const formatINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// Greeting based on time
export const getGreeting = (name: string, lang: 'en' | 'hi' = 'en'): string => {
    const hour = new Date().getHours();
    const greetings = {
        en: {
            morning: `Good Morning, ${name}`,
            afternoon: `Good Afternoon, ${name}`,
            evening: `Good Evening, ${name}`
        },
        hi: {
            morning: `शुभ प्रभात, ${name}`,
            afternoon: `नमस्कार, ${name}`,
            evening: `शुभ संध्या, ${name}`
        }
    };

    if (hour < 12) return greetings[lang].morning;
    if (hour < 17) return greetings[lang].afternoon;
    return greetings[lang].evening;
};
