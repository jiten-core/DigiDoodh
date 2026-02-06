'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isDemoMode } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import {
    Database,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Server,
    RefreshCw,
    Table as TableIcon,
    PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DatabaseHealthCheck() {
    const [status, setStatus] = useState<'testing' | 'connected' | 'error' | 'demo'>('testing');
    const [tables, setTables] = useState<{ name: string, exists: boolean }[]>([]);
    const [isChecking, setIsChecking] = useState(false);

    const checkConnection = async () => {
        setIsChecking(true);
        if (isDemoMode) {
            setStatus('demo');
            setIsChecking(false);
            return;
        }

        try {
            // Test 1: Connection to Supabase
            const { data, error: connError } = await supabase.from('dairies').select('count');

            const tablesToCheck = [
                'dairies',
                'farmers',
                'milk_entries',
                'rate_charts',
                'inventory_products',
                'farmer_bills'
            ];

            const results = await Promise.all(tablesToCheck.map(async (table) => {
                const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
                return { name: table, exists: !error || error.code !== '42P01' }; // 42P01 is "relation does not exist"
            }));

            setTables(results);

            const missingTables = results.filter(t => !t.exists);
            if (missingTables.length > 0) {
                setStatus('error');
            } else {
                setStatus('connected');
            }

        } catch (err) {
            setStatus('error');
        } finally {
            setIsChecking(false);
        }
    };

    const seedTestData = async () => {
        try {
            if (isDemoMode) {
                toast.error('Cannot seed data in Demo/Offline mode');
                return;
            }

            const testId = '00000000-0000-0000-0000-000000000000'; // Placeholder or actual UID if needed

            // 1. Check if dairy exists
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                toast.error('Please sign in first to seed data to your account');
                return;
            }

            // 2. Create Dairy
            const { error: dError } = await supabase.from('dairies').upsert({
                id: userData.user.id,
                dairy_name: 'My New Dairy',
                owner_name: 'Test Owner',
                plan_id: 'PREMIUM'
            });

            if (dError) throw dError;

            // 3. Create a Farmer
            const { error: fError } = await supabase.from('farmers').insert({
                dairy_id: userData.user.id,
                code: 'TEST01',
                name: 'John Doe (Test)',
                phone: '1234567890'
            });

            toast.success('Test data created successfully! Check your dashboard.');
        } catch (err: any) {
            toast.error('Setup failed: ' + err.message);
        }
    };

    useEffect(() => {
        checkConnection();
    }, []);

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-dairy-600" />
                    <h3 className="font-bold text-lg">System Connection</h3>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={seedTestData}
                        className="rounded-full text-xs font-bold border-dairy-200 text-dairy-700 hover:bg-dairy-50"
                    >
                        <PlayCircle className="w-4 h-4 mr-1" />
                        Seed Data
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={checkConnection}
                        disabled={isChecking}
                        className="rounded-full"
                    >
                        <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {/* Connection Status */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Server className="w-4 h-4" /> Environment
                    </span>
                    {status === 'demo' ? (
                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Demo Mode (Offline)</Badge>
                    ) : status === 'connected' ? (
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Live (Supabase Connected)</Badge>
                    ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Connection Error</Badge>
                    )}
                </div>

                {/* Tables Check */}
                {status !== 'demo' && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Database Structure</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {tables.map(table => (
                                <div key={table.name} className="flex items-center justify-between p-2 rounded-lg border border-border/50">
                                    <span className="flex items-center gap-2">
                                        <TableIcon className="w-3 h-3 opacity-50" />
                                        {table.name.split('_').join(' ')}
                                    </span>
                                    {table.exists ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-500" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {tables.some(t => !t.exists) && (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 rounded-xl">
                                <p className="text-xs text-red-700 dark:text-red-400 font-medium flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 shrink-0" />
                                    Some tables are missing. Please run the SQL schema in your Supabase Dashboard.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
