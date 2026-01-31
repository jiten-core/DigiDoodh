'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
    Shield,
    Users,
    Building2,
    CreditCard,
    TrendingUp,
    TrendingDown,
    IndianRupee,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Search,
    Filter,
    Download,
    RefreshCw,
    Loader2,
    BarChart3,
    PieChart,
    Globe,
    Server,
    Database,
    Cpu,
    HardDrive,
    Wifi,
    WifiOff,
    UserCheck,
    UserX,
    MoreHorizontal,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Settings,
    FileText,
    ChevronRight,
    DollarSign
} from 'lucide-react';

// Interfaces
interface Dairy {
    id: string;
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    state: string;
    district: string;
    status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'EXPIRED';
    plan: 'BASIC' | 'PREMIUM' | 'PREMIUM_PLUS';
    planExpiresAt: string;
    farmersCount: number;
    staffCount: number;
    lastActiveAt: string;
    createdAt: string;
    revenue: number;
}

interface PlatformStats {
    totalDairies: number;
    activeDairies: number;
    trialDairies: number;
    expiredDairies: number;
    totalFarmers: number;
    totalStaff: number;
    totalRevenue: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
    pendingPayments: number;
    todaySignups: number;
    weekGrowth: number;
}

interface SystemHealth {
    database: { status: 'healthy' | 'warning' | 'error'; latency: number };
    api: { status: 'healthy' | 'warning' | 'error'; uptime: number };
    storage: { status: 'healthy' | 'warning' | 'error'; usage: number; total: number };
    queue: { status: 'healthy' | 'warning' | 'error'; pending: number };
}

interface AuditLog {
    id: string;
    action: string;
    entity: string;
    userId: string;
    userName: string;
    ipAddress: string;
    timestamp: string;
    details?: string;
}

interface Subscription {
    id: string;
    dairyId: string;
    dairyName: string;
    plan: 'BASIC' | 'PREMIUM' | 'PREMIUM_PLUS';
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'TRIAL';
    amount: number;
    startDate: string;
    endDate: string;
    autoRenew: boolean;
}

export default function SuperAdminDashboard() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [dairies, setDairies] = useState<Dairy[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // In production, fetch from API
            // For now, use demo data
            await new Promise(resolve => setTimeout(resolve, 1000));
            setStats(getDemoStats());
            setDairies(getDemoDairies());
            setSubscriptions(getDemoSubscriptions());
            setAuditLogs(getDemoAuditLogs());
            setSystemHealth(getDemoSystemHealth());
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getDemoStats = (): PlatformStats => ({
        totalDairies: 1247,
        activeDairies: 1089,
        trialDairies: 98,
        expiredDairies: 60,
        totalFarmers: 45678,
        totalStaff: 3456,
        totalRevenue: 15678900,
        monthlyRevenue: 2345600,
        activeSubscriptions: 1089,
        pendingPayments: 23,
        todaySignups: 12,
        weekGrowth: 8.5,
    });

    const getDemoDairies = (): Dairy[] => [
        {
            id: '1',
            name: 'Shree Krishna Dairy',
            ownerName: 'Ramesh Patel',
            email: 'ramesh@dairy.com',
            phone: '9876543210',
            state: 'Gujarat',
            district: 'Ahmedabad',
            status: 'ACTIVE',
            plan: 'PREMIUM',
            planExpiresAt: '2026-03-15',
            farmersCount: 156,
            staffCount: 5,
            lastActiveAt: new Date().toISOString(),
            createdAt: '2024-01-15',
            revenue: 29900,
        },
        {
            id: '2',
            name: 'Gau Mata Dairy',
            ownerName: 'Suresh Kumar',
            email: 'suresh@dairy.com',
            phone: '9876543211',
            state: 'Maharashtra',
            district: 'Pune',
            status: 'ACTIVE',
            plan: 'PREMIUM_PLUS',
            planExpiresAt: '2026-06-20',
            farmersCount: 423,
            staffCount: 12,
            lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
            createdAt: '2023-06-10',
            revenue: 71880,
        },
        {
            id: '3',
            name: 'Village Fresh Dairy',
            ownerName: 'Priya Singh',
            email: 'priya@dairy.com',
            phone: '9876543212',
            state: 'Rajasthan',
            district: 'Jaipur',
            status: 'TRIAL',
            plan: 'BASIC',
            planExpiresAt: '2026-02-10',
            farmersCount: 45,
            staffCount: 1,
            lastActiveAt: new Date(Date.now() - 86400000).toISOString(),
            createdAt: '2026-01-20',
            revenue: 0,
        },
        {
            id: '4',
            name: 'Shakti Dairy Farm',
            ownerName: 'Amit Sharma',
            email: 'amit@dairy.com',
            phone: '9876543213',
            state: 'Punjab',
            district: 'Ludhiana',
            status: 'EXPIRED',
            plan: 'BASIC',
            planExpiresAt: '2026-01-01',
            farmersCount: 89,
            staffCount: 2,
            lastActiveAt: new Date(Date.now() - 604800000).toISOString(),
            createdAt: '2024-09-15',
            revenue: 2388,
        },
    ];

    const getDemoSubscriptions = (): Subscription[] => [
        {
            id: '1',
            dairyId: '1',
            dairyName: 'Shree Krishna Dairy',
            plan: 'PREMIUM',
            status: 'ACTIVE',
            amount: 2999,
            startDate: '2025-03-15',
            endDate: '2026-03-15',
            autoRenew: true,
        },
        {
            id: '2',
            dairyId: '2',
            dairyName: 'Gau Mata Dairy',
            plan: 'PREMIUM_PLUS',
            status: 'ACTIVE',
            amount: 5999,
            startDate: '2025-06-20',
            endDate: '2026-06-20',
            autoRenew: true,
        },
    ];

    const getDemoAuditLogs = (): AuditLog[] => [
        {
            id: '1',
            action: 'LOGIN',
            entity: 'User',
            userId: 'u1',
            userName: 'Ramesh Patel',
            ipAddress: '103.45.67.89',
            timestamp: new Date().toISOString(),
            details: 'Successful login from Ahmedabad',
        },
        {
            id: '2',
            action: 'CREATE',
            entity: 'MilkCollection',
            userId: 'u2',
            userName: 'Suresh Kumar',
            ipAddress: '103.45.67.90',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            details: 'Added 25 milk entries',
        },
        {
            id: '3',
            action: 'UPDATE',
            entity: 'Subscription',
            userId: 'system',
            userName: 'System',
            ipAddress: 'internal',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            details: 'Auto-renewed subscription for dairy ID: 2',
        },
        {
            id: '4',
            action: 'EXPORT',
            entity: 'Report',
            userId: 'u1',
            userName: 'Ramesh Patel',
            ipAddress: '103.45.67.89',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            details: 'Exported monthly report as PDF',
        },
    ];

    const getDemoSystemHealth = (): SystemHealth => ({
        database: { status: 'healthy', latency: 45 },
        api: { status: 'healthy', uptime: 99.98 },
        storage: { status: 'healthy', usage: 234, total: 500 },
        queue: { status: 'healthy', pending: 12 },
    });

    const handleSuspendDairy = async (dairyId: string) => {
        if (!confirm('Are you sure you want to suspend this dairy?')) return;
        toast.success('Dairy suspended successfully');
        fetchDashboardData();
    };

    const handleImpersonate = async (dairyId: string) => {
        toast.info('Impersonation mode activated - Opening dairy dashboard...');
        // In production, this would redirect to the dairy's dashboard
    };

    const filteredDairies = dairies.filter(dairy => {
        const matchesSearch = dairy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dairy.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dairy.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || dairy.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: Dairy['status']) => {
        switch (status) {
            case 'ACTIVE':
                return { label: 'Active', color: 'bg-dairy-100 text-dairy-800 dark:bg-dairy-900/30 dark:text-dairy-400 border-dairy-200' };
            case 'TRIAL':
                return { label: 'Trial', color: 'bg-saffron-100 text-saffron-800 dark:bg-saffron-900/30 dark:text-saffron-400 border-saffron-200' };
            case 'SUSPENDED':
                return { label: 'Suspended', color: 'bg-terra-100 text-terra-800 dark:bg-terra-900/30 dark:text-terra-400 border-terra-200' };
            case 'EXPIRED':
                return { label: 'Expired', color: 'bg-earth-100 text-earth-800 dark:bg-earth-900/30 dark:text-earth-400 border-earth-200' };
            default:
                return { label: status, color: 'bg-gray-100 text-gray-800' };
        }
    };

    const getPlanBadge = (plan: Dairy['plan']) => {
        switch (plan) {
            case 'BASIC':
                return { label: '🟩 Basic', color: 'bg-earth-100 text-earth-800 dark:bg-earth-800 dark:text-earth-300 border-earth-200' };
            case 'PREMIUM':
                return { label: '🟧 Premium', color: 'bg-saffron-100 text-saffron-800 dark:bg-saffron-900/30 dark:text-saffron-400 border-saffron-200' };
            case 'PREMIUM_PLUS':
                return { label: '🟦 Premium+', color: 'bg-dairy-100 text-dairy-800 dark:bg-dairy-900/30 dark:text-dairy-400 border-dairy-200' };
            default:
                return { label: plan, color: 'bg-gray-100 text-gray-800' };
        }
    };

    const getHealthIcon = (status: 'healthy' | 'warning' | 'error') => {
        switch (status) {
            case 'healthy':
                return <CheckCircle className="w-5 h-5 text-dairy-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-saffron-500" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-terra-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-dairy-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-milk-texture">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-dairy-800 dark:text-dairy-100 flex items-center gap-3">
                            <Shield className="w-8 h-8 md:w-10 md:h-10 text-saffron-500" />
                            Platform Admin Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor and manage all dairies across the platform
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={fetchDashboardData}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <Card className="card-premium">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Dairies</p>
                                            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalDairies.toLocaleString()}</p>
                                        </div>
                                        <Building2 className="w-8 h-8 text-blue-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <Card className="card-premium">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-green-600 dark:text-green-400">Active Dairies</p>
                                            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeDairies.toLocaleString()}</p>
                                        </div>
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <Card className="card-premium">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Total Farmers</p>
                                            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalFarmers.toLocaleString()}</p>
                                        </div>
                                        <Users className="w-8 h-8 text-purple-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                            <Card className="card-premium">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Monthly Revenue</p>
                                            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">₹{(stats.monthlyRevenue / 100000).toFixed(1)}L</p>
                                        </div>
                                        <DollarSign className="w-8 h-8 text-emerald-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                            <Card className="card-premium">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Today Signups</p>
                                            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.todaySignups}</p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-orange-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                            <Card className="card-premium">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-medium text-pink-600 dark:text-pink-400">Week Growth</p>
                                            <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">+{stats.weekGrowth}%</p>
                                        </div>
                                        <Activity className="w-8 h-8 text-pink-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-lg">
                        <TabsTrigger value="overview" className="rounded-lg">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="dairies" className="rounded-lg">
                            <Building2 className="w-4 h-4 mr-2" />
                            All Dairies
                        </TabsTrigger>
                        <TabsTrigger value="subscriptions" className="rounded-lg">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Subscriptions
                        </TabsTrigger>
                        <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-earth-100 data-[state=active]:text-earth-700 dark:data-[state=active]:bg-earth-900/30 dark:data-[state=active]:text-earth-400">
                            <Server className="w-4 h-4 mr-2" />
                            System Health
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <Card className="card-premium">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 font-display">
                                        <Activity className="w-5 h-5 text-dairy-600" />
                                        Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {auditLogs.slice(0, 5).map((log, index) => (
                                        <div
                                            key={log.id}
                                            className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl stagger-item"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-dairy-100 dark:bg-dairy-900/30 flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-dairy-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-foreground text-sm">
                                                    {log.action} - {log.entity}
                                                </p>
                                                <p className="text-xs text-gray-500">{log.userName} • {log.details}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* System Status */}
                            {systemHealth && (

                                <Card className="card-premium">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 font-display">
                                            <Server className="w-5 h-5 text-saffron-600" />
                                            System Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl stagger-item">
                                            <div className="flex items-center gap-3">
                                                <Database className="w-5 h-5 text-dairy-500" />
                                                <span className="font-medium">Database</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">{systemHealth.database.latency}ms</span>
                                                {getHealthIcon(systemHealth.database.status)}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl stagger-item">
                                            <div className="flex items-center gap-3">
                                                <Globe className="w-5 h-5 text-earth-500" />
                                                <span className="font-medium">API Uptime</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">{systemHealth.api.uptime}%</span>
                                                {getHealthIcon(systemHealth.api.status)}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl stagger-item">
                                            <div className="flex items-center gap-3">
                                                <HardDrive className="w-5 h-5 text-saffron-500" />
                                                <span className="font-medium">Storage</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">{systemHealth.storage.usage}GB / {systemHealth.storage.total}GB</span>
                                                {getHealthIcon(systemHealth.storage.status)}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl stagger-item">
                                            <div className="flex items-center gap-3">
                                                <Cpu className="w-5 h-5 text-terra-500" />
                                                <span className="font-medium">Queue</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">{systemHealth.queue.pending} pending</span>
                                                {getHealthIcon(systemHealth.queue.status)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* All Dairies Tab */}
                    <TabsContent value="dairies" className="mt-6">
                        <Card className="card-premium">
                            <CardHeader className="border-b border-border">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                        <CardTitle className="font-display">All Dairies</CardTitle>
                                        <CardDescription>{filteredDairies.length} of {dairies.length} dairies</CardDescription>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                            <Input
                                                placeholder="Search dairies..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-9 w-64 border-border focus:border-dairy-500 rounded-xl"
                                            />
                                        </div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-3 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-dairy-500"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="ACTIVE">Active</option>
                                            <option value="TRIAL">Trial</option>
                                            <option value="EXPIRED">Expired</option>
                                            <option value="SUSPENDED">Suspended</option>
                                        </select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Dairy</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Farmers</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenue</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {filteredDairies.map((dairy) => {
                                                const status = getStatusBadge(dairy.status);
                                                const plan = getPlanBadge(dairy.plan);
                                                return (
                                                    <tr key={dairy.id} className="hover:bg-muted/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-dairy-premium flex items-center justify-center text-white font-bold shadow-sm">
                                                                    {dairy.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-foreground">{dairy.name}</p>
                                                                    <p className="text-sm text-muted-foreground">{dairy.ownerName}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                            {dairy.district}, {dairy.state}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge className={plan.color}>{plan.label}</Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Badge className={status.color}>{status.label}</Badge>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                                            {dairy.farmersCount}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                                            ₹{dairy.revenue.toLocaleString('en-IN')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleImpersonate(dairy.id)}
                                                                    title="View as dairy"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleSuspendDairy(dairy.id)}
                                                                    className="text-terra-600 hover:text-terra-700"
                                                                    title="Suspend dairy"
                                                                >
                                                                    <UserX className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Subscriptions Tab */}
                    <TabsContent value="subscriptions" className="mt-6">
                        <Card className="card-premium">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 font-display">
                                    <CreditCard className="w-5 h-5 text-dairy-600" />
                                    Active Subscriptions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {subscriptions.map((sub) => {
                                        const plan = getPlanBadge(sub.plan);
                                        return (
                                            <div key={sub.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-dairy-premium flex items-center justify-center shadow-md">
                                                        <CreditCard className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{sub.dairyName}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge className={plan.color}>{plan.label}</Badge>
                                                            <span className="text-sm text-gray-500">
                                                                {sub.autoRenew && '🔄 Auto-renew'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900 dark:text-white">₹{sub.amount}/year</p>
                                                    <p className="text-sm text-gray-500">
                                                        Expires: {new Date(sub.endDate).toLocaleDateString('en-IN')}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* System Health Tab */}
                    <TabsContent value="system" className="mt-6">
                        {systemHealth && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="card-premium text-center">
                                    <CardContent className="p-6">
                                        <Database className="w-12 h-12 text-dairy-600 mx-auto mb-4" />
                                        <h3 className="font-semibold text-lg mb-2">Database</h3>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            {getHealthIcon(systemHealth.database.status)}
                                            <span className="capitalize">{systemHealth.database.status}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Latency: {systemHealth.database.latency}ms</p>
                                    </CardContent>
                                </Card>

                                <Card className="card-premium text-center">
                                    <CardContent className="p-6">
                                        <Globe className="w-12 h-12 text-earth-600 mx-auto mb-4" />
                                        <h3 className="font-semibold text-lg mb-2">API</h3>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            {getHealthIcon(systemHealth.api.status)}
                                            <span className="capitalize">{systemHealth.api.status}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Uptime: {systemHealth.api.uptime}%</p>
                                    </CardContent>
                                </Card>

                                <Card className="card-premium text-center">
                                    <CardContent className="p-6">
                                        <HardDrive className="w-12 h-12 text-saffron-600 mx-auto mb-4" />
                                        <h3 className="font-semibold text-lg mb-2">Storage</h3>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            {getHealthIcon(systemHealth.storage.status)}
                                            <span className="capitalize">{systemHealth.storage.status}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">{systemHealth.storage.usage}GB / {systemHealth.storage.total}GB</p>
                                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-purple-500 rounded-full"
                                                style={{ width: `${(systemHealth.storage.usage / systemHealth.storage.total) * 100}%` }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="card-premium text-center">
                                    <CardContent className="p-6">
                                        <Cpu className="w-12 h-12 text-terra-600 mx-auto mb-4" />
                                        <h3 className="font-semibold text-lg mb-2">Queue</h3>
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            {getHealthIcon(systemHealth.queue.status)}
                                            <span className="capitalize">{systemHealth.queue.status}</span>
                                        </div>
                                        <p className="text-sm text-gray-500">{systemHealth.queue.pending} pending jobs</p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
