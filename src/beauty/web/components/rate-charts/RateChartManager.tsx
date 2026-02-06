'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Scale,
    Plus,
    Edit,
    Trash2,
    Save,
    Copy,
    CheckCircle,
    AlertTriangle,
    Loader2,
    Calculator,
    TrendingUp,
    Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, isDemoMode } from '@/lib/supabase'

interface RateEntry {
    id: string
    fatMin: number
    fatMax: number
    snfMin?: number
    snfMax?: number
    ratePerLiter: number
}

interface RateChart {
    id: string
    name: string
    cattleType: 'COW' | 'BUFFALO' | 'GOAT' | 'MIXED'
    isActive: boolean
    effectiveFrom: string
    entries: RateEntry[]
}

export default function RateChartManager() {
    const { profile } = useAuth()
    const { i18n } = useTranslation()
    const isHindi = i18n.language === 'hi'
    const [loading, setLoading] = useState(true)
    const [charts, setCharts] = useState<RateChart[]>([])
    const [selectedChart, setSelectedChart] = useState<RateChart | null>(null)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [testFat, setTestFat] = useState('')
    const [testSnf, setTestSnf] = useState('')
    const [calculatedRate, setCalculatedRate] = useState<number | null>(null)

    useEffect(() => {
        fetchCharts()
    }, [])

    const fetchCharts = async () => {
        if (!profile?.dairy?.id && !isDemoMode) return
        setLoading(true)
        try {
            if (isDemoMode) {
                await new Promise(resolve => setTimeout(resolve, 800))
                setCharts([
                    {
                        id: '1',
                        name: 'Standard Cow Rate',
                        cattleType: 'COW',
                        isActive: true,
                        effectiveFrom: '2026-01-01',
                        entries: [
                            { id: '1', fatMin: 3.0, fatMax: 3.4, snfMin: 8.0, snfMax: 8.4, ratePerLiter: 32 },
                            { id: '2', fatMin: 3.5, fatMax: 3.9, snfMin: 8.0, snfMax: 8.4, ratePerLiter: 36 },
                            { id: '3', fatMin: 3.5, fatMax: 3.9, snfMin: 8.5, snfMax: 9.0, ratePerLiter: 40 },
                            { id: '4', fatMin: 4.0, fatMax: 4.4, snfMin: 8.0, snfMax: 8.4, ratePerLiter: 42 },
                            { id: '5', fatMin: 4.0, fatMax: 4.4, snfMin: 8.5, snfMax: 9.0, ratePerLiter: 46 },
                            { id: '6', fatMin: 4.5, fatMax: 5.0, snfMin: 8.5, snfMax: 9.0, ratePerLiter: 50 },
                        ]
                    }
                ])
                return
            }

            const { data, error } = await supabase
                .from('rate_charts')
                .select('*')
                .eq('dairy_id', profile?.dairy?.id)
                .order('effective_from', { ascending: false })

            if (error) throw error

            const formattedCharts: RateChart[] = (data || []).map(item => ({
                id: item.id,
                name: item.name,
                cattleType: item.cattle_type,
                isActive: item.is_active,
                effectiveFrom: item.effective_from,
                entries: item.entries as RateEntry[]
            }))

            setCharts(formattedCharts)
            if (formattedCharts.length > 0 && !selectedChart) {
                setSelectedChart(formattedCharts[0])
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error('Failed to fetch rate charts')
        } finally {
            setLoading(false)
        }
    }

    const calculateRate = () => {
        if (!selectedChart || !testFat) return

        const fat = parseFloat(testFat)
        const snf = testSnf ? parseFloat(testSnf) : undefined

        const entry = selectedChart.entries.find(e => {
            const fatMatch = fat >= e.fatMin && fat <= e.fatMax
            const snfMatch = !e.snfMin || (snf !== undefined && e.snfMin !== undefined && e.snfMax !== undefined && snf >= e.snfMin && snf <= e.snfMax)
            return fatMatch && snfMatch
        })

        if (entry) {
            setCalculatedRate(entry.ratePerLiter)
            toast.success(`Rate found: ₹${entry.ratePerLiter}/L`)
        } else {
            setCalculatedRate(null)
            toast.error('No matching rate found for given FAT/SNF')
        }
    }

    const getCattleTypeBadge = (type: RateChart['cattleType']) => {
        const colors = {
            COW: 'bg-yellow-100 text-yellow-800',
            BUFFALO: 'bg-blue-100 text-blue-800',
            GOAT: 'bg-green-100 text-green-800',
            MIXED: 'bg-purple-100 text-purple-800',
        }
        return <Badge className={colors[type]}>{type}</Badge>
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Scale className="w-7 h-7 text-green-600" />
                        {isHindi ? 'रेट चार्ट मैनेजर' : 'Rate Chart Manager'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isHindi ? 'FAT और SNF के आधार पर दूध की कीमत निर्धारित करें' : 'Configure milk pricing based on FAT and SNF'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2 text-amber-700 text-sm hidden md:flex">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{isHindi ? 'पुराने रिकॉर्ड नहीं बदलेंगे' : 'Past records are immutable'}</span>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)} className="btn-dairy">
                        <Plus className="w-4 h-4 mr-2" />
                        {isHindi ? 'नया रेट चार्ट' : 'New Rate Chart'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-semibold text-gray-700">Rate Charts</h3>
                    {charts.map((chart, index) => (
                        <motion.div
                            key={chart.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                className={`cursor-pointer transition-all hover:shadow-md ${selectedChart?.id === chart.id ? 'ring-2 ring-green-500' : ''
                                    }`}
                                onClick={() => setSelectedChart(chart)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{chart.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getCattleTypeBadge(chart.cattleType)}
                                                {chart.isActive && (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Active
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <TrendingUp className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {chart.entries.length} rate entries
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Chart Details */}
                <div className="lg:col-span-2">
                    {selectedChart ? (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{selectedChart.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {isHindi ? 'प्रभावी दिनांक:' : 'Effective from'} {selectedChart.effectiveFrom}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="rounded-xl">
                                            <Copy className="w-4 h-4 mr-2" />
                                            {isHindi ? 'कॉपी करें' : 'Duplicate'}
                                        </Button>
                                        <Button variant="outline" size="sm" className="rounded-xl" disabled={selectedChart.isActive}>
                                            <Edit className="w-4 h-4 mr-2" />
                                            {isHindi ? 'सुधारें' : 'Edit'}
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="entries">
                                    <TabsList>
                                        <TabsTrigger value="entries">Rate Entries</TabsTrigger>
                                        <TabsTrigger value="calculator">Rate Calculator</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="entries" className="mt-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>FAT Range</TableHead>
                                                    {selectedChart.entries.some(e => e.snfMin) && (
                                                        <TableHead>SNF Range</TableHead>
                                                    )}
                                                    <TableHead>Rate (₹/L)</TableHead>
                                                    <TableHead className="w-20">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedChart.entries.map((entry, index) => (
                                                    <motion.tr
                                                        key={entry.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="border-b"
                                                    >
                                                        <TableCell>
                                                            <span className="font-mono">
                                                                {entry.fatMin}% - {entry.fatMax}%
                                                            </span>
                                                        </TableCell>
                                                        {selectedChart.entries.some(e => e.snfMin) && (
                                                            <TableCell>
                                                                {entry.snfMin ? (
                                                                    <span className="font-mono">
                                                                        {entry.snfMin}% - {entry.snfMax}%
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-gray-400">Any</span>
                                                                )}
                                                            </TableCell>
                                                        )}
                                                        <TableCell>
                                                            <span className="font-bold text-green-600">
                                                                ₹{entry.ratePerLiter}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-1">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <Edit className="w-3 h-3" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </motion.tr>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        <div className="mt-4">
                                            <Button variant="outline">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Entry
                                            </Button>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="calculator" className="mt-4">
                                        <Card className="bg-gray-50 dark:bg-gray-800">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Calculator className="w-5 h-5 text-blue-600" />
                                                    <h3 className="font-semibold">Test Rate Calculator</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>FAT %</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="e.g. 4.0"
                                                            value={testFat}
                                                            onChange={(e) => setTestFat(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>SNF % (optional)</Label>
                                                        <Input
                                                            type="number"
                                                            step="0.1"
                                                            placeholder="e.g. 8.5"
                                                            value={testSnf}
                                                            onChange={(e) => setTestSnf(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>&nbsp;</Label>
                                                        <Button className="w-full" onClick={calculateRate}>
                                                            Calculate Rate
                                                        </Button>
                                                    </div>
                                                </div>
                                                {calculatedRate !== null && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="mt-6 text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg"
                                                    >
                                                        <p className="text-sm text-green-600 dark:text-green-400">Calculated Rate</p>
                                                        <p className="text-4xl font-bold text-green-700 dark:text-green-300 mt-2">
                                                            ₹{calculatedRate}/L
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-full flex items-center justify-center min-h-[400px]">
                            <div className="text-center text-gray-500">
                                <Scale className="w-16 h-16 mx-auto opacity-30" />
                                <p className="mt-4">Select a rate chart to view details</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
