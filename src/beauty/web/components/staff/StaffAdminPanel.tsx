'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Milk,
    Users,
    IndianRupee,
    FileText,
    ArrowRight,
    TrendingUp,
    Shield,
    Clock,
    Plus,
    UserPlus,
    CreditCard,
    ArrowUpRight,
    BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface StaffAdminPanelProps {
    profile: any;
    isHindi: boolean;
}

export default function StaffAdminPanel({ profile, isHindi }: StaffAdminPanelProps) {
    const permissions = profile?.staff_permissions || {
        milkCollection: { add: true, view: true },
        farmers: { add: true, view: true },
        billing: { generateDraft: true, view: true },
        payments: { record: true, view: true }
    };

    const adminActions = [
        {
            id: 'milk',
            icon: Milk,
            label: isHindi ? 'दूध संग्रहण' : 'Milk Collection',
            description: isHindi ? 'आज का दूध दर्ज करें' : 'Record milk for today',
            href: '/dashboard/milk',
            color: 'bg-blue-500',
            perm: permissions.milkCollection?.add
        },
        {
            id: 'farmers',
            icon: UserPlus,
            label: isHindi ? 'नया किसान' : 'New Farmer',
            description: isHindi ? 'किसान रजिस्टर करें' : 'Register a new farmer',
            href: '/dashboard/farmers',
            color: 'bg-emerald-500',
            perm: permissions.farmers?.add
        },
        {
            id: 'advance',
            icon: IndianRupee,
            label: isHindi ? 'अग्रिम राशि (Advance)' : 'Issue Advance',
            description: isHindi ? 'अग्रिम भुगतान दर्ज करें' : 'Record cash advance',
            href: '/dashboard/billing',
            color: 'bg-orange-500',
            perm: permissions.payments?.record
        },
        {
            id: 'billing',
            icon: FileText,
            label: isHindi ? 'बिल बनाएं' : 'Generate Bills',
            description: isHindi ? 'भुगतान विवरण तैयार करें' : 'Prepare payment drafts',
            href: '/dashboard/billing',
            color: 'bg-indigo-500',
            perm: permissions.billing?.generateDraft
        }
    ].filter(a => a.perm);

    return (
        <div className="space-y-8 animate-page-enter">
            {/* 1. Header & Role Badge */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Shield className="w-8 h-8 text-indigo-600" />
                        {isHindi ? 'स्टाफ एडमिन पैनल' : 'Staff Control Center'}
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">
                        {isHindi ? 'आपकी शिफ्ट: सुबह 6:00 - 10:00' : 'Current Shift: 06:00 AM - 10:00 AM'}
                    </p>
                </div>
                <Badge variant="outline" className="text-xs font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border-indigo-100 py-1.5 px-4 rounded-full">
                    {profile?.role || 'STAFF'} {isHindi ? 'मोड' : 'MODE'}
                </Badge>
            </div>

            {/* 2. Primary Admin Actions Dock */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {adminActions.map((action, i) => (
                    <motion.div
                        key={action.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link href={action.href}>
                            <Card className="group cursor-pointer border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 rounded-[2rem] overflow-hidden">
                                <CardContent className="p-6">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg transition-transform group-hover:scale-110",
                                        action.color
                                    )}>
                                        <action.icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                        {action.label}
                                    </h3>
                                    <p className="text-slate-400 text-sm font-medium mb-4">
                                        {action.description}
                                    </p>
                                    <div className="flex items-center text-xs font-black text-indigo-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all">
                                        Open Action <ArrowRight className="w-4 h-4 ml-2" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* 3. Operational Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Tasks */}
                <Card className="lg:col-span-2 rounded-[2.5rem] border-0 shadow-xl shadow-slate-200/50 p-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-indigo-600" />
                            {isHindi ? 'पेंडिंग कार्य' : 'Shift Tasks'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { task: isHindi ? 'सुबह का दूध संग्रहण' : 'Morning Milk Entry', status: 'In Progress', time: 'Ongoing' },
                            { task: isHindi ? 'बकाया बिल चेक करें' : 'Check Pending Bills', status: 'Pending', time: 'By 10:00 AM' },
                            { task: isHindi ? 'अग्रिम राशि अपडेट' : 'Update Advances', status: 'Completed', time: '07:30 AM' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        item.status === 'Completed' ? "bg-green-500" : item.status === 'In Progress' ? "bg-blue-500 animate-pulse" : "bg-slate-300"
                                    )} />
                                    <div>
                                        <p className="font-bold text-slate-900">{item.task}</p>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{item.time}</p>
                                    </div>
                                </div>
                                <Badge className={cn(
                                    "rounded-lg border-0 font-black text-[10px]",
                                    item.status === 'Completed' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                )}>
                                    {item.status}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Quick Stats Summary */}
                <Card className="rounded-[2.5rem] border-0 shadow-xl shadow-slate-200/50 bg-slate-900 text-white p-2 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
                    <CardHeader>
                        <CardTitle className="text-xl font-black flex items-center gap-2">
                            <BarChart3 className="w-6 h-6" />
                            {isHindi ? 'शिफ्ट सारांश' : 'Shift Stats'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Milk (L)</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black">420.5</span>
                                <span className="text-green-400 text-xs font-bold">+12%</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Farmers Served</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black">28 / 45</span>
                                <span className="text-slate-500 text-xs font-bold tracking-widest">ON TRACK</span>
                            </div>
                        </div>
                        <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black rounded-xl h-12 shadow-xl">
                            {isHindi ? 'शिफ्ट बंद करें' : 'End Shift'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
