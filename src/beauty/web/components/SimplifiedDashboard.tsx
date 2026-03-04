'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import {
    Milk,
    Users,
    IndianRupee,
    Plus,
    Sun,
    Sunset,
    TrendingUp,
    ArrowRight,
    Clock,
    Wallet,
    ChevronRight,
    Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 🎯 SIMPLIFIED DASHBOARD
// Focus: TODAY's data ONLY
// Philosophy: "What matters RIGHT NOW"

interface TodayStats {
    morningMilk: number
    eveningMilk: number
    totalMilk: number
    totalAmount: number
    farmersServed: number
    pendingPayments: number
    recentEntries: Array<{
        id: string
        farmerName: string
        quantity: number
        time: string
        shift: 'morning' | 'evening'
    }>
}

export default function SimplifiedDashboard() {
    const { profile } = useAuth()
    const { t, i18n } = useTranslation()
    const [stats, setStats] = useState<TodayStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())

    const isHindi = i18n.language === 'hi'
    const currentHour = currentTime.getHours()
    const currentShift = currentHour < 12 ? 'morning' : 'evening'

    const greeting = currentHour < 12
        ? (isHindi ? 'सुप्रभात' : 'Good Morning')
        : currentHour < 17
            ? (isHindi ? 'नमस्ते' : 'Good Afternoon')
            : (isHindi ? 'शुभ संध्या' : 'Good Evening')

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        fetchTodayStats()
    }, [])

    const fetchTodayStats = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300))
            setStats({
                morningMilk: 780,
                eveningMilk: 0, // Evening not done yet
                totalMilk: 780,
                totalAmount: 35100,
                farmersServed: 42,
                pendingPayments: 125000,
                recentEntries: [
                    { id: '1', farmerName: 'रामेश पटेल', quantity: 12.5, time: '07:30', shift: 'morning' },
                    { id: '2', farmerName: 'सुरेश कुमार', quantity: 8.0, time: '07:25', shift: 'morning' },
                    { id: '3', farmerName: 'महेश यादव', quantity: 15.0, time: '07:20', shift: 'morning' },
                    { id: '4', farmerName: 'राजेश शर्मा', quantity: 10.5, time: '07:15', shift: 'morning' },
                ]
            })
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-500">{isHindi ? 'लोड हो रहा है...' : 'Loading...'}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-lg mx-auto">
            {/* ⏰ Current Time & Greeting */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                            {greeting}, {profile?.name?.split(' ')[0] || 'there'}! 👋
                        </h1>
                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            {currentTime.toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'short'
                            })}
                        </p>
                    </div>
                    <div className={cn(
                        'px-3 py-2 rounded-full text-sm font-medium flex items-center gap-2',
                        currentShift === 'morning'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    )}>
                        {currentShift === 'morning'
                            ? <><Sun className="w-4 h-4" />{isHindi ? 'सुबह' : 'Morning'}</>
                            : <><Sunset className="w-4 h-4" />{isHindi ? 'शाम' : 'Evening'}</>
                        }
                    </div>
                </div>
            </motion.div>

            {/* 🎯 PRIMARY ACTION: Add Milk */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Link href="/dashboard/milk">
                    <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-green-500/25 active:scale-[0.98] transition-transform cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <Plus className="w-7 h-7" />
                            </div>
                            <Sparkles className="w-6 h-6 opacity-60" />
                        </div>
                        <h2 className="text-2xl font-bold mb-1">
                            {isHindi ? 'दूध एंट्री करें' : 'Add Milk Entry'}
                        </h2>
                        <p className="text-green-100 text-sm">
                            {isHindi
                                ? `${currentShift === 'morning' ? 'सुबह' : 'शाम'} की एंट्री शुरू करें`
                                : `Start ${currentShift} collection`
                            }
                        </p>
                    </div>
                </Link>
            </motion.div>

            {/* 📊 TODAY'S STATS (The Hero) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {/* Stats Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                            {isHindi ? 'आज का दूध संग्रहण' : "Today's Collection"}
                        </h3>
                    </div>

                    {/* Shift Stats */}
                    <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800">
                        <div className="p-5 text-center">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl mx-auto mb-2 flex items-center justify-center">
                                <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">
                                {stats?.morningMilk || 0}
                                <span className="text-lg text-gray-400 ml-1">L</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {isHindi ? 'सुबह' : 'Morning'}
                            </p>
                        </div>
                        <div className="p-5 text-center">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mx-auto mb-2 flex items-center justify-center">
                                <Sunset className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <p className="text-3xl font-black text-gray-900 dark:text-white">
                                {stats?.eveningMilk || 0}
                                <span className="text-lg text-gray-400 ml-1">L</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {isHindi ? 'शाम' : 'Evening'}
                            </p>
                        </div>
                    </div>

                    {/* Total & Amount */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-green-600">
                                {stats?.totalMilk || 0} L
                            </p>
                            <p className="text-xs text-gray-500">{isHindi ? 'कुल दूध' : 'Total Milk'}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center">
                            <p className="text-2xl font-black text-blue-600">
                                ₹{(stats?.totalAmount || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">{isHindi ? 'कुल राशि' : 'Total Amount'}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 🔥 QUICK STATS ROW */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 gap-4"
            >
                <Link href="/dashboard/farmers">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 hover:border-green-300 dark:hover:border-green-700 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-saffron-100 dark:bg-saffron-900/30 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5 text-saffron-600 dark:text-saffron-400" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stats?.farmersServed || 0}
                        </p>
                        <p className="text-xs text-gray-500">
                            {isHindi ? 'किसान आए' : 'Farmers Today'}
                        </p>
                    </div>
                </Link>
                <Link href="/dashboard/billing">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 hover:border-green-300 dark:hover:border-green-700 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ₹{((stats?.pendingPayments || 0) / 1000).toFixed(0)}K
                        </p>
                        <p className="text-xs text-gray-500">
                            {isHindi ? 'बकाया भुगतान' : 'Pending'}
                        </p>
                    </div>
                </Link>
            </motion.div>

            {/* 📝 RECENT ENTRIES (Last 4) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                            {isHindi ? 'हाल की एंट्रीज़' : 'Recent Entries'}
                        </h3>
                        <Link
                            href="/dashboard/milk"
                            className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1"
                        >
                            {isHindi ? 'सब देखें' : 'View All'}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {stats?.recentEntries.slice(0, 4).map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                                        'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                                    )}>
                                        {entry.farmerName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {entry.farmerName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {entry.time} · {entry.shift === 'morning' ? (isHindi ? 'सुबह' : 'AM') : (isHindi ? 'शाम' : 'PM')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {entry.quantity} L
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* 🚀 QUICK ACTIONS */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-4"
            >
                <Link href="/dashboard/reports">
                    <Button variant="outline" className="w-full h-14 rounded-2xl text-sm font-medium">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        {isHindi ? 'रिपोर्ट देखें' : 'View Reports'}
                    </Button>
                </Link>
                <Link href="/dashboard/farmers">
                    <Button variant="outline" className="w-full h-14 rounded-2xl text-sm font-medium">
                        <Users className="w-5 h-5 mr-2" />
                        {isHindi ? 'किसान जोड़ें' : 'Add Farmer'}
                    </Button>
                </Link>
            </motion.div>
        </div>
    )
}
