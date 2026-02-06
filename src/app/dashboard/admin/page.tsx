'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    LayoutDashboard,
    Building2,
    Users,
    TrendingUp,
    AlertTriangle,
    Search,
    Eye,
    Bell,
    Settings,
    ShieldAlert,
    ArrowUpRight,
    ArrowDownRight,
    Globe
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SuperAdminDashboard() {
    const { i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 1000);
    }, []);

    const stats = [
        { label: 'Total Dairies', value: '1,284', icon: Building2, change: '+12%', trend: 'up' },
        { label: 'Active Farmers', value: '42,500', icon: Users, change: '+5%', trend: 'up' },
        { label: 'Today Milk (L)', value: '840k', icon: TrendingUp, change: '+8%', trend: 'up' },
        { label: 'System Alerts', value: '3', icon: AlertTriangle, change: '-20%', trend: 'down' },
    ];

    const RecentDairies = [
        { name: 'Krishna Dairy', owner: 'Arjun K.', plan: 'PREMIUM_PLUS', status: 'ACTIVE', milk: '4,500L' },
        { name: 'Om Sai Dairy', owner: 'Suresh P.', plan: 'PREMIUM', status: 'ACTIVE', milk: '2,100L' },
        { name: 'Bharat Milk', owner: 'Vijay Y.', plan: 'BASIC', status: 'TRIAL', milk: '450L' },
    ];

    return (
        <div className="space-y-8 p-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                        <ShieldAlert className="w-10 h-10 text-saffron-600" />
                        {isHindi ? 'प्लेटफॉर्म एडमिन कंट्रोल' : 'Platform Super Admin'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        System-wide monitoring and control center
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="rounded-xl h-12">
                        <Bell className="w-5 h-5 mr-2" />
                        System Broadcast
                    </Button>
                    <Button className="bg-saffron-600 hover:bg-saffron-700 text-white rounded-xl h-12 px-6">
                        <Globe className="w-5 h-5 mr-2" />
                        Global Config
                    </Button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="card-premium group hover:border-saffron-300">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-saffron-50 dark:bg-saffron-900/20 rounded-2xl group-hover:scale-110 transition-transform">
                                        <stat.icon className="w-6 h-6 text-saffron-600" />
                                    </div>
                                    <Badge variant="outline" className={stat.trend === 'up' ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'}>
                                        {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                                        {stat.change}
                                    </Badge>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-3xl font-bold mt-1 text-foreground">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Dairies Table */}
                <Card className="lg:col-span-2 border-none shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-white dark:bg-slate-900 border-b border-border">
                        <div className="flex justify-between items-center">
                            <CardTitle>Recent Dairy Subscriptions</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Search dairies..." className="pl-9 h-10 rounded-xl" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 text-xs uppercase tracking-widest font-bold text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4">Dairy Name</th>
                                    <th className="px-6 py-4">Owner</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Today Milk</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {RecentDairies.map((dairy) => (
                                    <tr key={dairy.name} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-bold">{dairy.name}</td>
                                        <td className="px-6 py-4">{dairy.owner}</td>
                                        <td className="px-6 py-4">
                                            <Badge className={
                                                dairy.plan === 'PREMIUM_PLUS' ? 'bg-purple-100 text-purple-700' :
                                                    dairy.plan === 'PREMIUM' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                            }>
                                                {dairy.plan}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 font-mono">{dairy.milk}</td>
                                        <td className="px-6 py-4">
                                            <Button variant="ghost" size="sm" className="rounded-lg gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                                <Eye className="w-4 h-4" />
                                                Impersonate
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 bg-muted/20 text-center">
                            <Button variant="link" className="text-saffron-600 font-bold">View All 1,284 Dairies</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* System Tasks */}
                <Card className="card-premium">
                    <CardHeader>
                        <CardTitle>Global Tasks</CardTitle>
                        <CardDescription>Actions affecting all users</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { label: 'Push App Update v2.4', action: 'Update', color: 'bg-blue-600' },
                            { label: 'Database Maintenance', action: 'Scheduled', color: 'bg-slate-600' },
                            { label: 'System Wide 15% Discount', action: 'Enable', color: 'bg-green-600' },
                            { label: 'Audit Log Analysis', action: 'Run Now', color: 'bg-purple-600' }
                        ].map((task) => (
                            <div key={task.label} className="p-4 rounded-2xl border-2 border-border hover:border-saffron-200 transition-all group">
                                <p className="font-bold text-sm mb-3">{task.label}</p>
                                <Button className={`w-full ${task.color} text-white rounded-xl h-10`}>
                                    {task.action}
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
