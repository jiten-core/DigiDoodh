// Milk Collection API Route - Using Supabase
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List milk collections
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dairyId = searchParams.get('dairyId')
        const farmerId = searchParams.get('farmerId')
        const date = searchParams.get('date')
        const shift = searchParams.get('shift')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        let query = supabase
            .from('milk_collections')
            .select(`
        *,
        farmer:farmers(
          id,
          farmerCode,
          user:users(id, name, phone)
        )
      `)
            .order('collectionDate', { ascending: false })
            .limit(100)

        if (dairyId) query = query.eq('dairyId', dairyId)
        if (farmerId) query = query.eq('farmerId', farmerId)
        if (shift) query = query.eq('shift', shift)

        if (date) {
            query = query.gte('collectionDate', `${date}T00:00:00`)
                .lt('collectionDate', `${date}T23:59:59`)
        }

        if (startDate && endDate) {
            query = query.gte('collectionDate', startDate).lte('collectionDate', endDate)
        }

        const { data, error } = await query

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST - Create milk collection entry
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            dairyId,
            farmerId,
            cattleId,
            staffId,
            shift,
            liters,
            fat,
            snf,
            clr,
            temperature,
            notes
        } = body

        // Calculate rate based on FAT/SNF
        const ratePerLiter = calculateRate(fat, snf)
        const totalAmount = liters * ratePerLiter

        // Determine quality
        const quality = determineQuality(fat, snf)

        const { data, error } = await supabase
            .from('milk_collections')
            .insert({
                dairyId,
                farmerId,
                cattleId,
                staffId,
                shift,
                liters,
                fat,
                snf,
                clr,
                temperature,
                ratePerLiter,
                totalAmount,
                quality,
                notes,
                collectionDate: new Date().toISOString(),
            })
            .select(`
        *,
        farmer:farmers(
          id,
          farmerCode,
          user:users(id, name, phone)
        )
      `)
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        // Note: Real wallet balance update should happen via a database trigger or a proper RPC call.
        // For now, we omit the invalid rpc-in-update usage to prevent crashes.
        await supabase
            .from('farmers')
            .update({
                updatedAt: new Date().toISOString()
            })
            .eq('id', farmerId)

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// Rate calculation based on FAT/SNF
function calculateRate(fat?: number, snf?: number): number {
    if (!fat) return 35.0

    // Basic rate chart logic (can be made configurable)
    if (fat >= 4.5 && snf && snf >= 8.5) return 48.0
    if (fat >= 4.0 && snf && snf >= 8.5) return 45.0
    if (fat >= 4.0 && snf && snf >= 8.0) return 42.0
    if (fat >= 3.5 && snf && snf >= 8.0) return 38.0
    if (fat >= 3.0 && snf && snf >= 7.5) return 35.0
    if (fat >= 3.0) return 32.0
    return 28.0
}

// Quality determination
function determineQuality(fat?: number, snf?: number): string {
    if (!fat) return 'GOOD'

    if (fat >= 4.0 && snf && snf >= 8.5) return 'EXCELLENT'
    if (fat >= 3.5 && snf && snf >= 8.0) return 'GOOD'
    if (fat >= 3.0) return 'AVERAGE'
    return 'POOR'
}
