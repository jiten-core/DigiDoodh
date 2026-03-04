'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    MapPin,
    Plus,
    Edit,
    Trash2,
    Search,
    Users,
    Building,
    Loader2,
    Check,
    GripVertical,
    ChevronRight
} from 'lucide-react'

// Cluster interface (like competitor's Manage Cluster)
interface Cluster {
    id: string
    name: string
    code: string
    village: string
    taluka?: string
    district: string
    state: string
    farmerCount: number
    totalMilk: number
    inCharge?: string
    inChargePhone?: string
    isActive: boolean
    createdAt: string
}

export default function ClusterManager() {
    const [loading, setLoading] = useState(true)
    const [clusters, setClusters] = useState<Cluster[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingCluster, setEditingCluster] = useState<Cluster | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        village: '',
        taluka: '',
        district: '',
        state: 'Gujarat',
        inCharge: '',
        inChargePhone: '',
    })

    useEffect(() => {
        fetchClusters()
    }, [])

    const fetchClusters = async () => {
        setLoading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 500))

            // Demo clusters
            setClusters([
                {
                    id: '1',
                    name: 'Anand Center',
                    code: 'ANA-001',
                    village: 'Anand',
                    taluka: 'Anand',
                    district: 'Anand',
                    state: 'Gujarat',
                    farmerCount: 125,
                    totalMilk: 2500,
                    inCharge: 'Ramesh Patel',
                    inChargePhone: '9876543210',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '2',
                    name: 'Vidyanagar Unit',
                    code: 'VID-002',
                    village: 'Vidyanagar',
                    taluka: 'Anand',
                    district: 'Anand',
                    state: 'Gujarat',
                    farmerCount: 85,
                    totalMilk: 1750,
                    inCharge: 'Suresh Bhatt',
                    inChargePhone: '9876543211',
                    isActive: true,
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '3',
                    name: 'Karamsad Cluster',
                    code: 'KAR-003',
                    village: 'Karamsad',
                    taluka: 'Anand',
                    district: 'Anand',
                    state: 'Gujarat',
                    farmerCount: 65,
                    totalMilk: 1200,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                },
                {
                    id: '4',
                    name: 'Borsad Unit',
                    code: 'BOR-004',
                    village: 'Borsad',
                    taluka: 'Borsad',
                    district: 'Anand',
                    state: 'Gujarat',
                    farmerCount: 42,
                    totalMilk: 850,
                    isActive: false,
                    createdAt: new Date().toISOString(),
                },
            ])

        } catch (error) {
            console.error('Error fetching clusters:', error)
            toast.error('Failed to load clusters')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.code || !formData.village || !formData.district) {
            toast.error('Please fill required fields')
            return
        }

        try {
            if (editingCluster) {
                setClusters(prev => prev.map(c => c.id === editingCluster.id ? {
                    ...c,
                    ...formData,
                } : c))
                toast.success('Cluster updated!')
            } else {
                const newCluster: Cluster = {
                    id: Date.now().toString(),
                    ...formData,
                    farmerCount: 0,
                    totalMilk: 0,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                }
                setClusters(prev => [newCluster, ...prev])
                toast.success('Cluster created!')
            }

            setShowAddModal(false)
            setEditingCluster(null)
            resetForm()

        } catch (error) {
            console.error('Error saving cluster:', error)
            toast.error('Failed to save cluster')
        }
    }

    const handleEdit = (cluster: Cluster) => {
        setFormData({
            name: cluster.name,
            code: cluster.code,
            village: cluster.village,
            taluka: cluster.taluka || '',
            district: cluster.district,
            state: cluster.state,
            inCharge: cluster.inCharge || '',
            inChargePhone: cluster.inChargePhone || '',
        })
        setEditingCluster(cluster)
        setShowAddModal(true)
    }

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this cluster?')) return
        setClusters(prev => prev.filter(c => c.id !== id))
        toast.success('Cluster deleted!')
    }

    const handleToggleActive = (id: string) => {
        setClusters(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c))
        toast.success('Status updated!')
    }

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            village: '',
            taluka: '',
            district: '',
            state: 'Gujarat',
            inCharge: '',
            inChargePhone: '',
        })
    }

    // Filter clusters
    const filteredClusters = clusters.filter(cluster => {
        const matchesSearch = cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cluster.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cluster.code.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = activeFilter === 'all' ? true :
            activeFilter === 'active' ? cluster.isActive : !cluster.isActive

        return matchesSearch && matchesStatus
    })

    // Stats
    const stats = {
        total: clusters.length,
        active: clusters.filter(c => c.isActive).length,
        totalFarmers: clusters.reduce((sum, c) => sum + c.farmerCount, 0),
        totalMilk: clusters.reduce((sum, c) => sum + c.totalMilk, 0),
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
                        <MapPin className="w-8 h-8 text-purple-600" />
                        Manage Clusters
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Group farmers by village, area, or collection center
                    </p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 text-lg rounded-xl shadow-lg"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Cluster
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-purple-600">Total Clusters</p>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Active</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">Total Farmers</p>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalFarmers}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-emerald-600">Daily Milk (L)</p>
                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.totalMilk.toLocaleString('en-IN')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="Search clusters by name, village, or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'active', 'inactive'] as const).map(filter => (
                        <Button
                            key={filter}
                            variant={activeFilter === filter ? 'default' : 'outline'}
                            onClick={() => setActiveFilter(filter)}
                            className="capitalize"
                        >
                            {filter}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Clusters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {filteredClusters.map((cluster, index) => (
                        <motion.div
                            key={cluster.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={`transition-all hover:shadow-lg ${!cluster.isActive ? 'opacity-60' : ''}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <Badge variant="outline" className="mb-2 font-mono">{cluster.code}</Badge>
                                            <CardTitle className="text-lg">{cluster.name}</CardTitle>
                                        </div>
                                        <Badge className={cluster.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {cluster.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Location */}
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <MapPin className="w-4 h-4" />
                                        <span>{cluster.village}, {cluster.taluka || cluster.district}, {cluster.state}</span>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                                            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                            <p className="text-xs text-gray-500">Farmers</p>
                                            <p className="text-lg font-bold">{cluster.farmerCount}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                                            <Building className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                            <p className="text-xs text-gray-500">Daily Milk</p>
                                            <p className="text-lg font-bold">{cluster.totalMilk} L</p>
                                        </div>
                                    </div>

                                    {/* In Charge */}
                                    {cluster.inCharge && (
                                        <div className="text-sm bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                                            <p className="text-purple-600 text-xs">In-Charge</p>
                                            <p className="font-medium">{cluster.inCharge}</p>
                                            {cluster.inChargePhone && (
                                                <p className="text-gray-500">{cluster.inChargePhone}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2 border-t">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(cluster)}
                                            className="flex-1"
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleToggleActive(cluster.id)}
                                        >
                                            {cluster.isActive ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(cluster.id)}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredClusters.length === 0 && (
                <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No clusters found</h3>
                    <p className="text-gray-500 mb-4">Create clusters to group farmers by area</p>
                    <Button onClick={() => setShowAddModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Cluster
                    </Button>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => { setShowAddModal(false); setEditingCluster(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {editingCluster ? 'Edit Cluster' : 'Add New Cluster'}
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Cluster Name *</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Anand Center"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>Cluster Code *</Label>
                                        <Input
                                            value={formData.code}
                                            onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                            placeholder="ANA-001"
                                            className="mt-1 font-mono"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Village *</Label>
                                    <Input
                                        value={formData.village}
                                        onChange={e => setFormData(prev => ({ ...prev, village: e.target.value }))}
                                        placeholder="Enter village name"
                                        className="mt-1"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Taluka</Label>
                                        <Input
                                            value={formData.taluka}
                                            onChange={e => setFormData(prev => ({ ...prev, taluka: e.target.value }))}
                                            placeholder="Taluka name"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label>District *</Label>
                                        <Input
                                            value={formData.district}
                                            onChange={e => setFormData(prev => ({ ...prev, district: e.target.value }))}
                                            placeholder="District name"
                                            className="mt-1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>State</Label>
                                    <Input
                                        value={formData.state}
                                        onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                                        placeholder="Gujarat"
                                        className="mt-1"
                                    />
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">In-Charge Details (Optional)</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>In-Charge Name</Label>
                                            <Input
                                                value={formData.inCharge}
                                                onChange={e => setFormData(prev => ({ ...prev, inCharge: e.target.value }))}
                                                placeholder="Ramesh Patel"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Phone Number</Label>
                                            <Input
                                                value={formData.inChargePhone}
                                                onChange={e => setFormData(prev => ({ ...prev, inChargePhone: e.target.value }))}
                                                placeholder="9876543210"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <Button variant="outline" onClick={() => { setShowAddModal(false); setEditingCluster(null); }} className="flex-1">
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                                    <Check className="w-4 h-4 mr-2" />
                                    {editingCluster ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
