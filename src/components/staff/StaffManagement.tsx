'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
    Users,
    Plus,
    Edit,
    Trash2,
    Search,
    Shield,
    ShieldCheck,
    UserCheck,
    UserX,
    Calendar,
    Clock,
    DollarSign,
    Loader2,
    Eye,
    EyeOff,
    Phone,
    Mail,
    Key,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Activity,
    Settings,
    Lock,
    Unlock
} from 'lucide-react';

// Staff interface matching Prisma schema
interface Staff {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    staffCode: string;
    permissions: StaffPermissions;
    salary?: number;
    joiningDate?: string;
    isActive: boolean;
    lastActiveAt?: string;
    createdAt: string;
    updatedAt: string;
}

interface StaffPermissions {
    milkCollection: {
        view: boolean;
        add: boolean;
        edit: boolean;
        delete: boolean;
    };
    farmers: {
        view: boolean;
        add: boolean;
        edit: boolean;
        delete: boolean;
    };
    billing: {
        view: boolean;
        generateDraft: boolean;
        finalize: boolean;
    };
    reports: {
        view: boolean;
        export: boolean;
    };
    payments: {
        view: boolean;
        record: boolean;
    };
    inventory: {
        view: boolean;
        manage: boolean;
    };
}

interface AttendanceRecord {
    id: string;
    staffId: string;
    staffName: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HOLIDAY';
    notes?: string;
}

const DEFAULT_PERMISSIONS: StaffPermissions = {
    milkCollection: { view: true, add: true, edit: false, delete: false },
    farmers: { view: true, add: false, edit: false, delete: false },
    billing: { view: false, generateDraft: false, finalize: false },
    reports: { view: false, export: false },
    payments: { view: false, record: false },
    inventory: { view: false, manage: false },
};

const PERMISSION_LABELS: Record<string, { label: string; description: string }> = {
    'milkCollection.view': { label: 'View Milk Entries', description: 'Can see milk collection records' },
    'milkCollection.add': { label: 'Add Milk Entry', description: 'Can add new milk collections' },
    'milkCollection.edit': { label: 'Edit Milk Entry', description: 'Can modify existing entries' },
    'milkCollection.delete': { label: 'Delete Milk Entry', description: 'Can delete milk records' },
    'farmers.view': { label: 'View Farmers', description: 'Can see farmer list' },
    'farmers.add': { label: 'Add Farmers', description: 'Can register new farmers' },
    'farmers.edit': { label: 'Edit Farmers', description: 'Can modify farmer details' },
    'farmers.delete': { label: 'Delete Farmers', description: 'Can remove farmers' },
    'billing.view': { label: 'View Bills', description: 'Can see billing information' },
    'billing.generateDraft': { label: 'Generate Draft Bills', description: 'Can create draft bills' },
    'billing.finalize': { label: 'Finalize Bills', description: 'Can finalize and send bills' },
    'reports.view': { label: 'View Reports', description: 'Can access reports' },
    'reports.export': { label: 'Export Reports', description: 'Can download reports' },
    'payments.view': { label: 'View Payments', description: 'Can see payment records' },
    'payments.record': { label: 'Record Payments', description: 'Can record new payments' },
    'inventory.view': { label: 'View Inventory', description: 'Can see product inventory' },
    'inventory.manage': { label: 'Manage Inventory', description: 'Can add/edit products' },
};

export default function StaffManagement() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('staff');
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        salary: '',
        joiningDate: new Date().toISOString().split('T')[0],
    });

    const [permissions, setPermissions] = useState<StaffPermissions>(DEFAULT_PERMISSIONS);

    useEffect(() => {
        fetchStaff();
        fetchAttendance();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('staff')
                .select('*')
                .order('createdAt', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                setStaffList(data as Staff[]);
            } else {
                setStaffList(getDemoStaff());
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            setStaffList(getDemoStaff());
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('attendance')
                .select('*')
                .eq('date', today);

            if (error) throw error;

            if (data && data.length > 0) {
                setAttendance(data as AttendanceRecord[]);
            } else {
                setAttendance(getDemoAttendance());
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setAttendance(getDemoAttendance());
        }
    };

    const getDemoStaff = (): Staff[] => [
        {
            id: '1',
            userId: 'u1',
            name: 'Rajesh Kumar',
            email: 'rajesh@dairy.com',
            phone: '9876543210',
            staffCode: 'STF001',
            permissions: {
                ...DEFAULT_PERMISSIONS,
                milkCollection: { view: true, add: true, edit: true, delete: false },
                farmers: { view: true, add: true, edit: false, delete: false },
            },
            salary: 15000,
            joiningDate: '2024-01-15',
            isActive: true,
            lastActiveAt: new Date().toISOString(),
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: new Date().toISOString(),
        },
        {
            id: '2',
            userId: 'u2',
            name: 'Sunil Sharma',
            email: 'sunil@dairy.com',
            phone: '9876543211',
            staffCode: 'STF002',
            permissions: {
                ...DEFAULT_PERMISSIONS,
                milkCollection: { view: true, add: true, edit: false, delete: false },
            },
            salary: 12000,
            joiningDate: '2024-03-01',
            isActive: true,
            lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
            createdAt: '2024-03-01T10:00:00Z',
            updatedAt: new Date().toISOString(),
        },
        {
            id: '3',
            userId: 'u3',
            name: 'Priya Patel',
            email: 'priya@dairy.com',
            phone: '9876543212',
            staffCode: 'STF003',
            permissions: DEFAULT_PERMISSIONS,
            salary: 10000,
            joiningDate: '2024-06-15',
            isActive: false,
            createdAt: '2024-06-15T10:00:00Z',
            updatedAt: new Date().toISOString(),
        },
    ];

    const getDemoAttendance = (): AttendanceRecord[] => {
        const today = new Date().toISOString().split('T')[0];
        return [
            {
                id: '1',
                staffId: '1',
                staffName: 'Rajesh Kumar',
                date: today,
                checkIn: '08:00',
                checkOut: '17:00',
                status: 'PRESENT',
            },
            {
                id: '2',
                staffId: '2',
                staffName: 'Sunil Sharma',
                date: today,
                checkIn: '08:30',
                status: 'PRESENT',
            },
            {
                id: '3',
                staffId: '3',
                staffName: 'Priya Patel',
                date: today,
                status: 'ABSENT',
                notes: 'On leave',
            },
        ];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone) {
            toast.error('Please fill required fields');
            return;
        }

        try {
            const payload = {
                ...formData,
                salary: formData.salary ? parseFloat(formData.salary) : undefined,
                permissions,
            };

            const url = editingStaff
                ? `/api/staff/${editingStaff.id}`
                : '/api/staff';

            const method = editingStaff ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success(editingStaff ? 'Staff updated!' : 'Staff added!');
                fetchStaff();
                resetForm();
                setShowAddModal(false);
            } else {
                toast.error('Failed to save staff');
            }
        } catch (error) {
            console.error('Error saving staff:', error);
            toast.error('Failed to save staff');
        }
    };

    const handleToggleActive = async (staff: Staff) => {
        try {
            const response = await fetch(`/api/staff/${staff.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !staff.isActive }),
            });

            if (response.ok) {
                toast.success(`Staff ${staff.isActive ? 'deactivated' : 'activated'}!`);
                fetchStaff();
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedStaff) return;

        try {
            const response = await fetch(`/api/staff/${selectedStaff.id}/permissions`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions }),
            });

            if (response.ok) {
                toast.success('Permissions updated!');
                fetchStaff();
                setShowPermissionsModal(false);
            } else {
                toast.error('Failed to update permissions');
            }
        } catch (error) {
            console.error('Error updating permissions:', error);
            toast.error('Failed to update permissions');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this staff member?')) return;

        try {
            const response = await fetch(`/api/staff/${id}`, { method: 'DELETE' });

            if (response.ok) {
                toast.success('Staff removed!');
                fetchStaff();
            } else {
                toast.error('Failed to remove staff');
            }
        } catch (error) {
            console.error('Error removing staff:', error);
            toast.error('Failed to remove staff');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            salary: '',
            joiningDate: new Date().toISOString().split('T')[0],
        });
        setPermissions(DEFAULT_PERMISSIONS);
        setEditingStaff(null);
    };

    const handleEdit = (staff: Staff) => {
        setFormData({
            name: staff.name,
            email: staff.email,
            phone: staff.phone,
            password: '',
            salary: staff.salary?.toString() || '',
            joiningDate: staff.joiningDate || '',
        });
        setPermissions(staff.permissions);
        setEditingStaff(staff);
        setShowAddModal(true);
    };

    const openPermissionsModal = (staff: Staff) => {
        setSelectedStaff(staff);
        setPermissions(staff.permissions);
        setShowPermissionsModal(true);
    };

    const updatePermission = (path: string, value: boolean) => {
        const [category, action] = path.split('.');
        setPermissions(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof StaffPermissions],
                [action]: value,
            },
        }));
    };

    const filteredStaff = staffList.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.staffCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.phone.includes(searchTerm)
    );

    const stats = {
        total: staffList.length,
        active: staffList.filter(s => s.isActive).length,
        inactive: staffList.filter(s => !s.isActive).length,
        presentToday: attendance.filter(a => a.status === 'PRESENT').length,
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive
            ? { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
            : { label: 'Inactive', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
    };

    const getAttendanceStatusBadge = (status: AttendanceRecord['status']) => {
        switch (status) {
            case 'PRESENT':
                return { label: 'Present', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' };
            case 'ABSENT':
                return { label: 'Absent', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' };
            case 'LEAVE':
                return { label: 'On Leave', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' };
            case 'HOLIDAY':
                return { label: 'Holiday', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
            default:
                return { label: status, color: 'bg-gray-100 text-gray-800' };
        }
    };

    const countPermissions = (perms: StaffPermissions): number => {
        let count = 0;
        Object.values(perms).forEach(category => {
            Object.values(category).forEach(value => {
                if (value) count++;
            });
        });
        return count;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading staff...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-green-600" />
                        {t('staff.title', 'Staff Management')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your staff members and their permissions
                    </p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowAddModal(true); }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Staff
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Staff</p>
                                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
                                </div>
                                <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                    <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Staff</p>
                                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
                                </div>
                                <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
                                    <UserCheck className="w-7 h-7 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Inactive</p>
                                    <p className="text-3xl font-bold text-red-900 dark:text-red-100">{stats.inactive}</p>
                                </div>
                                <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center">
                                    <UserX className="w-7 h-7 text-red-600 dark:text-red-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Present Today</p>
                                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.presentToday}</p>
                                </div>
                                <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                                    <Activity className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    <TabsTrigger value="staff" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all">
                        <Users className="w-4 h-4 mr-2" />
                        Staff List
                    </TabsTrigger>
                    <TabsTrigger value="attendance" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md transition-all">
                        <Calendar className="w-4 h-4 mr-2" />
                        Attendance
                    </TabsTrigger>
                </TabsList>

                {/* Staff List Tab */}
                <TabsContent value="staff" className="mt-6">
                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search staff by name, code, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-12 text-lg rounded-xl border-gray-200 dark:border-gray-700"
                            />
                        </div>
                    </div>

                    {/* Staff Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredStaff.map((staff, index) => {
                                const status = getStatusBadge(staff.isActive);
                                const permCount = countPermissions(staff.permissions);
                                return (
                                    <motion.div
                                        key={staff.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden group">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xl font-bold">
                                                            {staff.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <CardTitle className="text-lg">{staff.name}</CardTitle>
                                                            <CardDescription className="flex items-center gap-1">
                                                                <Key className="w-3 h-3" />
                                                                {staff.staffCode}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                    <Badge className={status.color}>{status.label}</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Phone className="w-4 h-4" />
                                                        {staff.phone}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Mail className="w-4 h-4" />
                                                        {staff.email}
                                                    </div>
                                                    {staff.salary && (
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <DollarSign className="w-4 h-4" />
                                                            ₹{staff.salary.toLocaleString('en-IN')}/month
                                                        </div>
                                                    )}
                                                    {staff.joiningDate && (
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <Calendar className="w-4 h-4" />
                                                            Joined: {new Date(staff.joiningDate).toLocaleDateString('en-IN')}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Permissions Badge */}
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        {permCount} permissions enabled
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openPermissionsModal(staff)}
                                                        className="flex-1"
                                                    >
                                                        <Shield className="w-4 h-4 mr-1" />
                                                        Permissions
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(staff)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleToggleActive(staff)}
                                                        className={staff.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}
                                                    >
                                                        {staff.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {filteredStaff.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No staff found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first staff member'}
                            </p>
                            <Button onClick={() => { resetForm(); setShowAddModal(true); }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Staff
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* Attendance Tab */}
                <TabsContent value="attendance" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Attendance</CardTitle>
                            <CardDescription>Track staff attendance and work hours</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {attendance.map((record, index) => {
                                    const statusBadge = getAttendanceStatusBadge(record.status);
                                    return (
                                        <motion.div
                                            key={record.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`flex items-center justify-between p-4 rounded-xl border-2 ${record.status === 'PRESENT'
                                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                                : record.status === 'ABSENT'
                                                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${record.status === 'PRESENT'
                                                    ? 'bg-green-200 dark:bg-green-800'
                                                    : record.status === 'ABSENT'
                                                        ? 'bg-red-200 dark:bg-red-800'
                                                        : 'bg-gray-200 dark:bg-gray-700'
                                                    }`}>
                                                    {record.status === 'PRESENT' ? (
                                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                                    ) : record.status === 'ABSENT' ? (
                                                        <XCircle className="w-6 h-6 text-red-600" />
                                                    ) : (
                                                        <Clock className="w-6 h-6 text-gray-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{record.staffName}</p>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                        {record.checkIn && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                In: {record.checkIn}
                                                            </span>
                                                        )}
                                                        {record.checkOut && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Out: {record.checkOut}
                                                            </span>
                                                        )}
                                                        {record.notes && (
                                                            <span className="italic">{record.notes}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                                        </motion.div>
                                    );
                                })}

                                {attendance.length === 0 && (
                                    <div className="text-center py-12">
                                        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">No attendance records for today</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add/Edit Staff Modal */}
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
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff'}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <Label htmlFor="name" className="text-base">Full Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter full name"
                                        className="h-12 text-lg mt-1"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="phone" className="text-base">Phone *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="9876543210"
                                            className="h-12 text-lg mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email" className="text-base">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="staff@dairy.com"
                                            className="h-12 text-lg mt-1"
                                        />
                                    </div>
                                </div>

                                {!editingStaff && (
                                    <div>
                                        <Label htmlFor="password" className="text-base">Password *</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            placeholder="Create password"
                                            className="h-12 text-lg mt-1"
                                            required={!editingStaff}
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="salary" className="text-base">Salary (₹/month)</Label>
                                        <Input
                                            id="salary"
                                            type="number"
                                            value={formData.salary}
                                            onChange={e => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                                            placeholder="15000"
                                            className="h-12 text-lg mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="joiningDate" className="text-base">Joining Date</Label>
                                        <Input
                                            id="joiningDate"
                                            type="date"
                                            value={formData.joiningDate}
                                            onChange={e => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
                                            className="h-12 text-lg mt-1"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 h-12"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                    >
                                        {editingStaff ? 'Update Staff' : 'Add Staff'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Permissions Modal */}
            <AnimatePresence>
                {showPermissionsModal && selectedStaff && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPermissionsModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                    Permissions for {selectedStaff.name}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    Control what this staff member can access and do
                                </p>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Milk Collection Permissions */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="text-xl">🥛</span> Milk Collection
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 pl-8">
                                        {Object.entries(permissions.milkCollection).map(([key, value]) => (
                                            <label key={`milkCollection.${key}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                                <div>
                                                    <p className="font-medium text-sm">{PERMISSION_LABELS[`milkCollection.${key}`]?.label}</p>
                                                    <p className="text-xs text-gray-500">{PERMISSION_LABELS[`milkCollection.${key}`]?.description}</p>
                                                </div>
                                                <Switch
                                                    checked={value}
                                                    onCheckedChange={(checked) => updatePermission(`milkCollection.${key}`, checked)}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Farmers Permissions */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="text-xl">👨‍🌾</span> Farmers
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 pl-8">
                                        {Object.entries(permissions.farmers).map(([key, value]) => (
                                            <label key={`farmers.${key}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                                <div>
                                                    <p className="font-medium text-sm">{PERMISSION_LABELS[`farmers.${key}`]?.label}</p>
                                                    <p className="text-xs text-gray-500">{PERMISSION_LABELS[`farmers.${key}`]?.description}</p>
                                                </div>
                                                <Switch
                                                    checked={value}
                                                    onCheckedChange={(checked) => updatePermission(`farmers.${key}`, checked)}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Billing Permissions */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className="text-xl">📄</span> Billing
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 pl-8">
                                        {Object.entries(permissions.billing).map(([key, value]) => (
                                            <label key={`billing.${key}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                                <div>
                                                    <p className="font-medium text-sm">{PERMISSION_LABELS[`billing.${key}`]?.label}</p>
                                                    <p className="text-xs text-gray-500">{PERMISSION_LABELS[`billing.${key}`]?.description}</p>
                                                </div>
                                                <Switch
                                                    checked={value}
                                                    onCheckedChange={(checked) => updatePermission(`billing.${key}`, checked)}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Reports & Payments */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="text-xl">📊</span> Reports
                                        </h3>
                                        <div className="space-y-2 pl-8">
                                            {Object.entries(permissions.reports).map(([key, value]) => (
                                                <label key={`reports.${key}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                                                    <span className="text-sm font-medium">{PERMISSION_LABELS[`reports.${key}`]?.label}</span>
                                                    <Switch
                                                        checked={value}
                                                        onCheckedChange={(checked) => updatePermission(`reports.${key}`, checked)}
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="text-xl">💰</span> Payments
                                        </h3>
                                        <div className="space-y-2 pl-8">
                                            {Object.entries(permissions.payments).map(([key, value]) => (
                                                <label key={`payments.${key}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                                                    <span className="text-sm font-medium">{PERMISSION_LABELS[`payments.${key}`]?.label}</span>
                                                    <Switch
                                                        checked={value}
                                                        onCheckedChange={(checked) => updatePermission(`payments.${key}`, checked)}
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowPermissionsModal(false)}
                                    className="flex-1 h-12"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSavePermissions}
                                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                                >
                                    <ShieldCheck className="w-5 h-5 mr-2" />
                                    Save Permissions
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
