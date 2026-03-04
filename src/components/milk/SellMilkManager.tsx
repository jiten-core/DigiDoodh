'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
    ShoppingCart,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    User,
    Calendar,
    DollarSign,
    TrendingUp,
    Loader2,
    Package,
    Scale,
    Check,
    X,
    Printer,
    FileText
} from 'lucide-react'

// Sell Milk Entry interface
interface SellMilkEntry {
    id: string
    buyerId: string
    buyerName: string
    date: string
    time: string
    quantity: number
    fat?: number
    snf?: number
    rate: number
    totalAmount: number
    paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL'
    vehicleNumber?: string
    notes?: string
    createdAt: string
}

interface Buyer {
    id: string
    name: string
    phone?: string
    address?: string
}

export default function SellMilkManager() {
    const [loading, setLoading] = useState(true)
    const [entries, setEntries] = useState<SellMilkEntry[]>([])
    const [buyers, setBuyers] = useState<Buyer[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
    const [activeTab, setActiveTab] = useState('today')

    // Form state
    const [formData, setFormData] = useState({
        buyerId: '',
        quantity: '',
        fat: '',
        snf: '',
        rate: '',
        vehicleNumber: '',
        notes: '',
        paymentStatus: 'PENDING' as SellMilkEntry['paymentStatus'],
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500))

            // Demo buyers
            setBuyers([
                { id: '1', name: 'Amul Dairy', phone: '9876543210', address: 'Anand, Gujarat' },
                { id: '2', name: 'Mother Dairy', phone: '9876543211', address: 'Delhi' },
                { id: '3', name: 'Local Shop - Sharma Ji', phone: '9876543212', address: 'Main Market' },
            ])

            // Demo entries
            setEntries([
                {
                    id: '1',
                    buyerId: '1',
                    buyerName: 'Amul Dairy',
                    date: new Date().toISOString().split('T')[0],
                    time: '06:30',
                    quantity: 500,
                    fat: 4.2,
                    snf: 8.5,
                    rate: 52,
                    totalAmount: 26000,
                    paymentStatus: 'PAID',
                    vehicleNumber: 'GJ-05-AB-1234',
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    buyerId: '2',
                    buyerName: 'Mother Dairy',
                    date: new Date().toISOString().split('T')[0],
                    time: '18:00',
                    quantity: 300,
                    fat: 4.0,
                    snf: 8.3,
                    rate: 50,
                    totalAmount: 15000,
                    paymentStatus: 'PENDING',
                    vehicleNumber: 'DL-01-CD-5678',
                    createdAt: new Date().toISOString(),
                },
            ])

        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.buyerId || !formData.quantity || !formData.rate) {
            toast.error('Please fill required fields')
            return
        }

        try {
            const buyer = buyers.find(b => b.id === formData.buyerId)
            const newEntry: SellMilkEntry = {
                id: Date.now().toString(),
                buyerId: formData.buyerId,
                buyerName: buyer?.name || 'Unknown',
                date: dateFilter,
                time: new Date().toTimeString().slice(0, 5),
                quantity: parseFloat(formData.quantity),
                fat: formData.fat ? parseFloat(formData.fat) : undefined,
                snf: formData.snf ? parseFloat(formData.snf) : undefined,
                rate: parseFloat(formData.rate),
                totalAmount: parseFloat(formData.quantity) * parseFloat(formData.rate),
                paymentStatus: formData.paymentStatus,
                vehicleNumber: formData.vehicleNumber,
                notes: formData.notes,
                createdAt: new Date().toISOString(),
            }

            setEntries(prev => [newEntry, ...prev])
            toast.success('Sale entry added!')
            setShowAddModal(false)
            resetForm()

        } catch (error) {
            console.error('Error adding entry:', error)
            toast.error('Failed to add entry')
        }
    }

    const resetForm = () => {
        setFormData({
            buyerId: '',
            quantity: '',
            fat: '',
            snf: '',
            rate: '',
            vehicleNumber: '',
            notes: '',
            paymentStatus: 'PENDING',
        })
    }

    const getPaymentStatusBadge = (status: SellMilkEntry['paymentStatus']) => {
        switch (status) {
            case 'PAID':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Paid</Badge>
            case 'PENDING':
                return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Pending</Badge>
            case 'PARTIAL':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Partial</Badge>
        }
    }

    // Stats
    const todayEntries = entries.filter(e => e.date === dateFilter)
    const stats = {
        totalQuantity: todayEntries.reduce((sum, e) => sum + e.quantity, 0),
        totalAmount: todayEntries.reduce((sum, e) => sum + e.totalAmount, 0),
        totalSales: todayEntries.length,
        pendingAmount: todayEntries.filter(e => e.paymentStatus === 'PENDING').reduce((sum, e) => sum + e.totalAmount, 0),
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-12 h-12 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-blue-600" />
                        Sell Milk
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Record milk sales to buyers, dairies, and vendors
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 text-lg rounded-xl shadow-lg"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Sale Entry
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Today's Sales</p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalSales}</p>
                                </div>
                                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                    <ShoppingCart className="w-7 h-7 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600">Quantity Sold</p>
                                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalQuantity} L</p>
                                </div>
                                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                                    <Scale className="w-7 h-7 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-emerald-600">Total Revenue</p>
                                    <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">₹{stats.totalAmount.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                                    <DollarSign className="w-7 h-7 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className={`${stats.pendingAmount > 0 ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200' : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border-gray-200'}`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${stats.pendingAmount > 0 ? 'text-red-600' : 'text-gray-600'}`}>Pending</p>
                                    <p className={`text-3xl font-bold ${stats.pendingAmount > 0 ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-gray-100'}`}>₹{stats.pendingAmount.toLocaleString('en-IN')}</p>
                                </div>
                                <div className={`w-14 h-14 ${stats.pendingAmount > 0 ? 'bg-red-500/20' : 'bg-gray-500/20'} rounded-2xl flex items-center justify-center`}>
                                    <TrendingUp className={`w-7 h-7 ${stats.pendingAmount > 0 ? 'text-red-600' : 'text-gray-600'}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Date Filter & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-auto"
                    />
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search by buyer name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Sales Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Sales Entries - {new Date(dateFilter).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-3 font-medium text-gray-500">Time</th>
                                    <th className="text-left p-3 font-medium text-gray-500">Buyer</th>
                                    <th className="text-right p-3 font-medium text-gray-500">Quantity (L)</th>
                                    <th className="text-right p-3 font-medium text-gray-500">FAT %</th>
                                    <th className="text-right p-3 font-medium text-gray-500">Rate (₹/L)</th>
                                    <th className="text-right p-3 font-medium text-gray-500">Amount</th>
                                    <th className="text-center p-3 font-medium text-gray-500">Status</th>
                                    <th className="text-center p-3 font-medium text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {todayEntries.map((entry, index) => (
                                        <motion.tr
                                            key={entry.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <td className="p-3 font-mono">{entry.time}</td>
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-medium">{entry.buyerName}</p>
                                                    {entry.vehicleNumber && (
                                                        <p className="text-xs text-gray-500">{entry.vehicleNumber}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 text-right font-bold">{entry.quantity}</td>
                                            <td className="p-3 text-right">{entry.fat || '-'}</td>
                                            <td className="p-3 text-right">₹{entry.rate}</td>
                                            <td className="p-3 text-right font-bold text-green-600">₹{entry.totalAmount.toLocaleString('en-IN')}</td>
                                            <td className="p-3 text-center">{getPaymentStatusBadge(entry.paymentStatus)}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <Button size="sm" variant="ghost">
                                                        <Printer className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>

                        {todayEntries.length === 0 && (
                            <div className="text-center py-12">
                                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No sales entries</h3>
                                <p className="text-gray-500 mb-4">No milk sold on this date</p>
                                <Button onClick={() => setShowAddModal(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Sale Entry
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Sale Entry</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <Label>Buyer *</Label>
                                    <select
                                        value={formData.buyerId}
                                        onChange={e => setFormData(prev => ({ ...prev, buyerId: e.target.value }))}
                                        className="w-full mt-1 h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    >
                                        <option value="">Select Buyer</option>
                                        {buyers.map(buyer => (
                                            <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Quantity (L) *</Label>
                                        <Input
                                            type="number"
                                            value={formData.quantity}
                                            onChange={e => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                                            placeholder="500"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Rate (₹/L) *</Label>
                                        <Input
                                            type="number"
                                            value={formData.rate}
                                            onChange={e => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                                            placeholder="52"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>FAT % (optional)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={formData.fat}
                                            onChange={e => setFormData(prev => ({ ...prev, fat: e.target.value }))}
                                            placeholder="4.2"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>SNF % (optional)</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={formData.snf}
                                            onChange={e => setFormData(prev => ({ ...prev, snf: e.target.value }))}
                                            placeholder="8.5"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Vehicle Number (optional)</Label>
                                    <Input
                                        value={formData.vehicleNumber}
                                        onChange={e => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                                        placeholder="GJ-05-AB-1234"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Payment Status</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-1">
                                        {(['PAID', 'PENDING', 'PARTIAL'] as const).map(status => (
                                            <button
                                                key={status}
                                                onClick={() => setFormData(prev => ({ ...prev, paymentStatus: status }))}
                                                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${formData.paymentStatus === status
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {formData.quantity && formData.rate && (
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                                        <p className="text-sm text-green-600">Total Amount</p>
                                        <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                                            ₹{(parseFloat(formData.quantity || '0') * parseFloat(formData.rate || '0')).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                    <Check className="w-4 h-4 mr-2" />
                                    Save Entry
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
