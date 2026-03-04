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
    BookOpen,
    Plus,
    Edit,
    Trash2,
    Search,
    User,
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Loader2,
    Check,
    Download,
    Printer,
    ArrowUpRight,
    ArrowDownRight,
    FileText
} from 'lucide-react'

// Ledger interfaces (like competitor's Manage Ledger / Khata)
interface LedgerEntry {
    id: string
    farmerId: string
    farmerName: string
    date: string
    type: 'CREDIT' | 'DEBIT'
    category: 'MILK_PAYMENT' | 'ADVANCE' | 'LOAN' | 'CATTLE_FEED' | 'MEDICINE' | 'OTHER'
    description: string
    amount: number
    balance: number
    reference?: string
    createdAt: string
}

interface FarmerLedger {
    farmerId: string
    farmerName: string
    phone?: string
    totalCredit: number
    totalDebit: number
    balance: number
    entries: LedgerEntry[]
}

const CATEGORY_OPTIONS = [
    { value: 'MILK_PAYMENT', label: 'दूध भुगतान', icon: '🥛', color: 'bg-green-100 text-green-800' },
    { value: 'ADVANCE', label: 'अग्रिम / Advance', icon: '💰', color: 'bg-blue-100 text-blue-800' },
    { value: 'LOAN', label: 'ऋण / Loan', icon: '🏦', color: 'bg-purple-100 text-purple-800' },
    { value: 'CATTLE_FEED', label: 'पशु आहार', icon: '🌾', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'MEDICINE', label: 'दवाई / Medicine', icon: '💊', color: 'bg-red-100 text-red-800' },
    { value: 'OTHER', label: 'अन्य / Other', icon: '📋', color: 'bg-gray-100 text-gray-800' },
]

export default function LedgerManager() {
    const [loading, setLoading] = useState(true)
    const [ledgers, setLedgers] = useState<FarmerLedger[]>([])
    const [selectedFarmer, setSelectedFarmer] = useState<FarmerLedger | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        farmerId: '',
        type: 'CREDIT' as 'CREDIT' | 'DEBIT',
        category: 'MILK_PAYMENT' as LedgerEntry['category'],
        description: '',
        amount: '',
        reference: '',
    })

    useEffect(() => {
        fetchLedgers()
    }, [])

    const fetchLedgers = async () => {
        setLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            // Demo ledgers
            const demoEntries: LedgerEntry[] = [
                {
                    id: '1',
                    farmerId: '1',
                    farmerName: 'Ramesh Patel',
                    date: '2026-02-09',
                    type: 'CREDIT',
                    category: 'MILK_PAYMENT',
                    description: 'Weekly milk payment',
                    amount: 5600,
                    balance: 5600,
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    farmerId: '1',
                    farmerName: 'Ramesh Patel',
                    date: '2026-02-08',
                    type: 'DEBIT',
                    category: 'CATTLE_FEED',
                    description: 'Cattle feed - 2 bags',
                    amount: 2400,
                    balance: 3200,
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '3',
                    farmerId: '1',
                    farmerName: 'Ramesh Patel',
                    date: '2026-02-05',
                    type: 'DEBIT',
                    category: 'ADVANCE',
                    description: 'Advance payment',
                    amount: 1000,
                    balance: 2200,
                    createdAt: new Date().toISOString(),
                },
            ]

            setLedgers([
                {
                    farmerId: '1',
                    farmerName: 'Ramesh Patel',
                    phone: '9876543210',
                    totalCredit: 15600,
                    totalDebit: 8400,
                    balance: 7200,
                    entries: demoEntries,
                },
                {
                    farmerId: '2',
                    farmerName: 'Suresh Sharma',
                    phone: '9876543211',
                    totalCredit: 12400,
                    totalDebit: 5600,
                    balance: 6800,
                    entries: [],
                },
                {
                    farmerId: '3',
                    farmerName: 'Mahesh Kumar',
                    phone: '9876543212',
                    totalCredit: 8900,
                    totalDebit: 9200,
                    balance: -300, // Negative balance - farmer owes money
                    entries: [],
                },
            ])

        } catch (error) {
            console.error('Error fetching ledgers:', error)
            toast.error('Failed to load ledgers')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.farmerId || !formData.amount || !formData.description) {
            toast.error('Please fill required fields')
            return
        }

        try {
            const farmer = ledgers.find(l => l.farmerId === formData.farmerId)
            if (!farmer) {
                toast.error('Farmer not found')
                return
            }

            const amount = parseFloat(formData.amount)
            const newBalance = formData.type === 'CREDIT'
                ? farmer.balance + amount
                : farmer.balance - amount

            const newEntry: LedgerEntry = {
                id: Date.now().toString(),
                farmerId: formData.farmerId,
                farmerName: farmer.farmerName,
                date: new Date().toISOString().split('T')[0],
                type: formData.type,
                category: formData.category,
                description: formData.description,
                amount: amount,
                balance: newBalance,
                reference: formData.reference,
                createdAt: new Date().toISOString(),
            }

            // Update ledger
            setLedgers(prev => prev.map(l => {
                if (l.farmerId === formData.farmerId) {
                    return {
                        ...l,
                        entries: [newEntry, ...l.entries],
                        totalCredit: formData.type === 'CREDIT' ? l.totalCredit + amount : l.totalCredit,
                        totalDebit: formData.type === 'DEBIT' ? l.totalDebit + amount : l.totalDebit,
                        balance: newBalance,
                    }
                }
                return l
            }))

            // Update selected farmer if needed
            if (selectedFarmer?.farmerId === formData.farmerId) {
                setSelectedFarmer(prev => prev ? {
                    ...prev,
                    entries: [newEntry, ...prev.entries],
                    totalCredit: formData.type === 'CREDIT' ? prev.totalCredit + amount : prev.totalCredit,
                    totalDebit: formData.type === 'DEBIT' ? prev.totalDebit + amount : prev.totalDebit,
                    balance: newBalance,
                } : null)
            }

            toast.success('Entry added successfully!')
            setShowAddModal(false)
            resetForm()

        } catch (error) {
            console.error('Error adding entry:', error)
            toast.error('Failed to add entry')
        }
    }

    const resetForm = () => {
        setFormData({
            farmerId: selectedFarmer?.farmerId || '',
            type: 'CREDIT',
            category: 'MILK_PAYMENT',
            description: '',
            amount: '',
            reference: '',
        })
    }

    const getCategoryInfo = (category: LedgerEntry['category']) => {
        return CATEGORY_OPTIONS.find(c => c.value === category) || CATEGORY_OPTIONS[5]
    }

    // Filter ledgers
    const filteredLedgers = ledgers.filter(l =>
        l.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone?.includes(searchTerm)
    )

    // Stats
    const stats = {
        totalFarmers: ledgers.length,
        totalReceivable: ledgers.filter(l => l.balance > 0).reduce((sum, l) => sum + l.balance, 0),
        totalPayable: Math.abs(ledgers.filter(l => l.balance < 0).reduce((sum, l) => sum + l.balance, 0)),
        negativeBalanceFarmers: ledgers.filter(l => l.balance < 0).length,
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
                        <BookOpen className="w-8 h-8 text-orange-600" />
                        Manage Ledger (खाता)
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track farmer payments, advances, loans, and purchases
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setFormData(prev => ({ ...prev, farmerId: selectedFarmer?.farmerId || '' }))
                        setShowAddModal(true)
                    }}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 text-lg rounded-xl shadow-lg"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Entry
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-orange-600">Total Farmers</p>
                        <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.totalFarmers}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4 text-green-600" />
                            <p className="text-sm text-green-600">To Pay (देना है)</p>
                        </div>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">₹{stats.totalReceivable.toLocaleString('en-IN')}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                            <p className="text-sm text-red-600">To Receive (लेना है)</p>
                        </div>
                        <p className="text-2xl font-bold text-red-900 dark:text-red-100">₹{stats.totalPayable.toLocaleString('en-IN')}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-600">Negative Balance</p>
                        <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.negativeBalanceFarmers} farmers</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Farmers List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Search farmers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        <AnimatePresence>
                            {filteredLedgers.map((ledger, index) => (
                                <motion.div
                                    key={ledger.farmerId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card
                                        className={`cursor-pointer transition-all hover:shadow-md ${selectedFarmer?.farmerId === ledger.farmerId
                                                ? 'ring-2 ring-orange-500'
                                                : ''
                                            }`}
                                        onClick={() => setSelectedFarmer(ledger)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{ledger.farmerName}</p>
                                                    <p className="text-sm text-gray-500">{ledger.phone}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-bold ${ledger.balance >= 0 ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                        {ledger.balance >= 0 ? '+' : ''}₹{ledger.balance.toLocaleString('en-IN')}
                                                    </p>
                                                    <Badge variant="outline" className="text-xs">
                                                        {ledger.entries.length} entries
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Ledger Details */}
                <div className="lg:col-span-2">
                    {selectedFarmer ? (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            {selectedFarmer.farmerName}
                                        </CardTitle>
                                        <CardDescription>{selectedFarmer.phone}</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                            <Printer className="w-4 h-4 mr-1" />
                                            Print
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Download className="w-4 h-4 mr-1" />
                                            Export
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Balance Summary */}
                                <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Total Credit</p>
                                        <p className="text-lg font-bold text-green-600">+₹{selectedFarmer.totalCredit.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Total Debit</p>
                                        <p className="text-lg font-bold text-red-600">-₹{selectedFarmer.totalDebit.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Balance</p>
                                        <p className={`text-2xl font-bold ${selectedFarmer.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ₹{selectedFarmer.balance.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>

                                {/* Entries Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left p-3 text-sm font-medium text-gray-500">Date</th>
                                                <th className="text-left p-3 text-sm font-medium text-gray-500">Description</th>
                                                <th className="text-left p-3 text-sm font-medium text-gray-500">Category</th>
                                                <th className="text-right p-3 text-sm font-medium text-gray-500">Credit</th>
                                                <th className="text-right p-3 text-sm font-medium text-gray-500">Debit</th>
                                                <th className="text-right p-3 text-sm font-medium text-gray-500">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedFarmer.entries.map((entry, index) => {
                                                const categoryInfo = getCategoryInfo(entry.category)
                                                return (
                                                    <motion.tr
                                                        key={entry.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    >
                                                        <td className="p-3 text-sm">
                                                            {new Date(entry.date).toLocaleDateString('en-IN', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                            })}
                                                        </td>
                                                        <td className="p-3">
                                                            <p className="text-sm font-medium">{entry.description}</p>
                                                            {entry.reference && (
                                                                <p className="text-xs text-gray-500">Ref: {entry.reference}</p>
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            <Badge className={categoryInfo.color}>
                                                                {categoryInfo.icon} {categoryInfo.label}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3 text-right text-green-600 font-medium">
                                                            {entry.type === 'CREDIT' ? `+₹${entry.amount.toLocaleString('en-IN')}` : '-'}
                                                        </td>
                                                        <td className="p-3 text-right text-red-600 font-medium">
                                                            {entry.type === 'DEBIT' ? `-₹${entry.amount.toLocaleString('en-IN')}` : '-'}
                                                        </td>
                                                        <td className={`p-3 text-right font-bold ${entry.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            ₹{entry.balance.toLocaleString('en-IN')}
                                                        </td>
                                                    </motion.tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>

                                    {selectedFarmer.entries.length === 0 && (
                                        <div className="text-center py-8">
                                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500">No entries yet</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-full flex items-center justify-center min-h-[400px]">
                            <div className="text-center text-gray-500">
                                <BookOpen className="w-16 h-16 mx-auto opacity-30" />
                                <p className="mt-4">Select a farmer to view their ledger</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Add Entry Modal */}
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
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Ledger Entry</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <Label>Farmer *</Label>
                                    <select
                                        value={formData.farmerId}
                                        onChange={e => setFormData(prev => ({ ...prev, farmerId: e.target.value }))}
                                        className="w-full mt-1 h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    >
                                        <option value="">Select Farmer</option>
                                        {ledgers.map(l => (
                                            <option key={l.farmerId} value={l.farmerId}>{l.farmerName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label>Entry Type *</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, type: 'CREDIT' }))}
                                            className={`p-4 rounded-xl border-2 font-medium transition-all ${formData.type === 'CREDIT'
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <ArrowUpRight className={`w-5 h-5 mx-auto mb-1 ${formData.type === 'CREDIT' ? 'text-green-600' : 'text-gray-400'}`} />
                                            Credit (जमा)
                                        </button>
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, type: 'DEBIT' }))}
                                            className={`p-4 rounded-xl border-2 font-medium transition-all ${formData.type === 'DEBIT'
                                                    ? 'border-red-500 bg-red-50 text-red-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <ArrowDownRight className={`w-5 h-5 mx-auto mb-1 ${formData.type === 'DEBIT' ? 'text-red-600' : 'text-gray-400'}`} />
                                            Debit (खर्च)
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label>Category *</Label>
                                    <select
                                        value={formData.category}
                                        onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as LedgerEntry['category'] }))}
                                        className="w-full mt-1 h-12 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                    >
                                        {CATEGORY_OPTIONS.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.icon} {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label>Description *</Label>
                                    <Input
                                        value={formData.description}
                                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Weekly milk payment, Cattle feed purchase..."
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Amount (₹) *</Label>
                                        <Input
                                            type="number"
                                            value={formData.amount}
                                            onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                            placeholder="5600"
                                            className="mt-1 text-xl font-bold"
                                        />
                                    </div>
                                    <div>
                                        <Label>Reference (Optional)</Label>
                                        <Input
                                            value={formData.reference}
                                            onChange={e => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                                            placeholder="Bill No, Receipt..."
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} className={`flex-1 text-white ${formData.type === 'CREDIT'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}>
                                    <Check className="w-4 h-4 mr-2" />
                                    Add {formData.type === 'CREDIT' ? 'Credit' : 'Debit'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
