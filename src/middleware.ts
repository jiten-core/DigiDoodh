import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require authentication
const protectedRoutes = [
    '/dashboard',
    '/admin',
]

// Routes only accessible by super admins
const adminRoutes = [
    '/admin',
]

// Routes that should redirect to dashboard if already logged in
const authRoutes = [
    '/auth/login',
    '/auth/signup',
]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Create a Supabase client for the server
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // Check if Supabase is configured (not demo mode)
    const isSupabaseConfigured =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-url') &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your-anon-key')

    // In demo mode, allow access to everything
    if (!isSupabaseConfigured) {
        // For demo mode, still check if trying to access admin without being "demo admin"
        // We'll allow access for demonstration purposes
        return response
    }

    // Get the session
    const { data: { session } } = await supabase.auth.getSession()

    // Check protected routes
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // If on auth route and already logged in, redirect to dashboard
    if (isAuthRoute && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check for demo cookie
    const isDemoUser = request.cookies.get('isDemoUser')?.value === 'true'

    // If on protected route without session, redirect to login (unless demo user)
    if (isProtectedRoute && !session && !isDemoUser) {
        const loginUrl = new URL('/auth/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // For admin routes, check if user is admin
    if (isAdminRoute && session) {
        try {
            const { data: user } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single()

            const isAdmin = user?.role === 'PLATFORM_SUPER_ADMIN' || user?.role === 'INTERNAL_SUPER_ADMIN'

            if (!isAdmin) {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        } catch {
            // If profile check fails, redirect to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
