'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Gift,
    Copy,
    Share2,
    Users,
    CheckCircle,
    Clock,
    TrendingUp,
    QrCode,
    Loader2,
    ExternalLink,
    Award,
    Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import QRCode from 'react-qr-code'

interface Referral {
    id: string
    referralCode: string
    referredDairyName: string
    referredDairyPhone: string
    status: 'PENDING' | 'COMPLETED' | 'REWARDED'
    rewardDays: number
    createdAt: string
    rewardedAt?: string
}

interface ReferralStats {
    totalReferrals: number
    completedReferrals: number
    pendingReferrals: number
    totalRewardDays: number
    currentReferralCode: string
}

export default function ReferralSystem() {
    const [referrals, setReferrals] = useState<Referral[]>([])
    const [stats, setStats] = useState<ReferralStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [sharing, setSharing] = useState(false)
    const [showQR, setShowQR] = useState(false)

    useEffect(() => {
        fetchReferralData()
    }, [])

    const fetchReferralData = async () => {
        try {
            // Simulated data - replace with actual API call
            const mockStats: ReferralStats = {
                totalReferrals: 12,
                completedReferrals: 8,
                pendingReferrals: 4,
                totalRewardDays: 240,
                currentReferralCode: 'DAIRY2026XYZ'
            }

            const mockReferrals: Referral[] = [
                {
                    id: '1',
                    referralCode: 'DAIRY2026XYZ',
                    referredDairyName: 'Shree Krishna Dairy',
                    referredDairyPhone: '9876543210',
                    status: 'REWARDED',
                    rewardDays: 30,
                    createdAt: '2026-01-10',
                    rewardedAt: '2026-01-15'
                },
                {
                    id: '2',
                    referralCode: 'DAIRY2026XYZ',
                    referredDairyName: 'Gauri Dairy Farm',
                    referredDairyPhone: '9876543211',
                    status: 'COMPLETED',
                    rewardDays: 30,
                    createdAt: '2026-01-18'
                },
                {
                    id: '3',
                    referralCode: 'DAIRY2026XYZ',
                    referredDairyName: 'Nandini Dairy',
                    referredDairyPhone: '9876543212',
                    status: 'PENDING',
                    rewardDays: 30,
                    createdAt: '2026-01-22'
                }
            ]

            setStats(mockStats)
            setReferrals(mockReferrals)
        } catch (error) {
            console.error('Error fetching referral data:', error)
            toast.error('Failed to load referral data')
        } finally {
            setLoading(false)
        }
    }

    const copyReferralCode = async () => {
        if (!stats) return

        try {
            await navigator.clipboard.writeText(stats.currentReferralCode)
            toast.success('Referral code copied to clipboard!')
        } catch (error) {
            toast.error('Failed to copy code')
        }
    }

    const shareReferral = async () => {
        if (!stats) return

        setSharing(true)

        const shareData = {
            title: 'Join DigiDhoodh',
            text: `Use my referral code ${stats.currentReferralCode} to get 15 days FREE trial extension on DigiDhoodh - India's best dairy management app!`,
            url: `https://digidhoodh.com/signup?ref=${stats.currentReferralCode}`
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
                toast.success('Shared successfully!')
            } else {
                await navigator.clipboard.writeText(shareData.text + ' ' + shareData.url)
                toast.success('Share link copied to clipboard!')
            }
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                toast.error('Failed to share')
            }
        } finally {
            setSharing(false)
        }
    }

    const shareViaWhatsApp = () => {
        if (!stats) return

        const message = encodeURIComponent(
            `🥛 Join DigiDhoodh - India's best dairy management app!\n\n` +
            `Use my referral code: *${stats.currentReferralCode}*\n\n` +
            `✅ Get 15 days FREE trial extension\n` +
            `✅ Manage milk collection easily\n` +
            `✅ Works offline\n\n` +
            `Download now: https://digidhoodh.com/signup?ref=${stats.currentReferralCode}`
        )

        window.open(`https://wa.me/?text=${message}`, '_blank')
    }

    const getStatusBadge = (status: Referral['status']) => {
        switch (status) {
            case 'REWARDED':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Rewarded</Badge>
            case 'COMPLETED':
                return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>
            case 'PENDING':
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Gift className="w-7 h-7 text-purple-600" />
                        Referral Program
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Refer other dairy owners and earn free subscription days!
                    </p>
                </div>
            </div>

            {/* Reward Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Refer & Earn</h2>
                            <p className="opacity-90">
                                You get <span className="font-bold">30 days FREE</span> •
                                Friend gets <span className="font-bold">15 days FREE</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            className="bg-white text-purple-600 hover:bg-gray-100"
                            onClick={shareViaWhatsApp}
                        >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share via WhatsApp
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Referrals</p>
                                    <p className="text-3xl font-bold mt-1">{stats?.totalReferrals}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Completed</p>
                                    <p className="text-3xl font-bold mt-1 text-green-600">{stats?.completedReferrals}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Pending</p>
                                    <p className="text-3xl font-bold mt-1 text-yellow-600">{stats?.pendingReferrals}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Days Earned</p>
                                    <p className="text-3xl font-bold mt-1 text-blue-600">{stats?.totalRewardDays}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Award className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Referral Code Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Referral Code</CardTitle>
                    <CardDescription>Share this code with other dairy owners</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-xl text-center">
                                    {stats?.currentReferralCode}
                                </div>
                                <Button variant="outline" size="icon" onClick={copyReferralCode}>
                                    <Copy className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={shareReferral} disabled={sharing}>
                                    {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Dialog open={showQR} onOpenChange={setShowQR}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <QrCode className="w-4 h-4 mr-2" />
                                        Show QR Code
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Referral QR Code</DialogTitle>
                                        <DialogDescription>Scan to join with your referral</DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-center p-6">
                                        <div className="bg-white p-4 rounded-lg">
                                            <QRCode
                                                value={`https://digidhoodh.com/signup?ref=${stats?.currentReferralCode}`}
                                                size={200}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-center text-sm text-gray-500">
                                        Code: {stats?.currentReferralCode}
                                    </p>
                                </DialogContent>
                            </Dialog>

                            <Button onClick={shareViaWhatsApp} className="bg-green-600 hover:bg-green-700">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                WhatsApp
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Referral History */}
            <Card>
                <CardHeader>
                    <CardTitle>Referral History</CardTitle>
                    <CardDescription>Track your referrals and rewards</CardDescription>
                </CardHeader>
                <CardContent>
                    {referrals.length === 0 ? (
                        <div className="text-center py-12">
                            <Gift className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">No referrals yet</p>
                            <p className="text-sm text-gray-400 mt-1">Share your code to start earning rewards!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dairy Name</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Reward</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {referrals.map((referral, index) => (
                                        <motion.tr
                                            key={referral.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="border-b"
                                        >
                                            <TableCell className="font-medium">{referral.referredDairyName}</TableCell>
                                            <TableCell>{referral.referredDairyPhone}</TableCell>
                                            <TableCell>{new Date(referral.createdAt).toLocaleDateString('en-IN')}</TableCell>
                                            <TableCell>{getStatusBadge(referral.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-semibold text-green-600">+{referral.rewardDays} days</span>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* How It Works */}
            <Card>
                <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl font-bold text-purple-600">1</span>
                            </div>
                            <h3 className="font-semibold mb-2">Share Your Code</h3>
                            <p className="text-sm text-gray-500">
                                Share your unique referral code with other dairy owners via WhatsApp or any platform
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl font-bold text-blue-600">2</span>
                            </div>
                            <h3 className="font-semibold mb-2">Friend Signs Up</h3>
                            <p className="text-sm text-gray-500">
                                When they sign up using your code and subscribe to any plan
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-xl font-bold text-green-600">3</span>
                            </div>
                            <h3 className="font-semibold mb-2">Both Get Rewarded</h3>
                            <p className="text-sm text-gray-500">
                                You get 30 days free, your friend gets 15 days free trial extension
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
