'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    User,
    Phone,
    Mail,
    Lock,
    Loader2,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Building,
    Sun,
    Moon,
    CheckCircle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { LanguageSwitcherCompact } from '@/components/LanguageSwitcher'

export default function SignupPage() {
    const router = useRouter()
    const { signup, user } = useAuth()
    const { t, i18n } = useTranslation()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        dairyName: '',
    })

    useEffect(() => {
        setMounted(true)
    }, [])

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/dashboard')
        }
    }, [user, router])

    const isHindi = i18n.language === 'hi'

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setError('')
    }

    const validateStep1 = () => {
        if (!formData.name.trim()) {
            setError(isHindi ? 'कृपया अपना नाम दर्ज करें' : 'Please enter your name')
            return false
        }
        if (!formData.phone || formData.phone.length < 10) {
            setError(isHindi ? 'कृपया सही फोन नंबर दर्ज करें' : 'Please enter a valid phone number')
            return false
        }
        return true
    }

    const validateStep2 = () => {
        if (!formData.email || !formData.email.includes('@')) {
            setError(isHindi ? 'कृपया सही ईमेल दर्ज करें' : 'Please enter a valid email')
            return false
        }
        if (!formData.password || formData.password.length < 6) {
            setError(isHindi ? 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए' : 'Password must be at least 6 characters')
            return false
        }
        if (!formData.dairyName.trim()) {
            setError(isHindi ? 'कृपया डेयरी का नाम दर्ज करें' : 'Please enter your dairy name')
            return false
        }
        return true
    }

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateStep2()) return

        setLoading(true)
        setError('')

        const result = await signup(formData.email, formData.password, {
            name: formData.name,
            phone: formData.phone,
            dairyName: formData.dairyName,
        })

        if (result.success) {
            setSuccess(true)
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        } else {
            setError(result.error || (isHindi ? 'साइन अप विफल' : 'Signup failed'))
        }

        setLoading(false)
    }

    // Demo signup
    const handleDemoSignup = () => {
        router.push('/dashboard')
    }

    if (success) {
        return (
            <div className="min-h-screen bg-milk-texture dark:bg-background flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 bg-dairy-100 dark:bg-dairy-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-success-pop">
                        <CheckCircle className="w-10 h-10 text-dairy-500" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                        {isHindi ? 'स्वागत है! 🎉' : 'Welcome Aboard! 🎉'}
                    </h2>
                    <p className="text-muted-foreground">
                        {isHindi ? 'आपका खाता बन गया है' : 'Your account has been created'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        {isHindi ? 'Dashboard पर redirect हो रहे हैं...' : 'Redirecting to dashboard...'}
                    </p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-milk-texture dark:bg-background flex items-center justify-center p-4 bg-organic-pattern">
            {/* Background decorations */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-saffron-200/30 dark:bg-saffron-800/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-dairy-200/20 dark:bg-dairy-800/10 rounded-full blur-3xl" />

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
                                {isHindi ? 'नया खाता बनाएं' : 'Create Account'}
                            </h1>
                            <p className="text-muted-foreground">
                                {isHindi ? 'DigiDhoodh से जुड़ें' : 'Join DigiDhoodh today'}
                            </p>
                        </div>

                        {/* Step indicator */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-dairy-500 text-white' : 'bg-muted text-muted-foreground'
                                }`}>
                                1
                            </div>
                            <div className={`w-12 h-1 rounded ${step >= 2 ? 'bg-dairy-500' : 'bg-muted'}`} />
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-dairy-500 text-white' : 'bg-muted text-muted-foreground'
                                }`}>
                                2
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="mb-6 rounded-xl">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="name" className="text-foreground font-medium">
                                        {isHindi ? 'आपका नाम' : 'Your Name'} *
                                    </Label>
                                    <div className="relative mt-2">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            type="text"
                                            placeholder={isHindi ? 'राजेश कुमार' : 'Rajesh Kumar'}
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="pl-12 h-14 rounded-xl border-2 focus:border-dairy-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="phone" className="text-foreground font-medium">
                                        {isHindi ? 'फोन नंबर' : 'Phone Number'} *
                                    </Label>
                                    <div className="relative mt-2">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                                            +91
                                        </span>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="9876543210"
                                            value={formData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="pl-14 h-14 text-lg rounded-xl border-2 focus:border-dairy-500"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleNext}
                                    className="btn-dairy w-full mt-6"
                                >
                                    {isHindi ? 'आगे बढ़ें' : 'Continue'}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </motion.div>
                        )}

                        {/* Step 2: Account Details */}
                        {step === 2 && (
                            <motion.form
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onSubmit={handleSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="email" className="text-foreground font-medium">
                                        {isHindi ? 'ईमेल' : 'Email'} *
                                    </Label>
                                    <div className="relative mt-2">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="pl-12 h-14 rounded-xl border-2 focus:border-dairy-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="password" className="text-foreground font-medium">
                                        {isHindi ? 'पासवर्ड' : 'Password'} *
                                    </Label>
                                    <div className="relative mt-2">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            className="pl-12 h-14 rounded-xl border-2 focus:border-dairy-500 pr-12"
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

                                <div>
                                    <Label htmlFor="dairyName" className="text-foreground font-medium">
                                        {isHindi ? 'डेयरी का नाम' : 'Dairy Name'} *
                                    </Label>
                                    <div className="relative mt-2">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                        <Input
                                            id="dairyName"
                                            type="text"
                                            placeholder={isHindi ? 'श्री गणेश डेयरी' : 'Shri Ganesh Dairy'}
                                            value={formData.dairyName}
                                            onChange={(e) => handleChange('dairyName', e.target.value)}
                                            className="pl-12 h-14 rounded-xl border-2 focus:border-dairy-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1 h-14 rounded-xl border-2"
                                    >
                                        <ArrowLeft className="w-5 h-5 mr-2" />
                                        {isHindi ? 'पीछे' : 'Back'}
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="btn-dairy flex-1"
                                    >
                                        {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                                        {isHindi ? 'खाता बनाएं' : 'Create Account'}
                                    </Button>
                                </div>
                            </motion.form>
                        )}

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

                        {/* Demo */}
                        <Button
                            variant="outline"
                            onClick={handleDemoSignup}
                            className="w-full h-14 rounded-xl border-2 font-medium hover:bg-saffron-50 hover:border-saffron-500 dark:hover:bg-saffron-900/20"
                        >
                            <span className="mr-2">🎯</span>
                            {isHindi ? 'Demo देखें' : 'Try Demo'}
                        </Button>

                        {/* Login link */}
                        <p className="text-center mt-6 text-muted-foreground">
                            {isHindi ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
                            <Link href="/auth/login" className="text-dairy-600 dark:text-dairy-400 font-semibold hover:underline">
                                {isHindi ? 'लॉगिन करें' : 'Sign In'}
                            </Link>
                        </p>
                    </CardContent>
                </Card>

                {/* Footer */}
                <p className="text-center mt-6 text-sm text-muted-foreground">
                    {isHindi ? 'साइन अप करके आप हमारी शर्तों से सहमत हैं' : 'By signing up, you agree to our Terms & Conditions'}
                </p>
            </motion.div>
        </div>
    )
}
