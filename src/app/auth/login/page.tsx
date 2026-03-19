'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Phone, Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, Sun, Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { LanguageSwitcherCompact } from '@/components/LanguageSwitcher'
import { getDashboardByRole } from '@/lib/roleUtils'

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectUrl = searchParams?.get('redirect') || '/dashboard'
    const { login, loginWithPhone, verifyOTP, loginAsDemo, loginAsFarmer, loginAsBuyer, user, profile } = useAuth()
    const { t, i18n } = useTranslation()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone')

    const [phone, setPhone] = useState('')
    const [otp, setOtp] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        setMounted(true)
    }, [])

    // Redirect if already logged in with role check
    useEffect(() => {
        if (user && profile) {
            const explicitRedirect = searchParams?.get('redirect');
            const rolePath = getDashboardByRole(profile.role);
            router.push(explicitRedirect || rolePath);
        }
    }, [user, profile, router, searchParams])

    const isHindi = i18n.language === 'hi'

    const handleSendOTP = async () => {
        if (!phone || phone.length < 10) {
            setError(isHindi ? 'कृपया सही फोन नंबर दर्ज करें' : 'Please enter a valid phone number')
            return
        }

        setLoading(true)
        setError('')

        const result = await loginWithPhone(phone)

        if (result.success) {
            setOtpSent(true)
        } else {
            setError(result.error || (isHindi ? 'OTP भेजने में विफल' : 'Failed to send OTP'))
        }

        setLoading(false)
    }

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 6) {
            setError(isHindi ? 'कृपया सही OTP दर्ज करें' : 'Please enter a valid OTP')
            return
        }

        setLoading(true)
        setError('')

        const result = await verifyOTP(phone, otp)

        if (result.success) {
            router.push(redirectUrl)
        } else {
            setError(result.error || (isHindi ? 'OTP verify करने में विफल' : 'Failed to verify OTP'))
        }

        setLoading(false)
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            setError(isHindi ? 'कृपया ईमेल और पासवर्ड दर्ज करें' : 'Please enter email and password')
            return
        }

        setLoading(true)
        setError('')

        const result = await login(email, password)

        if (result.success) {
            router.push(redirectUrl)
        } else {
            setError(result.error || (isHindi ? 'लॉगिन विफल' : 'Login failed'))
        }

        setLoading(false)
    }

    // Demo login for testing
    const handleDemoLogin = async () => {
        setLoading(true)
        try {
            const result = await loginAsDemo()
            if (result.success) {
                router.push(redirectUrl)
            } else {
                setError(result.error || 'Demo login failed')
            }
        } catch (err) {
            setError('Something went wrong')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-milk-texture dark:bg-background flex items-center justify-center p-4 bg-organic-pattern">
            {/* Background decorations */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-dairy-200/30 dark:bg-dairy-800/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-saffron-200/20 dark:bg-saffron-800/10 rounded-full blur-3xl" />

            {/* Top bar */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-dairy-premium rounded-2xl flex items-center justify-center shadow-dairy">
                        <span className="text-xl">🥛</span>
                    </div>
                    <span className="text-lg font-display font-bold text-dairy-700 dark:text-dairy-400">
                        DigiDhoodh
                    </span>
                </Link>

                <div className="flex items-center gap-2">
                    {mounted && (
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2.5 rounded-xl bg-card/80 hover:bg-card transition-colors tap-target"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-5 h-5 text-saffron-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-earth-600" />
                            )}
                        </button>
                    )}
                    <LanguageSwitcherCompact />
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="card-premium border-0 shadow-warm-lg">
                    <CardContent className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
                                {isHindi ? 'स्वागत है! 🙏' : 'Welcome Back! 🙏'}
                            </h1>
                            <p className="text-muted-foreground">
                                {isHindi ? 'अपने खाते में लॉगिन करें' : 'Sign in to your account'}
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="mb-6 rounded-xl">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'phone' | 'email')}>
                            <TabsList className="grid w-full grid-cols-2 mb-6 rounded-xl p-1 bg-muted h-auto">
                                <TabsTrigger
                                    value="phone"
                                    className="rounded-lg py-3 font-medium data-[state=active]:bg-dairy-500 data-[state=active]:text-white"
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    {isHindi ? 'फोन' : 'Phone'}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="email"
                                    className="rounded-lg py-3 font-medium data-[state=active]:bg-dairy-500 data-[state=active]:text-white"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    {isHindi ? 'ईमेल' : 'Email'}
                                </TabsTrigger>
                            </TabsList>

                            {/* Phone Login */}
                            <TabsContent value="phone" className="space-y-4">
                                {!otpSent ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="phone" className="text-foreground font-medium">
                                                {isHindi ? 'फोन नंबर' : 'Phone Number'}
                                            </Label>
                                            <div className="relative mt-2">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                                    +91
                                                </span>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="9876543210"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                    className="pl-14 h-14 text-lg rounded-xl border-2 focus:border-dairy-500"
                                                    maxLength={10}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleSendOTP}
                                            disabled={loading || phone.length < 10}
                                            className="btn-dairy w-full"
                                        >
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            ) : (
                                                <ArrowRight className="w-5 h-5 mr-2" />
                                            )}
                                            {isHindi ? 'OTP भेजें' : 'Send OTP'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-center p-4 bg-dairy-50 dark:bg-dairy-900/20 rounded-xl">
                                            <p className="text-sm text-muted-foreground">
                                                {isHindi ? 'OTP भेजा गया' : 'OTP sent to'}
                                            </p>
                                            <p className="font-bold text-foreground">+91 {phone}</p>
                                        </div>
                                        <div>
                                            <Label htmlFor="otp" className="text-foreground font-medium">
                                                {isHindi ? 'OTP दर्ज करें' : 'Enter OTP'}
                                            </Label>
                                            <Input
                                                id="otp"
                                                type="text"
                                                placeholder="123456"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="mt-2 h-14 text-2xl text-center tracking-[0.5em] rounded-xl border-2 focus:border-dairy-500"
                                                maxLength={6}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleVerifyOTP}
                                            disabled={loading || otp.length < 6}
                                            className="btn-dairy w-full"
                                        >
                                            {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                                            {isHindi ? 'Verify करें' : 'Verify OTP'}
                                        </Button>
                                        <button
                                            onClick={() => { setOtpSent(false); setOtp(''); }}
                                            className="w-full text-center text-muted-foreground hover:text-foreground py-2"
                                        >
                                            {isHindi ? 'नंबर बदलें' : 'Change number'}
                                        </button>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Email Login */}
                            <TabsContent value="email">
                                <form onSubmit={handleEmailLogin} className="space-y-4">
                                    <div>
                                        <Label htmlFor="email" className="text-foreground font-medium">
                                            {isHindi ? 'ईमेल' : 'Email'}
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="mt-2 h-14 rounded-xl border-2 focus:border-dairy-500"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="password" className="text-foreground font-medium">
                                            {isHindi ? 'पासवर्ड' : 'Password'}
                                        </Label>
                                        <div className="relative mt-2">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="h-14 rounded-xl border-2 focus:border-dairy-500 pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-dairy w-full"
                                    >
                                        {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                                        {isHindi ? 'लॉगिन करें' : 'Sign In'}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-card px-4 text-sm text-muted-foreground">
                                    {isHindi ? 'या' : 'or'}
                                </span>
                            </div>
                        </div>

                        {/* Demo Login */}
                        <div className="grid grid-cols-3 gap-3">
                            <Button
                                variant="outline"
                                onClick={handleDemoLogin}
                                className="h-14 rounded-xl border-2 font-medium hover:bg-saffron-50 hover:border-saffron-500 dark:hover:bg-saffron-900/20"
                            >
                                <span className="mr-2">🏪</span>
                                {isHindi ? 'डेयरी' : 'Dairy'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    setLoading(true);
                                    const result = await loginAsFarmer();
                                    if (result.success) router.push('/farmer');
                                    else setError('Farmer login failed');
                                    setLoading(false);
                                }}
                                className="h-14 rounded-xl border-2 font-medium hover:bg-green-50 hover:border-green-500 dark:hover:bg-green-900/20"
                            >
                                <span className="mr-2">👨‍🌾</span>
                                {isHindi ? 'किसान' : 'Farmer'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={async () => {
                                    setLoading(true);
                                    const result = await loginAsBuyer();
                                    if (result.success) router.push('/buyer');
                                    else setError('Buyer login failed');
                                    setLoading(false);
                                }}
                                className="h-14 rounded-xl border-2 font-medium hover:bg-blue-50 hover:border-blue-500 dark:hover:bg-blue-900/20"
                            >
                                <span className="mr-2">🛒</span>
                                {isHindi ? 'खरीदार' : 'Buyer'}
                            </Button>
                        </div>

                        {/* Sign up link */}
                        <p className="text-center mt-6 text-muted-foreground">
                            {isHindi ? 'खाता नहीं है?' : "Don't have an account?"}{' '}
                            <Link href="/auth/signup" className="text-dairy-600 dark:text-dairy-400 font-semibold hover:underline">
                                {isHindi ? 'साइन अप करें' : 'Sign Up'}
                            </Link>
                        </p>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center mt-6 text-sm text-muted-foreground">
                    {isHindi ? 'लॉगिन करके आप हमारी शर्तों से सहमत हैं' : 'By signing in, you agree to our Terms & Conditions'}
                </p>
            </motion.div>
        </div>
    )
}
