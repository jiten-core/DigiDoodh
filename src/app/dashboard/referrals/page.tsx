'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
    Gift,
    Copy,
    Share2,
    Users,
    CheckCircle,
    Clock,
    Calendar,
    Trophy,
    Star,
    Loader2,
    Send,
    MessageCircle,
    Sparkles,
    Crown,
    ChevronRight
} from 'lucide-react';

interface ReferralData {
    referralCode: string;
    totalReferrals: number;
    pendingReferrals: number;
    completedReferrals: number;
    earnedDays: number;
    referrals: Referral[];
}

interface Referral {
    id: string;
    name: string;
    phone: string;
    status: 'PENDING' | 'ACTIVE' | 'EXPIRED';
    registeredAt: string;
    activatedAt?: string;
    daysEarned: number;
}

export default function ReferralsPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ReferralData | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchReferralData();
    }, []);

    const fetchReferralData = async () => {
        try {
            // In production, fetch from API
            await new Promise(resolve => setTimeout(resolve, 1000));
            setData(getDemoData());
        } catch (error) {
            console.error('Error fetching referral data:', error);
            setData(getDemoData());
        } finally {
            setLoading(false);
        }
    };

    const getDemoData = (): ReferralData => ({
        referralCode: 'DAIRY2026',
        totalReferrals: 5,
        pendingReferrals: 2,
        completedReferrals: 3,
        earnedDays: 45,
        referrals: [
            {
                id: '1',
                name: 'Ramesh Kumar',
                phone: '98765***10',
                status: 'ACTIVE',
                registeredAt: '2026-01-10',
                activatedAt: '2026-01-15',
                daysEarned: 15,
            },
            {
                id: '2',
                name: 'Suresh Patel',
                phone: '98765***11',
                status: 'ACTIVE',
                registeredAt: '2026-01-05',
                activatedAt: '2026-01-08',
                daysEarned: 15,
            },
            {
                id: '3',
                name: 'Priya Singh',
                phone: '98765***12',
                status: 'ACTIVE',
                registeredAt: '2025-12-20',
                activatedAt: '2025-12-25',
                daysEarned: 15,
            },
            {
                id: '4',
                name: 'Amit Sharma',
                phone: '98765***13',
                status: 'PENDING',
                registeredAt: '2026-01-20',
                daysEarned: 0,
            },
            {
                id: '5',
                name: 'Vikram Yadav',
                phone: '98765***14',
                status: 'PENDING',
                registeredAt: '2026-01-22',
                daysEarned: 0,
            },
        ],
    });

    const handleCopyCode = () => {
        if (data?.referralCode) {
            navigator.clipboard.writeText(data.referralCode);
            setCopied(true);
            toast.success('Referral code copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        if (data?.referralCode) {
            const shareText = `🥛 Use my referral code "${data.referralCode}" to get 15 extra days FREE on DigiDhoodh!\n\nDownload: https://digidhoodh.com/download\n\n#DigiDhoodh #DairyManagement`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'DigiDhoodh Referral',
                        text: shareText,
                    });
                } catch (error) {
                    // User cancelled
                }
            } else {
                navigator.clipboard.writeText(shareText);
                toast.success('Share text copied to clipboard!');
            }
        }
    };

    const handleShareWhatsApp = () => {
        if (data?.referralCode) {
            const message = encodeURIComponent(
                `🥛 Use my referral code "${data.referralCode}" to get 15 extra days FREE on DigiDhoodh!\n\nDownload: https://digidhoodh.com/download`
            );
            window.open(`https://wa.me/?text=${message}`, '_blank');
        }
    };

    const getStatusBadge = (status: Referral['status']) => {
        switch (status) {
            case 'ACTIVE':
                return { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
            case 'PENDING':
                return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
            case 'EXPIRED':
                return { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
            default:
                return { label: status, color: 'bg-gray-100 text-gray-800' };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading referrals...</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-3">
                    <Gift className="w-8 h-8 text-purple-600" />
                    {t('referrals.referAndEarn', 'Refer & Earn')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Invite friends and earn 15 days FREE for each successful referral!
                </p>
            </div>

            {/* Referral Code Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white overflow-hidden">
                    <CardContent className="p-8 relative">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Crown className="w-6 h-6" />
                                <span className="font-semibold">Your Referral Code</span>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-4">
                                    <span className="text-2xl sm:text-3xl font-bold tracking-wider">{data.referralCode}</span>
                                </div>
                                <Button
                                    onClick={handleCopyCode}
                                    className="h-14 px-5 bg-white text-purple-600 hover:bg-gray-100 rounded-2xl font-semibold flex items-center"
                                >
                                    {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    <span className="ml-2 hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                                </Button>
                            </div>

                            <div className="flex gap-3 w-full">
                                <Button
                                    onClick={handleShare}
                                    variant="outline"
                                    className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30 rounded-xl py-4"
                                >
                                    <Share2 className="w-5 h-5 mr-2" />
                                    Share
                                </Button>
                                <Button
                                    onClick={handleShareWhatsApp}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-4"
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    WhatsApp
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Stats Grid - consistent color system */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="card-premium">
                        <CardContent className="p-4 text-center">
                            <Users className="w-8 h-8 text-dairy-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-foreground">{data.totalReferrals}</p>
                            <p className="text-xs text-muted-foreground">Total Referrals</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="card-premium">
                        <CardContent className="p-4 text-center">
                            <CheckCircle className="w-8 h-8 text-dairy-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-foreground">{data.completedReferrals}</p>
                            <p className="text-xs text-muted-foreground">Active</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="card-premium">
                        <CardContent className="p-4 text-center">
                            <Clock className="w-8 h-8 text-saffron-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-foreground">{data.pendingReferrals}</p>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-4 text-center">
                            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{data.earnedDays}</p>
                            <p className="text-xs text-purple-600 dark:text-purple-400">Days Earned</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* How It Works */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        How It Works
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 font-bold">1</span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Share your referral code</p>
                            <p className="text-sm text-gray-500">Send your code to friends who run dairies</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 font-bold">2</span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">They sign up with your code</p>
                            <p className="text-sm text-gray-500">Your friend registers and starts their free trial</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-purple-600 font-bold">3</span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Both of you earn 15 days FREE!</p>
                            <p className="text-sm text-gray-500">When they subscribe, you both get bonus days added</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Referral History */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-orange-500" />
                        Your Referrals
                    </CardTitle>
                    <CardDescription>Track the status of your referrals</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {data.referrals.map((referral, index) => {
                                const status = getStatusBadge(referral.status);
                                return (
                                    <motion.div
                                        key={referral.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                                                {referral.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{referral.name}</p>
                                                <p className="text-sm text-gray-500">{referral.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {referral.daysEarned > 0 && (
                                                <div className="text-right">
                                                    <p className="font-semibold text-green-600">+{referral.daysEarned} days</p>
                                                </div>
                                            )}
                                            <Badge className={status.color}>{status.label}</Badge>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {data.referrals.length === 0 && (
                            <div className="text-center py-12">
                                <Gift className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No referrals yet</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start sharing your code to earn free days!</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
