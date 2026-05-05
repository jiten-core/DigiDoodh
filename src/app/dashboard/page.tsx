'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'
import {
    Milk,
    Users,
    FileText,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    ShoppingBag,
    Plus,
    Calendar,
    Sun,
    Sunset,
    ArrowRight
} from 'lucide-react'

// Dashboard stats type
interface DashboardStats {
    todayCollection: { liters: number; amount: number; change: number }
    totalFarmers: { count: number; active: number }
    totalBuyers: { count: number; active: number }
    pendingPayments: { amount: number; count: number }
    monthlyRevenue: { amount: number; change: number }
    morningMilk: number
    eveningMilk: number
}

export default function DashboardPage() {
    const { profile } = useAuth()
    const { t, i18n } = useTranslation()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    const isHindi = i18n.language === 'hi'
    const currentHour = new Date().getHours()
    const greeting = currentHour < 12
        ? (isHindi ? 'सुप्रभात' : 'Good Morning')
        : currentHour < 17
            ? (isHindi ? 'नमस्ते' : 'Good Afternoon')
            : (isHindi ? 'शुभ संध्या' : 'Good Evening')

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    const fetchDashboardStats = async () => {
        try {
            // Simulated data - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 500))
            setStats({
                todayCollection: { liters: 1250, amount: 52500, change: 12.5 },
                totalFarmers: { count: 150, active: 142 },
                totalBuyers: { count: 28, active: 25 },
                pendingPayments: { amount: 125000, count: 18 },
                monthlyRevenue: { amount: 1850000, change: 8.3 },
                morningMilk: 780,
                eveningMilk: 470
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const quickActions = [
        {
            icon: Milk,
            label: isHindi ? 'दूध डालें' : 'Add Milk',
            href: '/dashboard/milk',
            color: 'bg-dairy-500',
            description: isHindi ? 'नई दूध entry' : 'New milk entry'
        },
        {
            icon: Users,
            label: isHindi ? 'किसान जोड़ें' : 'Add Farmer',
            href: '/dashboard/farmers',
            color: 'bg-saffron-500',
            description: isHindi ? 'नया किसान register' : 'Register new farmer'
        },
        {
            icon: FileText,
            label: isHindi ? 'बिल बनाएं' : 'Create Bill',
            href: '/dashboard/billing',
            color: 'bg-earth-600',
            description: isHindi ? 'Payment बिल' : 'Payment bill'
        },
        {
            icon: TrendingUp,
            label: isHindi ? 'रिपोर्ट देखें' : 'View Reports',
            href: '/dashboard/reports',
            color: 'bg-dairy-600',
            description: isHindi ? 'Analytics' : 'Analytics'
        }
    ]

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Welcome Banner Skeleton */}
                <div className="bg-gradient-to-r from-dairy-500 to-dairy-600 rounded-3xl p-6 md:p-8 h-[220px]">
                    <Skeleton className="h-10 w-64 bg-white/20 mb-4" />
                    <Skeleton className="h-5 w-48 bg-white/20" />
                </div>
                
                {/* Stats Grid Skeletons */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="card-premium">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex justify-between">
                                    <Skeleton className="w-11 h-11 rounded-xl" />
                                    <Skeleton className="w-14 h-6 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-4 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="card-premium">
                            <CardContent className="p-5 flex items-center gap-4">
                                <Skeleton className="w-12 h-12 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Activity Skeleton */}
                <Card className="card-premium">
                    <CardHeader>
                        <Skeleton className="h-6 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dairy-premium rounded-3xl p-6 md:p-8 text-white shadow-dairy"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
                            {greeting}, {profile?.name?.split(' ')[0] || 'there'}! 👋
                        </h1>
                        <p className="text-white/90">
                            {isHindi
                                ? 'आज आपकी डेयरी का हाल देखें'
                                : "Here's what's happening with your dairy today"
                            }
                        </p>
                    </div>
                    <Link href="/dashboard/milk">
                        <Button
                            className="bg-white text-dairy-700 hover:bg-cream-100 font-bold px-6 py-3 h-auto rounded-xl"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            {isHindi ? 'दूध डालें' : 'Add Milk'}
                        </Button>
                    </Link>
                </div>

                {/* Today's shift summary */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Sun className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-white/70 text-sm">{isHindi ? 'सुबह' : 'Morning'}</p>
                            <p className="text-xl font-bold">{stats?.morningMilk || 0} L</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Sunset className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-white/70 text-sm">{isHindi ? 'शाम' : 'Evening'}</p>
                            <p className="text-xl font-bold">{stats?.eveningMilk || 0} L</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Today's Collection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="card-premium">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-11 h-11 bg-dairy-100 dark:bg-dairy-900/30 rounded-xl flex items-center justify-center">
                                    <Milk className="w-5 h-5 text-dairy-600 dark:text-dairy-400" />
                                </div>
                                <Badge className={`${(stats?.todayCollection.change || 0) >= 0
                                    ? 'bg-dairy-100 text-dairy-700 dark:bg-dairy-900/30 dark:text-dairy-400'
                                    : 'bg-terra-100 text-terra-700 dark:bg-terra-900/30 dark:text-terra-400'
                                    } border-0`}>
                                    {(stats?.todayCollection.change || 0) >= 0
                                        ? <TrendingUp className="w-3 h-3 mr-1" />
                                        : <TrendingDown className="w-3 h-3 mr-1" />
                                    }
                                    {Math.abs(stats?.todayCollection.change || 0)}%
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                                {isHindi ? 'आज का संग्रहण' : "Today's Collection"}
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {stats?.todayCollection.liters.toLocaleString()} L
                            </p>
                            <p className="text-sm text-dairy-600 dark:text-dairy-400 font-medium mt-1">
                                ₹{stats?.todayCollection.amount.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Total Farmers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="card-premium">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-11 h-11 bg-saffron-100 dark:bg-saffron-900/30 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-saffron-600 dark:text-saffron-400" />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                                {isHindi ? 'कुल किसान' : 'Total Farmers'}
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {stats?.totalFarmers.count}
                            </p>
                            <p className="text-sm text-saffron-600 dark:text-saffron-400 font-medium mt-1">
                                {stats?.totalFarmers.active} {isHindi ? 'सक्रिय' : 'active'}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Total Buyers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="card-premium">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-11 h-11 bg-earth-100 dark:bg-earth-900/30 rounded-xl flex items-center justify-center">
                                    <ShoppingBag className="w-5 h-5 text-earth-600 dark:text-earth-400" />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                                {isHindi ? 'कुल खरीदार' : 'Total Buyers'}
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                {stats?.totalBuyers.count}
                            </p>
                            <p className="text-sm text-earth-600 dark:text-earth-400 font-medium mt-1">
                                {stats?.totalBuyers.active} {isHindi ? 'सक्रिय' : 'active'}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pending Payments */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="card-premium">
                        <CardContent className="p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-11 h-11 bg-terra-100 dark:bg-terra-900/30 rounded-xl flex items-center justify-center">
                                    <IndianRupee className="w-5 h-5 text-terra-600 dark:text-terra-400" />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                                {isHindi ? 'बकाया भुगतान' : 'Pending Payments'}
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                                ₹{((stats?.pendingPayments.amount || 0) / 1000).toFixed(0)}K
                            </p>
                            <p className="text-sm text-terra-600 dark:text-terra-400 font-medium mt-1">
                                {stats?.pendingPayments.count} {isHindi ? 'बिल' : 'bills'}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card className="card-premium">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-display">
                            {isHindi ? 'त्वरित कार्य' : 'Quick Actions'}
                        </CardTitle>
                        <CardDescription>
                            {isHindi ? 'अक्सर किए जाने वाले काम' : 'Common tasks you can perform'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {quickActions.map((action, index) => (
                                <Link key={action.href} href={action.href}>
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="p-4 rounded-2xl border-2 border-border hover:border-dairy-300 dark:hover:border-dairy-700 transition-all cursor-pointer group"
                                    >
                                        <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                                            <action.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-1">
                                            {action.label}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {action.description}
                                        </p>
                                        <ArrowRight className="w-4 h-4 text-dairy-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <Card className="card-premium">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-display">
                                    {isHindi ? 'हाल की गतिविधि' : 'Recent Activity'}
                                </CardTitle>
                                <CardDescription>
                                    {isHindi ? 'आज की entries' : "Today's entries"}
                                </CardDescription>
                            </div>
                            <Link href="/dashboard/milk">
                                <Button variant="outline" size="sm" className="rounded-xl">
                                    {isHindi ? 'सभी देखें' : 'View All'}
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Sample recent entries */}
                            {[
                                { name: 'रमेश पटेल', time: '08:45 AM', liters: 12.5, amount: 550 },
                                { name: 'सुनीता देवी', time: '07:30 AM', liters: 8.2, amount: 361 },
                                { name: 'अर्जुन सिंह', time: '07:15 AM', liters: 15.0, amount: 660 },
                            ].map((entry, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors stagger-item"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="farmer-avatar text-sm">
                                            {entry.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{entry.name}</p>
                                            <p className="text-sm text-muted-foreground">{entry.time}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-foreground">{entry.liters} L</p>
                                        <p className="text-sm text-dairy-600 dark:text-dairy-400">₹{entry.amount}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
