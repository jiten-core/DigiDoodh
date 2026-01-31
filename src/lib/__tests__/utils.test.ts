// Utility Functions Tests
import {
    formatCurrency,
    formatNumber,
    formatDate,
    calculateMilkRate,
    determineMilkQuality,
    isValidPhone,
    isValidEmail,
    isValidAadhar,
    isValidGST,
    isValidPAN,
    getInitials,
    capitalize,
    truncate,
} from '@/lib/utils'

describe('formatCurrency', () => {
    it('should format INR currency correctly', () => {
        expect(formatCurrency(1000)).toBe('₹1,000')
        expect(formatCurrency(1234567)).toBe('₹12,34,567')
        expect(formatCurrency(99.50)).toBe('₹99.5')
    })

    it('should handle zero and negative values', () => {
        expect(formatCurrency(0)).toBe('₹0')
        expect(formatCurrency(-500)).toBe('-₹500')
    })
})

describe('formatNumber', () => {
    it('should format numbers in Indian format', () => {
        expect(formatNumber(1234567)).toBe('12,34,567')
        expect(formatNumber(1000)).toBe('1,000')
    })
})

describe('formatDate', () => {
    const testDate = new Date('2026-01-25')

    it('should format date in short format', () => {
        const result = formatDate(testDate, 'short')
        expect(result).toContain('25')
        expect(result).toContain('Jan')
    })

    it('should format date in long format', () => {
        const result = formatDate(testDate, 'long')
        expect(result).toContain('25')
        expect(result).toContain('January')
        expect(result).toContain('2026')
    })
})

describe('calculateMilkRate', () => {
    it('should return highest rate for excellent quality', () => {
        expect(calculateMilkRate(4.5, 8.5)).toBe(48.0)
    })

    it('should return appropriate rates for different FAT levels', () => {
        expect(calculateMilkRate(4.0, 8.5)).toBe(45.0)
        expect(calculateMilkRate(4.0, 8.0)).toBe(42.0)
        expect(calculateMilkRate(3.5, 8.0)).toBe(38.0)
        expect(calculateMilkRate(3.0, 7.5)).toBe(35.0)
        expect(calculateMilkRate(3.0)).toBe(32.0)
        expect(calculateMilkRate(2.5)).toBe(28.0)
    })

    it('should return default rate when no FAT provided', () => {
        expect(calculateMilkRate(0)).toBe(35.0)
    })
})

describe('determineMilkQuality', () => {
    it('should return EXCELLENT for high FAT and SNF', () => {
        expect(determineMilkQuality(4.0, 8.5)).toBe('EXCELLENT')
    })

    it('should return GOOD for medium quality', () => {
        expect(determineMilkQuality(3.5, 8.0)).toBe('GOOD')
    })

    it('should return AVERAGE for low-medium quality', () => {
        expect(determineMilkQuality(3.0, 7.0)).toBe('AVERAGE')
    })

    it('should return POOR for low quality', () => {
        expect(determineMilkQuality(2.5, 7.0)).toBe('POOR')
    })
})

describe('isValidPhone', () => {
    it('should validate correct Indian phone numbers', () => {
        expect(isValidPhone('9876543210')).toBe(true)
        expect(isValidPhone('8765432109')).toBe(true)
        expect(isValidPhone('7654321098')).toBe(true)
        expect(isValidPhone('6543210987')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
        expect(isValidPhone('1234567890')).toBe(false) // Starts with 1
        expect(isValidPhone('987654321')).toBe(false) // Too short
        expect(isValidPhone('98765432101')).toBe(false) // Too long
        expect(isValidPhone('abcdefghij')).toBe(false) // Not numbers
    })
})

describe('isValidEmail', () => {
    it('should validate correct emails', () => {
        expect(isValidEmail('test@example.com')).toBe(true)
        expect(isValidEmail('user.name@domain.co.in')).toBe(true)
    })

    it('should reject invalid emails', () => {
        expect(isValidEmail('invalid')).toBe(false)
        expect(isValidEmail('test@')).toBe(false)
        expect(isValidEmail('@domain.com')).toBe(false)
    })
})

describe('isValidAadhar', () => {
    it('should validate 12-digit Aadhar numbers', () => {
        expect(isValidAadhar('123456789012')).toBe(true)
        expect(isValidAadhar('1234 5678 9012')).toBe(true)
    })

    it('should reject invalid Aadhar numbers', () => {
        expect(isValidAadhar('12345678901')).toBe(false) // 11 digits
        expect(isValidAadhar('1234567890123')).toBe(false) // 13 digits
    })
})

describe('isValidGST', () => {
    it('should validate correct GST numbers', () => {
        expect(isValidGST('22AAAAA0000A1Z5')).toBe(true)
    })

    it('should reject invalid GST numbers', () => {
        expect(isValidGST('INVALID')).toBe(false)
        expect(isValidGST('22AAAAA0000A1Z')).toBe(false)
    })
})

describe('isValidPAN', () => {
    it('should validate correct PAN numbers', () => {
        expect(isValidPAN('ABCDE1234F')).toBe(true)
    })

    it('should reject invalid PAN numbers', () => {
        expect(isValidPAN('INVALID')).toBe(false)
        expect(isValidPAN('12345ABCDE')).toBe(false)
    })
})

describe('getInitials', () => {
    it('should get initials from names', () => {
        expect(getInitials('John Doe')).toBe('JD')
        expect(getInitials('single')).toBe('SI')
        expect(getInitials('Ram Kumar Singh')).toBe('RK')
    })
})

describe('capitalize', () => {
    it('should capitalize first letter', () => {
        expect(capitalize('hello')).toBe('Hello')
        expect(capitalize('WORLD')).toBe('World')
    })
})

describe('truncate', () => {
    it('should truncate long strings', () => {
        expect(truncate('Hello World', 5)).toBe('Hello...')
        expect(truncate('Short', 10)).toBe('Short')
    })
})
