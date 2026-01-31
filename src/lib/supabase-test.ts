// DigiDhoodh - Supabase Connection Test Utility
// Use this to verify database connection and run diagnostics

import { supabase, isDemoMode } from './supabase';

interface ConnectionTestResult {
    connected: boolean;
    demoMode: boolean;
    latency?: number;
    tables?: string[];
    error?: string;
    timestamp: string;
}

/**
 * Test the Supabase connection and return diagnostics
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const result: ConnectionTestResult = {
        connected: false,
        demoMode: isDemoMode,
        timestamp: new Date().toISOString(),
    };

    if (isDemoMode) {
        console.warn('⚠️ Running in DEMO MODE - Supabase credentials not configured');
        result.connected = false;
        result.error = 'Demo mode - configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY';
        return result;
    }

    try {
        // Test auth service
        const { data: authData, error: authError } = await supabase.auth.getSession();

        if (authError) {
            throw new Error(`Auth service error: ${authError.message}`);
        }

        // Test database with a simple query
        const { data, error } = await supabase
            .from('_prisma_migrations')
            .select('id')
            .limit(1);

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is "table not found" which is ok for testing
            throw new Error(`Database error: ${error.message}`);
        }

        result.connected = true;
        result.latency = Date.now() - startTime;

        // Try to list available tables
        const { data: tables } = await supabase.rpc('get_tables');
        if (tables) {
            result.tables = tables;
        }

        console.log('✅ Supabase connection successful');
        console.log(`⏱️ Latency: ${result.latency}ms`);

    } catch (error: any) {
        result.connected = false;
        result.error = error.message;
        console.error('❌ Supabase connection failed:', error.message);
    }

    return result;
}

/**
 * Initialize the database with required tables (for first-time setup)
 */
export async function initializeDatabase(): Promise<{ success: boolean; error?: string }> {
    if (isDemoMode) {
        return { success: false, error: 'Cannot initialize database in demo mode' };
    }

    try {
        // The tables should be created by Prisma migrations
        // This function is for verifying the setup
        const requiredTables = [
            'User',
            'Dairy',
            'Farmer',
            'Staff',
            'Buyer',
            'MilkCollection',
            'RateChart',
            'Bill',
            'Product',
            'Inventory',
        ];

        console.log('🔄 Checking database tables...');

        for (const table of requiredTables) {
            const { error } = await supabase
                .from(table)
                .select('id')
                .limit(1);

            if (error && error.code === 'PGRST116') {
                console.warn(`⚠️ Table "${table}" not found - run Prisma migrations`);
            } else if (error) {
                console.error(`❌ Error checking table "${table}":`, error.message);
            } else {
                console.log(`✅ Table "${table}" exists`);
            }
        }

        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
    users?: number;
    dairies?: number;
    farmers?: number;
    milkCollections?: number;
    error?: string;
}> {
    if (isDemoMode) {
        return {
            users: 1247,
            dairies: 1247,
            farmers: 45678,
            milkCollections: 1234567,
        };
    }

    try {
        const [users, dairies, farmers, collections] = await Promise.all([
            supabase.from('User').select('id', { count: 'exact', head: true }),
            supabase.from('Dairy').select('id', { count: 'exact', head: true }),
            supabase.from('Farmer').select('id', { count: 'exact', head: true }),
            supabase.from('MilkCollection').select('id', { count: 'exact', head: true }),
        ]);

        return {
            users: users.count || 0,
            dairies: dairies.count || 0,
            farmers: farmers.count || 0,
            milkCollections: collections.count || 0,
        };

    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Health check endpoint data
 */
export async function getHealthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    database: { status: string; latency?: number };
    auth: { status: string };
    storage: { status: string };
}> {
    const health = {
        status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
        database: { status: 'unknown' as string, latency: undefined as number | undefined },
        auth: { status: 'unknown' as string },
        storage: { status: 'unknown' as string },
    };

    if (isDemoMode) {
        return {
            status: 'degraded',
            database: { status: 'demo_mode' },
            auth: { status: 'demo_mode' },
            storage: { status: 'demo_mode' },
        };
    }

    try {
        // Test database
        const dbStart = Date.now();
        const { error: dbError } = await supabase.from('User').select('id').limit(1);
        health.database.latency = Date.now() - dbStart;
        health.database.status = dbError ? 'error' : 'healthy';

        // Test auth
        const { error: authError } = await supabase.auth.getSession();
        health.auth.status = authError ? 'error' : 'healthy';

        // Test storage
        const { error: storageError } = await supabase.storage.listBuckets();
        health.storage.status = storageError ? 'error' : 'healthy';

        // Determine overall status
        const statuses = [health.database.status, health.auth.status, health.storage.status];
        if (statuses.every(s => s === 'healthy')) {
            health.status = 'healthy';
        } else if (statuses.some(s => s === 'error')) {
            health.status = 'unhealthy';
        } else {
            health.status = 'degraded';
        }

    } catch (error) {
        health.status = 'unhealthy';
    }

    return health;
}

export default {
    testConnection: testSupabaseConnection,
    initializeDatabase,
    getDatabaseStats,
    getHealthCheck,
};
