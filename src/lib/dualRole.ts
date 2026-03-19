// Dual Role System for DigiDhoodh
// A farmer can also be a buyer and vice versa

export type UserRole = 'PLATFORM_SUPER_ADMIN' | 'INTERNAL_SUPER_ADMIN' | 'DAIRY_OWNER' | 'STAFF' | 'FARMER' | 'BUYER';

export interface DualRoleProfile {
    primaryRole: UserRole;
    secondaryRoles: UserRole[];
    activeRole: UserRole;
}

/**
 * Check if user has a specific role (including secondary roles)
 */
export function hasRole(profile: DualRoleProfile | null, role: UserRole): boolean {
    if (!profile) return false;
    if (profile.primaryRole === role) return true;
    return profile.secondaryRoles?.includes(role) || false;
}

/**
 * Check if user has dual roles (both farmer and buyer)
 */
export function isDualRole(profile: DualRoleProfile | null): boolean {
    if (!profile) return false;
    const hasFarmer = profile.primaryRole === 'FARMER' || profile.secondaryRoles?.includes('FARMER');
    const hasBuyer = profile.primaryRole === 'BUYER' || profile.secondaryRoles?.includes('BUYER');
    return hasFarmer && hasBuyer;
}

/**
 * Get the opposite role for switching
 */
export function getAlternateRole(currentRole: UserRole): UserRole | null {
    if (currentRole === 'FARMER') return 'BUYER';
    if (currentRole === 'BUYER') return 'FARMER';
    return null;
}

/**
 * Get dashboard path for given role
 */
export function getRoleDashboardPath(role: UserRole): string {
    switch (role) {
        case 'FARMER': return '/farmer';
        case 'BUYER': return '/buyer';
        case 'DAIRY_OWNER':
        case 'STAFF':
            return '/dashboard';
        case 'PLATFORM_SUPER_ADMIN':
        case 'INTERNAL_SUPER_ADMIN':
            return '/admin';
        default:
            return '/';
    }
}

/**
 * Role display info
 */
export const ROLE_INFO: Record<UserRole, { icon: string; label: { en: string; hi: string }; color: string }> = {
    FARMER: {
        icon: '👨‍🌾',
        label: { en: 'Farmer', hi: 'किसान' },
        color: 'emerald'
    },
    BUYER: {
        icon: '🛒',
        label: { en: 'Buyer', hi: 'खरीदार' },
        color: 'blue'
    },
    DAIRY_OWNER: {
        icon: '🏪',
        label: { en: 'Dairy Owner', hi: 'डेयरी मालिक' },
        color: 'dairy'
    },
    STAFF: {
        icon: '👷',
        label: { en: 'Staff', hi: 'कर्मचारी' },
        color: 'purple'
    },
    PLATFORM_SUPER_ADMIN: {
        icon: '🛡️',
        label: { en: 'Super Admin', hi: 'सुपर एडमिन' },
        color: 'red'
    },
    INTERNAL_SUPER_ADMIN: {
        icon: '🔧',
        label: { en: 'Internal Admin', hi: 'आंतरिक एडमिन' },
        color: 'orange'
    }
};
