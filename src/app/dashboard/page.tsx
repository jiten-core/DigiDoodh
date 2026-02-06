'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useFinance } from '@/hooks/useFinance'
import { useCollection } from '@/hooks/useCollection'
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
    ArrowRight,
    ShoppingCart
} from 'lucide-react'
import { format } from 'date-fns'
import { supabase, isDemoMode } from '@/lib/supabase'

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
    const isHindi = i18n.language === 'hi'

    // New Modular Hooks (Beauty layer calling Brain)
    const { stats: financeStats, totalPending, fetchDailyStats, fetchTotalPending, loading: financeLoading } = useFinance(profile?.dairy?.id);
    const { entries: milkEntries, farmers, fetchEntries, fetchFarmers, loading: collectionLoading } = useCollection(profile?.dairy?.id);

    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats | null>(null)

    const currentHour = new Date().getHours()
    const greeting = currentHour < 12
        ? (isHindi ? 'सुप्रभात' : 'Good Morning')
        : currentHour < 17
            ? (isHindi ? 'नमस्ते' : 'Good Afternoon')
            : (isHindi ? 'शुभ संध्या' : 'Good Evening')

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (profile?.dairy?.id) {
            setLoading(true);
            Promise.all([
                fetchDailyStats(today),
                fetchTotalPending(),
                fetchFarmers(),
                fetchEntries(today)
            ]).finally(() => setLoading(false));
        }
    }, [profile?.dairy?.id, fetchDailyStats, fetchTotalPending, fetchFarmers, fetchEntries]);

    useEffect(() => {
        if (!financeStats && !milkEntries.length) return;

        const morningMilk = milkEntries.filter(e => e.session === 'morning').reduce((sum, e) => sum + (e.liters || 0), 0);
        const eveningMilk = milkEntries.filter(e => e.session === 'evening').reduce((sum, e) => sum + (e.liters || 0), 0);

        setStats({
            todayCollection: {
                liters: financeStats?.total_liters || 0,
                amount: financeStats?.total_amount || 0,
                change: 0
            },
            totalFarmers: {
                count: farmers.length,
                active: farmers.filter(f => f.active).length
            },
            totalBuyers: { count: 0, active: 0 },
            pendingPayments: {
                amount: totalPending,
                count: 0 // We can calculate this if needed
            },
            monthlyRevenue: { amount: 0, change: 0 },
            morningMilk,
            eveningMilk
        });
    }, [financeStats, milkEntries, totalPending, farmers]);

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


    const isOwner = profile?.role === 'owner' || profile?.role === 'staff' || profile?.permissions?.includes('admin');
    const isFarmer = profile?.role === 'farmer';

    if (loading || financeLoading || collectionLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-dairy-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        {isHindi ? 'लोड हो रहा है...' : 'Loading...'}
                    </p>
                </div>
            </div>
        )
    }

    // --- FARMER VIEW ---
    if (isFarmer) {
        return (
            <div className="space-y-6">
                {/* Farmer Welcome */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-earth-600 to-earth-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Milk className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-2xl md:text-4xl font-display font-bold mb-2">
                            {greeting}, {profile?.name}! 👋
                        </h1>
                        <p className="text-earth-100 text-lg">
                            {isHindi ? 'आपका आज का कुल दूध और बैलेंस' : 'Your milk record and balance for today'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                                <p className="text-earth-100 text-sm mb-1 uppercase tracking-wider font-bold">{isHindi ? 'आपका बैलेंस' : 'Your Balance'}</p>
                                <p className="text-4xl font-bold">₹{(stats?.pendingPayments.amount || 0).toLocaleString()}</p>
                                <p className="text-earth-200 text-xs mt-2 italic">{isHindi ? '* पिछले 10 दिनों का हिसाब' : '* Last 10 days ledger'}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                                <p className="text-earth-100 text-sm mb-1 uppercase tracking-wider font-bold">{isHindi ? 'आज का दूध' : 'Today\'s Milk'}</p>
                                <p className="text-4xl font-bold">{stats?.todayCollection.liters || 0} <span className="text-xl font-normal">Liters</span></p>
                                <p className="text-earth-200 text-xs mt-2">{isHindi ? `सुबह: ${stats?.morningMilk || 0}L | शाम: ${stats?.eveningMilk || 0}L` : `Morning: ${stats?.morningMilk || 0}L | Evening: ${stats?.eveningMilk || 0}L`}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Farmer Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/dashboard/milk">
                        <Card className="hover:border-dairy-500 transition-all cursor-pointer h-full border-2 border-transparent">
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-dairy-100 rounded-2xl flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-dairy-600" />
                                </div>
                                <h3 className="font-bold text-lg">{isHindi ? 'हिसाब देखें' : 'View Ledger'}</h3>
                                <p className="text-sm text-muted-foreground">{isHindi ? 'अपनी पूरी कमाई देखें' : 'Check your total earnings'}</p>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/dashboard/products">
                        <Card className="hover:border-saffron-500 transition-all cursor-pointer h-full border-2 border-transparent">
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-saffron-100 rounded-2xl flex items-center justify-center mb-4">
                                    <ShoppingCart className="w-8 h-8 text-saffron-600" />
                                </div>
                                <h3 className="font-bold text-lg">{isHindi ? 'सामान मंगाएं' : 'Order Goods'}</h3>
                                <p className="text-sm text-muted-foreground">{isHindi ? 'पशु आहार या घी मंगाएं' : 'Order feed or ghee'}</p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Recent Collections for Farmer */}
                <Card className="card-premium">
                    <CardHeader>
                        <CardTitle className="text-xl">{isHindi ? 'हाल का दूध रिकॉर्ड' : 'Recent Milk History'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { date: '21 Jan', shift: 'Evening', qty: 6.5, fat: 4.2, rate: 45, total: 292.5 },
                                { date: '21 Jan', shift: 'Morning', qty: 6.0, fat: 4.0, rate: 43, total: 258 },
                                { date: '20 Jan', shift: 'Evening', qty: 7.2, fat: 4.5, rate: 48, total: 345.6 },
                            ].map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-muted/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-earth-700">
                                            {item.shift.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold">{item.date} - {item.shift}</p>
                                            <p className="text-xs text-muted-foreground">FAT: {item.fat}% | Rate: ₹{item.rate}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">{item.qty}L</p>
                                        <p className="text-dairy-600 font-bold">₹{item.total}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // --- OWNER VIEW (Original with role-checking) ---
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

                {/* Total Buyers - ONLY FOR OWNERS */}
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
                            {milkEntries.slice(0, 5).map((entry: any, index: number) => (
                                <div
                                    key={entry.id || index}
                                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors stagger-item"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="farmer-avatar text-sm">
                                            {entry.farmer?.name?.charAt(0) || 'F'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{entry.farmer?.name || 'Unknown'}</p>
                                            <p className="text-sm text-muted-foreground">{entry.session} • {format(new Date(entry.entry_date), 'HH:mm')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-foreground">{entry.liters} L</p>
                                        <p className="text-sm text-dairy-600 dark:text-dairy-400">₹{entry.amount}</p>
                                    </div>
                                </div>
                            ))}
                            {milkEntries.length === 0 && (
                                <p className="text-center py-10 text-muted-foreground">
                                    {isHindi ? 'आज कोई entry नहीं' : 'No entries yet today'}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )

}
