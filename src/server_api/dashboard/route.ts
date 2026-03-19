// Dashboard Stats API Route
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dairyId = searchParams.get('dairyId')

        if (!dairyId) {
            return NextResponse.json({ success: false, error: 'Dairy ID required' }, { status: 400 })
        }

        const today = new Date().toISOString().split('T')[0]
        const startOfMonth = new Date(new Date().setDate(1)).toISOString().split('T')[0]

        // Today's collection
        const { data: todayCollections } = await supabase
            .from('milk_collections')
            .select('liters, totalAmount')
            .eq('dairyId', dairyId)
            .gte('collectionDate', `${today}T00:00:00`)
            .lt('collectionDate', `${today}T23:59:59`)

        const todayLiters = todayCollections?.reduce((sum, c) => sum + c.liters, 0) || 0
        const todayAmount = todayCollections?.reduce((sum, c) => sum + c.totalAmount, 0) || 0

        // Yesterday's collection for comparison
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        const { data: yesterdayCollections } = await supabase
            .from('milk_collections')
            .select('liters')
            .eq('dairyId', dairyId)
            .gte('collectionDate', `${yesterday}T00:00:00`)
            .lt('collectionDate', `${yesterday}T23:59:59`)

        const yesterdayLiters = yesterdayCollections?.reduce((sum, c) => sum + c.liters, 0) || 0
        const collectionChange = yesterdayLiters > 0
            ? ((todayLiters - yesterdayLiters) / yesterdayLiters * 100)
            : 0

        // Total farmers
        const { count: totalFarmers } = await supabase
            .from('farmers')
            .select('*', { count: 'exact', head: true })
            .eq('dairyId', dairyId)

        const { count: activeFarmers } = await supabase
            .from('farmers')
            .select('*', { count: 'exact', head: true })
            .eq('dairyId', dairyId)
            .eq('isActive', true)

        // Total buyers
        const { count: totalBuyers } = await supabase
            .from('buyers')
            .select('*', { count: 'exact', head: true })
            .eq('dairyId', dairyId)

        const { count: activeBuyers } = await supabase
            .from('buyers')
            .select('*', { count: 'exact', head: true })
            .eq('dairyId', dairyId)
            .eq('isActive', true)

        // Pending payments (unpaid bills)
        const { data: pendingBills } = await supabase
            .from('bills')
            .select('netAmount')
            .eq('dairyId', dairyId)
            .in('status', ['DRAFT', 'SENT', 'OVERDUE'])

        const pendingAmount = pendingBills?.reduce((sum, b) => sum + b.netAmount, 0) || 0
        const pendingCount = pendingBills?.length || 0

        // Monthly collection
        const { data: monthCollections } = await supabase
            .from('milk_collections')
            .select('liters, totalAmount')
            .eq('dairyId', dairyId)
            .gte('collectionDate', startOfMonth)

        const monthlyLiters = monthCollections?.reduce((sum, c) => sum + c.liters, 0) || 0
        const monthlyAmount = monthCollections?.reduce((sum, c) => sum + c.totalAmount, 0) || 0

        // Average FAT for today
        const { data: fatData } = await supabase
            .from('milk_collections')
            .select('fat')
            .eq('dairyId', dairyId)
            .gte('collectionDate', `${today}T00:00:00`)
            .not('fat', 'is', null)

        const avgFat = fatData && fatData.length > 0
            ? fatData.reduce((sum, c) => sum + (c.fat || 0), 0) / fatData.length
            : 0

        // Recent entries
        const { data: recentEntries } = await supabase
            .from('milk_collections')
            .select(`
        *,
        farmer:farmers(
          farmerCode,
          user:users(name)
        )
      `)
            .eq('dairyId', dairyId)
            .order('createdAt', { ascending: false })
            .limit(5)

        // Low stock alerts
        const { data: lowStockItems } = await supabase
            .from('inventory')
            .select(`
        *,
        product:products(name, unit)
      `)
            .eq('dairyId', dairyId)
            .lt('currentStock', 10) // Mock threshold for now to fix build

        return NextResponse.json({
            success: true,
            data: {
                todayCollection: {
                    liters: todayLiters,
                    amount: todayAmount,
                    entries: todayCollections?.length || 0,
                    change: collectionChange,
                    avgFat,
                },
                totalFarmers: {
                    count: totalFarmers || 0,
                    active: activeFarmers || 0,
                },
                totalBuyers: {
                    count: totalBuyers || 0,
                    active: activeBuyers || 0,
                },
                pendingPayments: {
                    amount: pendingAmount,
                    count: pendingCount,
                },
                monthlyStats: {
                    liters: monthlyLiters,
                    amount: monthlyAmount,
                },
                recentEntries: recentEntries || [],
                lowStockAlerts: lowStockItems || [],
            }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
