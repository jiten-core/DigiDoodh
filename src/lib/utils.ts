import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Format currency in Indian format
export function formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount)
}

// Format number in Indian format
export function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-IN').format(num)
}

// Format date
export function formatDate(date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date

    switch (format) {
        case 'full':
            return d.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        case 'long':
            return d.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        default:
            return d.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
    }
}

// Format time
export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
}

// Calculate rate based on FAT and SNF
export function calculateMilkRate(fat: number, snf?: number): number {
    if (!fat) return 35.0

    if (fat >= 4.5 && snf && snf >= 8.5) return 48.0
    if (fat >= 4.0 && snf && snf >= 8.5) return 45.0
    if (fat >= 4.0 && snf && snf >= 8.0) return 42.0
    if (fat >= 3.5 && snf && snf >= 8.0) return 38.0
    if (fat >= 3.0 && snf && snf >= 7.5) return 35.0
    if (fat >= 3.0) return 32.0
    return 28.0
}

// Determine milk quality
export function determineMilkQuality(fat: number, snf?: number): 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' {
    if (!fat) return 'GOOD'

    if (fat >= 4.0 && snf && snf >= 8.5) return 'EXCELLENT'
    if (fat >= 3.5 && snf && snf >= 8.0) return 'GOOD'
    if (fat >= 3.0) return 'AVERAGE'
    return 'POOR'
}

// Generate unique ID
export function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Validate phone number (Indian)
export function isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '')
    return /^[6-9]\d{9}$/.test(cleanPhone)
}

// Validate email
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Validate Aadhar number
export function isValidAadhar(aadhar: string): boolean {
    const cleanAadhar = aadhar.replace(/\D/g, '')
    return /^\d{12}$/.test(cleanAadhar)
}

// Validate GST number
export function isValidGST(gst: string): boolean {
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)
}

// Validate PAN number
export function isValidPAN(pan: string): boolean {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

// Local storage helpers with SSR safety
export const storage = {
    get: <T>(key: string, defaultValue?: T): T | null => {
        if (typeof window === 'undefined') return defaultValue || null
        try {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : defaultValue || null
        } catch {
            return defaultValue || null
        }
    },
    set: (key: string, value: any): void => {
        if (typeof window === 'undefined') return
        try {
            localStorage.setItem(key, JSON.stringify(value))
        } catch (error) {
            console.error('Error saving to localStorage:', error)
        }
    },
    remove: (key: string): void => {
        if (typeof window === 'undefined') return
        localStorage.removeItem(key)
    },
}

// Deep clone object
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

// Capitalize first letter
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Truncate string
export function truncate(str: string, length: number): string {
    return str.length > length ? str.slice(0, length) + '...' : str
}

// Sleep/delay function
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Check if running in PWA mode
export function isPWA(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
}

// Check if online
export function isOnline(): boolean {
    if (typeof window === 'undefined') return true
    return navigator.onLine
}

// Get initials from name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(n => n.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

// Color from string (for avatars)
export function stringToColor(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = hash % 360
    return `hsl(${hue}, 70%, 50%)`
}
