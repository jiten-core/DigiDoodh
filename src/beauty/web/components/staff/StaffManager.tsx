'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Users,
    UserPlus,
    Shield,
    ShieldCheck,
    Lock,
    Unlock,
    Trash2,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isDemoMode } from '@/lib/supabase';

interface StaffMember {
    id: string;
    name: string;
    phone: string;
    role: 'STAFF' | 'MANAGER' | 'OWNER';
    permissions: string[];
    status: 'ACTIVE' | 'INACTIVE';
    lastActive?: string;
}

const PERMISSIONS = [
    { id: 'milk_entry', label: 'Add Milk Entry', labelHi: 'दूध एंट्री जोड़ें' },
    { id: 'edit_milk', label: 'Edit Milk Entry (Same Day)', labelHi: 'दूध एंट्री सुधारें (उसी दिन)' },
    { id: 'view_ledger', label: 'View Farmer Ledgers', labelHi: 'किसान का हिसाब देखें' },
    { id: 'manage_farmers', label: 'Manage Farmers', labelHi: 'किसान प्रबंधन' },
    { id: 'manage_buyers', label: 'Manage Buyers', labelHi: 'खरीदार प्रबंधन' },
    { id: 'generate_bills', label: 'Generate Draft Bills', labelHi: 'ड्राफ्ट बिल बनाएं' },
    { id: 'finalize_bills', label: 'Finalize Bills', labelHi: 'बिल फाइनल करें' },
    { id: 'manage_inventory', label: 'Manage Inventory', labelHi: 'इन्वेंट्री मैनेजमेंट' },
];

export default function StaffManager() {
    const { profile } = useAuth();
    const { t, i18n } = useTranslation();
    const isHindi = i18n.language === 'hi';
    const [staffList, setStaffList] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

    useEffect(() => {
        fetchStaff();
    }, [profile?.dairy?.id]);

    const fetchStaff = async () => {
        if (!profile?.dairy?.id && !isDemoMode) return;
        setLoading(true);
        try {
            if (isDemoMode) {
                const mockStaff: StaffMember[] = [
                    { id: 's1', name: 'Amit Sharma', phone: '9001234567', role: 'STAFF', permissions: ['milk_entry'], status: 'ACTIVE', lastActive: '2024-01-22T10:00:00Z' },
                    { id: 's2', name: 'Rahul Verma', phone: '9001234568', role: 'MANAGER', permissions: ['milk_entry', 'edit_milk', 'view_ledger', 'generate_bills'], status: 'ACTIVE', lastActive: '2024-01-22T09:30:00Z' },
                ];
                setStaffList(mockStaff);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('staff')
                .select('*')
                .eq('dairy_id', profile?.dairy?.id);

            if (error) throw error;

            setStaffList((data || []).map(s => ({
                id: s.id,
                name: s.name,
                phone: s.phone,
                role: s.role as any,
                permissions: s.permissions || [],
                status: s.status as any,
                lastActive: s.created_at
            })));
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast.error('Failed to load staff');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (staffId: string, permId: string) => {
        setStaffList(prev => prev.map(s => {
            if (s.id === staffId) {
                const newPerms = s.permissions.includes(permId)
                    ? s.permissions.filter(p => p !== permId)
                    : [...s.permissions, permId];
                return { ...s, permissions: newPerms };
            }
            return s;
        }));
        toast.success(isHindi ? 'अनुमति अपडेट की गई' : 'Permissions updated');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-8 h-8 text-dairy-600" />
                        {isHindi ? 'स्टाफ मैनेजमेंट' : 'Staff Management'}
                    </h2>
                    <p className="text-muted-foreground">
                        {isHindi ? 'अपनी टीम और उनकी अनुमतियां प्रबंधित करें' : 'Manage your team and their permissions'}
                    </p>
                </div>
                <Button className="btn-dairy">
                    <UserPlus className="w-5 h-5 mr-2" />
                    {isHindi ? 'नया स्टाफ जोड़ें' : 'Add New Staff'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Staff List */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>{isHindi ? 'स्टाफ सूची' : 'Staff List'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {staffList.map((member) => (
                            <div
                                key={member.id}
                                onClick={() => setSelectedStaff(member)}
                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedStaff?.id === member.id ? 'border-dairy-500 bg-dairy-50/50' : 'border-transparent hover:bg-muted'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full border-2 border-dairy-100 flex items-center justify-center font-bold text-dairy-700 bg-white">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold">{member.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.phone}</p>
                                    </div>
                                </div>
                                <Badge className={member.role === 'MANAGER' ? 'bg-saffron-100 text-saffron-700' : 'bg-blue-100 text-blue-700'}>
                                    {member.role}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Permissions Management */}
                <div className="lg:col-span-2">
                    {selectedStaff ? (
                        <Card className="card-premium">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">{selectedStaff.name}</CardTitle>
                                    <CardDescription>{isHindi ? 'भूमिका और अनुमतियां' : 'Role & Permissions'}</CardDescription>
                                </div>
                                <Button variant="destructive" size="icon" className="rounded-xl">
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Role Section */}
                                <div className="bg-muted/50 p-6 rounded-3xl border border-border">
                                    <div className="flex items-center gap-3 mb-4">
                                        <ShieldCheck className="w-6 h-6 text-dairy-600" />
                                        <h3 className="font-bold text-lg">{isHindi ? 'भूमिका' : 'Role'}</h3>
                                    </div>
                                    <div className="flex gap-4">
                                        {['STAFF', 'MANAGER'].map((r) => (
                                            <Button
                                                key={r}
                                                variant={selectedStaff.role === r ? 'default' : 'outline'}
                                                onClick={() => setStaffList(prev => prev.map(s => s.id === selectedStaff.id ? { ...s, role: r as any } : s))}
                                                className={`flex-1 h-14 rounded-2xl font-bold ${selectedStaff.role === r ? 'bg-dairy-600' : ''}`}
                                            >
                                                {r}
                                            </Button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-4 italic flex items-center gap-2">
                                        <Info className="w-4 h-4" />
                                        {isHindi ? 'मैनेजर बिल फाइनल कर सकता है और हिसाब देख सकता है।' : 'Managers can finalize bills and view full ledgers.'}
                                    </p>
                                </div>

                                {/* Permissions Matrix */}
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <Lock className="w-6 h-6 text-dairy-600" />
                                        <h3 className="font-bold text-lg">{isHindi ? 'अनुमतियां' : 'Detailed Permissions'}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {PERMISSIONS.map((perm) => (
                                            <div
                                                key={perm.id}
                                                className="flex items-center space-x-3 p-4 rounded-2xl border-2 border-border hover:border-dairy-200 transition-all"
                                            >
                                                <Checkbox
                                                    id={perm.id}
                                                    checked={selectedStaff.permissions.includes(perm.id)}
                                                    onCheckedChange={() => togglePermission(selectedStaff.id, perm.id)}
                                                    className="w-6 h-6 rounded-lg data-[state=checked]:bg-dairy-600"
                                                />
                                                <Label
                                                    htmlFor={perm.id}
                                                    className="font-medium cursor-pointer flex-1 py-1"
                                                >
                                                    {isHindi ? perm.labelHi : perm.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-dashed flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Unlock className="w-4 h-4" />
                                        <span>{isHindi ? 'अंतिम सक्रियता:' : 'Last active:'} {new Date(selectedStaff.lastActive!).toLocaleString()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="rounded-xl px-8 h-12">
                                            {isHindi ? 'सस्पेंड करें' : 'Suspend'}
                                        </Button>
                                        <Button className="btn-dairy px-10 h-12">
                                            {isHindi ? 'कैश/पासवर्ड रीसेट' : 'Reset Password'}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-full flex items-center justify-center p-20 border-2 border-dashed border-border bg-muted/20">
                            <div className="text-center">
                                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                                <p className="text-muted-foreground font-bold">
                                    {isHindi ? 'अनुमतियां देखने के लिए किसी को चुनें' : 'Select a staff member to manage permissions'}
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
