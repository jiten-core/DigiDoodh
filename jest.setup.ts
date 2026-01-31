// Jest Setup
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
        auth: {
            signInWithPassword: jest.fn(),
            signOut: jest.fn(),
            getUser: jest.fn(),
        },
    },
    SYNC_STATUS: {
        PENDING: 'PENDING',
        SYNCED: 'SYNCED',
        FAILED: 'FAILED',
    },
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: 'div',
        span: 'span',
        button: 'button',
        tr: 'tr',
    },
    AnimatePresence: ({ children }: any) => children,
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock IndexedDB
const indexedDB = {
    open: jest.fn(),
}
Object.defineProperty(window, 'indexedDB', { value: indexedDB })

// Mock navigator.clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
        readText: jest.fn().mockResolvedValue(''),
    },
})

// Suppress console errors during tests
const originalError = console.error
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            args[0].includes('Warning: ReactDOM.render is no longer supported')
        ) {
            return
        }
        originalError.call(console, ...args)
    }
})

afterAll(() => {
    console.error = originalError
})
