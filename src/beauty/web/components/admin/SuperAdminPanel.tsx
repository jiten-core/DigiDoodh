'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    Shield,
    Users,
    Building2,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Search,
    Filter,
    MoreHorizontal,
    Trash2,
    Edit,
    Key,
    Lock,
    Unlock,
    Activity,
    Clock,
    Globe,
    Database,
    Server,
    Cpu,
    HardDrive,
    RefreshCw,
    Download,
    Upload,
    Settings,
    Loader2,
    UserCog,
    Mail,
    Phone,
    Calendar
} from 'lucide-react'
import { toast } from 'sonner'

interface Dairy {
    id: string
    name: string
    ownerName: string
    email: string
    phone: string
    status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'EXPIRED'
    plan: 'BASIC' | 'PREMIUM' | 'PREMIUM_PLUS'
    farmers: number
    createdAt: string
    lastActive: string
}

interface SuperAdminStats {
    totalDairies: number
    activeDairies: number
    totalFarmers: number
    totalRevenue: number
    activeTrials: number
    expiringSoon: number
    systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL'
    uptime: number
}

export default function SuperAdminPanel() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<SuperAdminStats | null>(null)
    const [dairies, setDairies] = useState<Dairy[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedDairy, setSelectedDairy] = useState<Dairy | null>(null)
    const [impersonating, setImpersonating] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Simulated data
            await new Promise(resolve => setTimeout(resolve, 1000))

            setStats({
                totalDairies: 245,
                activeDairies: 198,
                totalFarmers: 12500,
                totalRevenue: 4850000,
                activeTrials: 32,
                expiringSoon: 15,
                systemHealth: 'HEALTHY',
                uptime: 99.9,
            })

            setDairies([
                {
                    id: '1',
                    name: 'Krishna Dairy',
                    ownerName: 'Ramesh Kumar',
                    email: 'ramesh@example.com',
                    phone: '9876543210',
                    status: 'ACTIVE',
                    plan: 'PREMIUM',
                    farmers: 125,
                    createdAt: '2025-06-15',
                    lastActive: '2026-01-25',
                },
                {
                    id: '2',
                    name: 'Gauri Milk Farm',
                    ownerName: 'Suresh Patel',
                    email: 'suresh@example.com',
                    phone: '9876543211',
                    status: 'ACTIVE',
                    plan: 'BASIC',
                    farmers: 85,
                    createdAt: '2025-08-20',
                    lastActive: '2026-01-24',
                },
                {
                    id: '3',
                    name: 'Nandini Dairy',
                    ownerName: 'Mahesh Singh',
                    email: 'mahesh@example.com',
                    phone: '9876543212',
                    status: 'TRIAL',
                    plan: 'BASIC',
                    farmers: 25,
                    createdAt: '2026-01-10',
                    lastActive: '2026-01-25',
                },
                {
                    id: '4',
                    name: 'Shree Ram Dairy',
                    ownerName: 'Dinesh Sharma',
                    email: 'dinesh@example.com',
                    phone: '9876543213',
                    status: 'EXPIRED',
                    plan: 'PREMIUM_PLUS',
                    farmers: 250,
                    createdAt: '2024-12-01',
                    lastActive: '2026-01-15',
                },
                {
                    id: '5',
                    name: 'Laxmi Dairy',
                    ownerName: 'Mukesh Yadav',
                    email: 'mukesh@example.com',
                    phone: '9876543214',
                    status: 'SUSPENDED',
                    plan: 'BASIC',
                    farmers: 45,
                    createdAt: '2025-03-10',
                    lastActive: '2026-01-01',
                },
            ])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleImpersonate = async (dairy: Dairy) => {
        setImpersonating(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            toast.success(`Now viewing as ${dairy.name}`)
            // In real app, this would set session context
        } finally {
            setImpersonating(false)
        }
    }

    const handleSuspend = async (dairy: Dairy) => {
        toast.success(`${dairy.name} has been suspended`)
        setDairies(prev =>
            prev.map(d => d.id === dairy.id ? { ...d, status: 'SUSPENDED' } : d)
        )
    }

    const handleActivate = async (dairy: Dairy) => {
        toast.success(`${dairy.name} has been activated`)
        setDairies(prev =>
            prev.map(d => d.id === dairy.id ? { ...d, status: 'ACTIVE' } : d)
        )
    }

    const getStatusBadge = (status: Dairy['status']) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>
            case 'SUSPENDED':
                return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Suspended</Badge>
            case 'TRIAL':
                return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" /> Trial</Badge>
            case 'EXPIRED':
                return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" /> Expired</Badge>
            default:
                return <Badge>{status}</Badge>
        }
    }

    const getPlanBadge = (plan: Dairy['plan']) => {
        switch (plan) {
            case 'BASIC':
                return <Badge variant="outline">Basic</Badge>
            case 'PREMIUM':
                return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
            case 'PREMIUM_PLUS':
                return <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Premium+</Badge>
        }
    }

    const filteredDairies = dairies.filter(dairy => {
        const matchesSearch =
            dairy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dairy.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dairy.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || dairy.status === statusFilter

        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Super Admin Panel</h1>
                        <p className="text-gray-500">Platform Management Dashboard</p>
                    </div>
                </div>
                <Badge className={stats?.systemHealth === 'HEALTHY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    <Activity className="w-3 h-3 mr-1" />
                    System: {stats?.systemHealth} ({stats?.uptime}% uptime)
                </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100">Total Dairies</p>
                                    <p className="text-3xl font-bold mt-2">{stats?.totalDairies}</p>
                                    <p className="text-blue-100 text-sm mt-1">{stats?.activeDairies} active</p>
                                </div>
                                <Building2 className="w-12 h-12 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100">Total Farmers</p>
                                    <p className="text-3xl font-bold mt-2">{stats?.totalFarmers.toLocaleString()}</p>
                                    <p className="text-green-100 text-sm mt-1">Across all dairies</p>
                                </div>
                                <Users className="w-12 h-12 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100">Monthly Revenue</p>
                                    <p className="text-3xl font-bold mt-2">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
                                    <p className="text-purple-100 text-sm mt-1">Subscriptions</p>
                                </div>
                                <Activity className="w-12 h-12 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100">Expiring Soon</p>
                                    <p className="text-3xl font-bold mt-2">{stats?.expiringSoon}</p>
                                    <p className="text-orange-100 text-sm mt-1">{stats?.activeTrials} trials</p>
                                </div>
                                <AlertTriangle className="w-12 h-12 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="dairies">Dairies</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                    <TabsTrigger value="audit">Audit Logs</TabsTrigger>
                </TabsList>

                {/* Dairies Tab */}
                <TabsContent value="dairies" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <CardTitle>Dairy Management</CardTitle>
                                    <CardDescription>View and manage all dairies</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <Input
                                            placeholder="Search dairies..."
                                            className="pl-10 w-64"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="TRIAL">Trial</SelectItem>
                                            <SelectItem value="EXPIRED">Expired</SelectItem>
                                            <SelectItem value="SUSPENDED">Suspended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dairy</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Plan</TableHead>
                                        <TableHead>Farmers</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Active</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDairies.map((dairy, index) => (
                                        <motion.tr
                                            key={dairy.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b"
                                        >
                                            <TableCell className="font-medium">{dairy.name}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p>{dairy.ownerName}</p>
                                                    <p className="text-xs text-gray-500">{dairy.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getPlanBadge(dairy.plan)}</TableCell>
                                            <TableCell>{dairy.farmers}</TableCell>
                                            <TableCell>{getStatusBadge(dairy.status)}</TableCell>
                                            <TableCell className="text-gray-500">{dairy.lastActive}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleImpersonate(dairy)}
                                                        disabled={impersonating}
                                                    >
                                                        <Eye className="w-3 h-3 mr-1" />
                                                        View As
                                                    </Button>
                                                    {dairy.status === 'ACTIVE' ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600"
                                                            onClick={() => handleSuspend(dairy)}
                                                        >
                                                            <Lock className="w-3 h-3 mr-1" />
                                                            Suspend
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-green-600"
                                                            onClick={() => handleActivate(dairy)}
                                                        >
                                                            <Unlock className="w-3 h-3 mr-1" />
                                                            Activate
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Overview Tab */}
                <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full justify-start" variant="outline">
                                    <Mail className="w-4 h-4 mr-2" />
                                    Send Bulk Email
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export All Data
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <Database className="w-4 h-4 mr-2" />
                                    Database Backup
                                </Button>
                                <Button className="w-full justify-start" variant="outline">
                                    <Settings className="w-4 h-4 mr-2" />
                                    System Settings
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>System Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Server className="w-4 h-4 text-green-500" />
                                        <span>API Server</span>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Database className="w-4 h-4 text-green-500" />
                                        <span>Database</span>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="w-4 h-4 text-yellow-500" />
                                        <span>CPU Usage</span>
                                    </div>
                                    <Badge className="bg-yellow-100 text-yellow-800">42%</Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <HardDrive className="w-4 h-4 text-green-500" />
                                        <span>Storage</span>
                                    </div>
                                    <Badge className="bg-green-100 text-green-800">28% used</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* System Tab */}
                <TabsContent value="system" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Maintenance Mode</p>
                                    <p className="text-sm text-gray-500">Disable access for all users</p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">New Registrations</p>
                                    <p className="text-sm text-gray-500">Allow new dairy signups</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Auto Backup</p>
                                    <p className="text-sm text-gray-500">Daily database backups</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Audit Tab */}
                <TabsContent value="audit" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Logs</CardTitle>
                            <CardDescription>Recent system activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { action: 'User login', user: 'admin@digidhoodh.com', time: '2 mins ago', type: 'info' },
                                    { action: 'Dairy suspended', user: 'superadmin', time: '15 mins ago', type: 'warning' },
                                    { action: 'Backup completed', user: 'system', time: '1 hour ago', type: 'success' },
                                    { action: 'New dairy registered', user: 'system', time: '3 hours ago', type: 'info' },
                                    { action: 'Plan upgraded', user: 'user@dairy.com', time: '5 hours ago', type: 'success' },
                                ].map((log, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${log.type === 'success' ? 'bg-green-500' :
                                                    log.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                                }`} />
                                            <div>
                                                <p className="font-medium">{log.action}</p>
                                                <p className="text-sm text-gray-500">{log.user}</p>
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-500">{log.time}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
