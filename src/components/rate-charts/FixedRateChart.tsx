'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, RefreshCw, Loader2, CheckCircle } from 'lucide-react'

// Simple Fixed Rate Chart like competitor (Hamari Dairy)
// Uses flat rate per cattle type instead of FAT/SNF matrix

interface FixedRate {
    id: string
    cattleType: 'COW' | 'BUFFALO' | 'MIXED' | 'GOAT'
    ratePerLiter: number
    isActive: boolean
    updatedAt: string
}

const CATTLE_ICONS: Record<string, string> = {
    COW: '🐄',
    BUFFALO: '🐃',
    MIXED: '🥛',
    GOAT: '🐐',
}

const CATTLE_COLORS: Record<string, string> = {
    COW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300',
    BUFFALO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300',
    MIXED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300',
    GOAT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300',
}

export default function FixedRateChart() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [rates, setRates] = useState<FixedRate[]>([])
    const [editedRates, setEditedRates] = useState<Record<string, number>>({})

    useEffect(() => {
        fetchRates()
    }, [])

    const fetchRates = async () => {
        setLoading(true)
        try {
            // In production, this would be an API call
            await new Promise(resolve => setTimeout(resolve, 500))

            const defaultRates: FixedRate[] = [
                {
                    id: '1',
                    cattleType: 'COW',
                    ratePerLiter: 50,
                    isActive: true,
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    cattleType: 'BUFFALO',
                    ratePerLiter: 60,
                    isActive: true,
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: '3',
                    cattleType: 'MIXED',
                    ratePerLiter: 55,
                    isActive: true,
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: '4',
                    cattleType: 'GOAT',
                    ratePerLiter: 80,
                    isActive: true,
                    updatedAt: new Date().toISOString(),
                },
            ]

            setRates(defaultRates)

            // Initialize edited rates with current values
            const initialEdited: Record<string, number> = {}
            defaultRates.forEach(rate => {
                initialEdited[rate.id] = rate.ratePerLiter
            })
            setEditedRates(initialEdited)

        } catch (error) {
            console.error('Error fetching rates:', error)
            toast.error('Failed to load rates')
        } finally {
            setLoading(false)
        }
    }

    const handleRateChange = (id: string, value: string) => {
        const numValue = parseFloat(value) || 0
        setEditedRates(prev => ({
            ...prev,
            [id]: numValue
        }))
    }

    const hasChanges = () => {
        return rates.some(rate => editedRates[rate.id] !== rate.ratePerLiter)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            // In production, this would be an API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            const updatedRates = rates.map(rate => ({
                ...rate,
                ratePerLiter: editedRates[rate.id] || rate.ratePerLiter,
                updatedAt: new Date().toISOString(),
            }))

            setRates(updatedRates)
            toast.success('Fixed rates saved successfully!')

        } catch (error) {
            console.error('Error saving rates:', error)
            toast.error('Failed to save rates')
        } finally {
            setSaving(false)
        }
    }

    const handleReset = () => {
        const resetEdited: Record<string, number> = {}
        rates.forEach(rate => {
            resetEdited[rate.id] = rate.ratePerLiter
        })
        setEditedRates(resetEdited)
        toast.info('Changes reset')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <Card className="card-premium">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <span className="text-2xl">📊</span>
                            Fixed Rate Chart
                        </CardTitle>
                        <CardDescription>
                            Simple fixed pricing per cattle type (like Hamari Dairy)
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Simple Mode
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Rate Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {rates.map((rate, index) => (
                        <motion.div
                            key={rate.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className={`border-2 ${CATTLE_COLORS[rate.cattleType]} transition-all hover:shadow-lg`}>
                                <CardContent className="p-4 text-center space-y-4">
                                    {/* Cattle Icon */}
                                    <div className="text-5xl">{CATTLE_ICONS[rate.cattleType]}</div>

                                    {/* Cattle Type */}
                                    <h3 className="font-bold text-lg">{rate.cattleType}</h3>

                                    {/* Rate Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`rate-${rate.id}`} className="text-sm">
                                            Rate per Liter (₹)
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500">₹</span>
                                            <Input
                                                id={`rate-${rate.id}`}
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                value={editedRates[rate.id] || ''}
                                                onChange={(e) => handleRateChange(rate.id, e.target.value)}
                                                className="pl-8 text-center text-xl font-bold h-14"
                                            />
                                        </div>
                                    </div>

                                    {/* Change Indicator */}
                                    {editedRates[rate.id] !== rate.ratePerLiter && (
                                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                            Changed from ₹{rate.ratePerLiter}
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-gray-500">
                        Last updated: {rates[0] && new Date(rates[0].updatedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={!hasChanges() || saving}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges() || saving}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Rates
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Helper Text */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-400">
                    <p className="font-medium mb-1">💡 Pro Tip</p>
                    <p>
                        Fixed rates are simpler but less accurate. For precise pricing based on FAT/SNF content,
                        use the <strong>Rate Chart Manager</strong> instead.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
