export const getDashboardByRole = (role: string): string => {
    switch (role) {
        case 'FARMER':
            return '/farmer';
        case 'BUYER':
            return '/buyer';
        case 'PLATFORM_SUPER_ADMIN':
            return '/admin';
        case 'INTERNAL_SUPER_ADMIN':
            return '/admin';
        case 'DAIRY_OWNER':
        case 'STAFF':
        default:
            return '/dashboard';
    }
};

export const getRoleDisplayName = (role: string, lang: string = 'en'): string => {
    const roles: Record<string, { en: string; hi: string }> = {
        'DAIRY_OWNER': { en: 'Dairy Owner', hi: 'डेयरी मालिक' },
        'STAFF': { en: 'Staff', hi: 'कर्मचारी' },
        'FARMER': { en: 'Farmer', hi: 'किसान' },
        'BUYER': { en: 'Buyer', hi: 'ग्राहक' },
        'PLATFORM_SUPER_ADMIN': { en: 'Super Admin', hi: 'सुपर एडमिन' }
    };

    return roles[role]?.[lang as 'en' | 'hi'] || role;
};
