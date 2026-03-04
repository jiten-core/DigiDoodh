'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Download,
    Calendar as CalendarIcon,
    FileText,
    DollarSign,
    Milk,
    Users,
    PieChart,
    LineChart,
    Filter,
    RefreshCw,
    Printer,
    Share2,
    Loader2
} from 'lucide-react'
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'

interface ReportData {
    period: string
    milkCollection: {
        totalLiters: number
        avgLitersPerDay: number
        morningLiters: number
        eveningLiters: number
        avgFat: number
        avgSnf: number
        trend: number
    }
    financial: {
        totalRevenue: number
        totalExpenses: number
        netProfit: number
        pendingPayments: number
        trend: number
    }
    farmers: {
        total: number
        active: number
        newThisMonth: number
        topContributors: { name: string; liters: number }[]
    }
    buyers: {
        total: number
        active: number
        totalSales: number
        topBuyers: { name: string; amount: number }[]
    }
    dailyData: { date: string; liters: number; amount: number }[]
}

const PRESET_RANGES = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Last 3 Months', value: '3months' },
    { label: 'Custom', value: 'custom' },
]

export default function ReportsAnalytics() {
    const [loading, setLoading] = useState(true)
    const [reportData, setReportData] = useState<ReportData | null>(null)
    const [selectedRange, setSelectedRange] = useState('30days')
    const [dateRange, setDateRange] = useState({
        from: subDays(new Date(), 30),
        to: new Date(),
    })
    const [activeTab, setActiveTab] = useState('overview')
    const [exporting, setExporting] = useState(false)

    useEffect(() => {
        fetchReportData()
    }, [selectedRange, dateRange])

    const fetchReportData = async () => {
        setLoading(true)
        try {
            // Simulated data - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            const mockData: ReportData = {
                period: format(dateRange.from, 'MMM d') + ' - ' + format(dateRange.to, 'MMM d, yyyy'),
                milkCollection: {
                    totalLiters: 45600,
                    avgLitersPerDay: 1520,
                    morningLiters: 25800,
                    eveningLiters: 19800,
                    avgFat: 4.2,
                    avgSnf: 8.5,
                    trend: 12.5,
                },
                financial: {
                    totalRevenue: 1850000,
                    totalExpenses: 1450000,
                    netProfit: 400000,
                    pendingPayments: 125000,
                    trend: 8.3,
                },
                farmers: {
                    total: 150,
                    active: 142,
                    newThisMonth: 8,
                    topContributors: [
                        { name: 'Ramesh Kumar', liters: 3200 },
                        { name: 'Suresh Patel', liters: 2850 },
                        { name: 'Mahesh Singh', liters: 2600 },
                        { name: 'Dinesh Sharma', liters: 2400 },
                        { name: 'Mukesh Yadav', liters: 2200 },
                    ],
                },
                buyers: {
                    total: 28,
                    active: 25,
                    totalSales: 1650000,
                    topBuyers: [
                        { name: 'Mother Dairy', amount: 450000 },
                        { name: 'Amul Parlor', amount: 380000 },
                        { name: 'Krishna Sweets', amount: 220000 },
                        { name: 'Local Market', amount: 180000 },
                    ],
                },
                dailyData: Array.from({ length: 30 }, (_, i) => ({
                    date: format(subDays(new Date(), 29 - i), 'MMM d'),
                    liters: 1400 + Math.random() * 400,
                    amount: 50000 + Math.random() * 15000,
                })),
            }

            setReportData(mockData)
        } catch (error) {
            console.error('Error fetching report:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async (format: 'pdf' | 'excel') => {
        setExporting(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 2000))
            // In real app, this would trigger download
            alert(`Report exported as ${format.toUpperCase()}`)
        } finally {
            setExporting(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const StatCard = ({
        title,
        value,
        subtitle,
        icon: Icon,
        trend,
        color
    }: {
        title: string
        value: string
        subtitle?: string
        icon: any
        trend?: number
        color: string
    }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="card-premium hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                            <p className="text-2xl font-bold mt-1">{value}</p>
                            {subtitle && (
                                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                            )}
                        </div>
                        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg`}>
                            <Icon className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    {trend !== undefined && (
                        <div className="flex items-center mt-4 pt-4 border-t">
                            <Badge className={trend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                {Math.abs(trend)}%
                            </Badge>
                            <span className="text-xs text-gray-500 ml-2">vs previous period</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto" />
                    <p className="mt-4 text-gray-500">Loading reports...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 className="w-7 h-7 text-blue-600" />
                        Reports & Analytics
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {reportData?.period}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Date Range Selector */}
                    <Select value={selectedRange} onValueChange={setSelectedRange}>
                        <SelectTrigger className="w-40">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PRESET_RANGES.map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                    {range.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={() => fetchReportData()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>

                    <Button variant="outline" onClick={() => handleExport('pdf')} disabled={exporting}>
                        <FileText className="w-4 h-4 mr-2" />
                        PDF
                    </Button>

                    <Button variant="outline" onClick={() => handleExport('excel')} disabled={exporting}>
                        <Download className="w-4 h-4 mr-2" />
                        Excel
                    </Button>

                    <Button>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Total Milk Collection"
                    value={`${reportData?.milkCollection.totalLiters.toLocaleString()} L`}
                    subtitle={`Avg ${reportData?.milkCollection.avgLitersPerDay?.toLocaleString()} L/day`}
                    icon={Milk}
                    trend={reportData?.milkCollection.trend}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(reportData?.financial.totalRevenue || 0)}
                    subtitle={`Net Profit: ${formatCurrency(reportData?.financial.netProfit || 0)}`}
                    icon={DollarSign}
                    trend={reportData?.financial.trend}
                    color="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard
                    title="Active Farmers"
                    value={reportData?.farmers.active.toString() || '0'}
                    subtitle={`${reportData?.farmers.newThisMonth} new this month`}
                    icon={Users}
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                />
                <StatCard
                    title="Pending Payments"
                    value={formatCurrency(reportData?.financial.pendingPayments || 0)}
                    subtitle="Bills to be paid"
                    icon={FileText}
                    color="bg-gradient-to-br from-orange-500 to-orange-600"
                />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid lg:grid-cols-4">
                    <TabsTrigger value="overview" className="flex items-center gap-2">
                        <PieChart className="w-4 h-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="collection" className="flex items-center gap-2">
                        <Milk className="w-4 h-4" />
                        Collection
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Financial
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="flex items-center gap-2">
                        <LineChart className="w-4 h-4" />
                        Trends
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    {/* Overview Tab */}
                    <TabsContent value="overview" className="mt-6">
                        <motion.div
                            key="overview-content"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {/* Morning vs Evening */}
                            <Card className="card-premium">
                                <CardHeader>
                                    <CardTitle>Morning vs Evening Collection</CardTitle>
                                    <CardDescription>Distribution by shift</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium">Morning</span>
                                                <span className="text-sm text-gray-500">
                                                    {reportData?.milkCollection.morningLiters.toLocaleString()} L
                                                    ({Math.round((reportData?.milkCollection.morningLiters || 0) / (reportData?.milkCollection.totalLiters || 1) * 100)}%)
                                                </span>
                                            </div>
                                            <Progress
                                                value={(reportData?.milkCollection.morningLiters || 0) / (reportData?.milkCollection.totalLiters || 1) * 100}
                                                className="h-3"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium">Evening</span>
                                                <span className="text-sm text-gray-500">
                                                    {reportData?.milkCollection.eveningLiters.toLocaleString()} L
                                                    ({Math.round((reportData?.milkCollection.eveningLiters || 0) / (reportData?.milkCollection.totalLiters || 1) * 100)}%)
                                                </span>
                                            </div>
                                            <Progress
                                                value={(reportData?.milkCollection.eveningLiters || 0) / (reportData?.milkCollection.totalLiters || 1) * 100}
                                                className="h-3 [&>div]:bg-purple-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-600">{reportData?.milkCollection.avgFat}%</p>
                                            <p className="text-sm text-gray-500">Avg FAT</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-green-600">{reportData?.milkCollection.avgSnf}%</p>
                                            <p className="text-sm text-gray-500">Avg SNF</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Contributors */}
                            <Card className="card-premium">
                                <CardHeader>
                                    <CardTitle>Top Contributing Farmers</CardTitle>
                                    <CardDescription>Highest milk suppliers this period</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {reportData?.farmers.topContributors.map((farmer, index) => (
                                            <motion.div
                                                key={`farmer-${index}-${farmer.name || 'unknown'}`}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                            ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                    <span className="font-medium">{farmer.name}</span>
                                                </div>
                                                <Badge variant="secondary">{farmer.liters.toLocaleString()} L</Badge>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Revenue Breakdown */}
                            <Card className="card-premium">
                                <CardHeader>
                                    <CardTitle>Revenue Breakdown</CardTitle>
                                    <CardDescription>Income vs Expenses</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium text-green-600">Revenue</span>
                                                <span className="text-sm font-bold">
                                                    {formatCurrency(reportData?.financial.totalRevenue || 0)}
                                                </span>
                                            </div>
                                            <Progress value={100} className="h-3 [&>div]:bg-green-500" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium text-red-600">Expenses</span>
                                                <span className="text-sm font-bold">
                                                    {formatCurrency(reportData?.financial.totalExpenses || 0)}
                                                </span>
                                            </div>
                                            <Progress
                                                value={(reportData?.financial.totalExpenses || 0) / (reportData?.financial.totalRevenue || 1) * 100}
                                                className="h-3 [&>div]:bg-red-500"
                                            />
                                        </div>
                                        <div className="pt-4 border-t">
                                            <div className="flex justify-between">
                                                <span className="text-lg font-semibold">Net Profit</span>
                                                <span className="text-lg font-bold text-green-600">
                                                    {formatCurrency(reportData?.financial.netProfit || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Top Buyers */}
                            <Card className="card-premium">
                                <CardHeader>
                                    <CardTitle>Top Buyers</CardTitle>
                                    <CardDescription>Highest purchase volume</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {reportData?.buyers.topBuyers.map((buyer, index) => (
                                            <motion.div
                                                key={`buyer-${index}-${buyer.name || 'unknown'}`}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                                        {index + 1}
                                                    </div>
                                                    <span className="font-medium">{buyer.name}</span>
                                                </div>
                                                <span className="font-semibold text-green-600">
                                                    {formatCurrency(buyer.amount)}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* Collection Tab */}
                    <TabsContent value="collection" className="mt-6">
                        <motion.div
                            key="collection-content"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card className="card-premium">
                                <CardHeader>
                                    <CardTitle>Daily Collection Chart</CardTitle>
                                    <CardDescription>Milk collection over the selected period</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80 flex items-end gap-1 overflow-x-auto pb-4">
                                        {reportData?.dailyData.map((day, index) => (
                                            <motion.div
                                                key={day.date}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(day.liters / 2000) * 100}%` }}
                                                transition={{ delay: index * 0.02, duration: 0.3 }}
                                                className="flex-1 min-w-[20px] bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg relative group cursor-pointer hover:from-blue-600 hover:to-blue-400 transition-colors"
                                            >
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {day.date}: {Math.round(day.liters)} L
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* Financial Tab */}
                    <TabsContent value="financial" className="mt-6">
                        <motion.div
                            key="financial-content"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
                                    <CardContent className="p-6 text-center">
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Revenue</p>
                                        <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
                                            {formatCurrency(reportData?.financial.totalRevenue || 0)}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200">
                                    <CardContent className="p-6 text-center">
                                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">Total Expenses</p>
                                        <p className="text-3xl font-bold text-red-700 dark:text-red-300 mt-2">
                                            {formatCurrency(reportData?.financial.totalExpenses || 0)}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
                                    <CardContent className="p-6 text-center">
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Net Profit</p>
                                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                                            {formatCurrency(reportData?.financial.netProfit || 0)}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    </TabsContent>

                    {/* Trends Tab */}
                    <TabsContent value="trends" className="mt-6">
                        <motion.div
                            key="trends-content"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card className="card-premium">
                                <CardHeader>
                                    <CardTitle>Collection Trends</CardTitle>
                                    <CardDescription>Amount earned over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80 flex items-end gap-1 overflow-x-auto pb-4">
                                        {reportData?.dailyData.map((day, index) => (
                                            <motion.div
                                                key={day.date}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(day.amount / 70000) * 100}%` }}
                                                transition={{ delay: index * 0.02, duration: 0.3 }}
                                                className="flex-1 min-w-[20px] bg-gradient-to-t from-green-500 to-green-300 rounded-t-lg relative group cursor-pointer hover:from-green-600 hover:to-green-400 transition-colors"
                                            >
                                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {day.date}: ₹{Math.round(day.amount).toLocaleString()}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>
        </div>
    )
}
