// Rate Charts API Route - Complete Implementation
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List rate charts
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dairyId = searchParams.get('dairyId')
        const cattleType = searchParams.get('cattleType')
        const activeOnly = searchParams.get('activeOnly') === 'true'

        let query = supabase
            .from('rate_charts')
            .select(`
        *,
        entries:rate_chart_entries(*)
      `)
            .order('effectiveFrom', { ascending: false })

        if (dairyId) query = query.eq('dairyId', dairyId)
        if (cattleType) query = query.eq('cattleType', cattleType)
        if (activeOnly) query = query.eq('isActive', true)

        const { data, error } = await query

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST - Create rate chart with entries
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { dairyId, name, cattleType, effectiveFrom, effectiveTo, entries } = body

        // Deactivate existing active charts for same cattle type
        await supabase
            .from('rate_charts')
            .update({ isActive: false })
            .eq('dairyId', dairyId)
            .eq('cattleType', cattleType)
            .eq('isActive', true)

        // Create rate chart
        const { data: chart, error: chartError } = await supabase
            .from('rate_charts')
            .insert({
                dairyId,
                name,
                cattleType,
                effectiveFrom,
                effectiveTo,
                isActive: true,
            })
            .select()
            .single()

        if (chartError) {
            return NextResponse.json({ success: false, error: chartError.message }, { status: 400 })
        }

        // Create entries
        if (entries && entries.length > 0) {
            const entriesWithChartId = entries.map((entry: any) => ({
                ...entry,
                rateChartId: chart.id,
            }))

            const { error: entriesError } = await supabase
                .from('rate_chart_entries')
                .insert(entriesWithChartId)

            if (entriesError) {
                // Rollback chart creation
                await supabase.from('rate_charts').delete().eq('id', chart.id)
                return NextResponse.json({ success: false, error: entriesError.message }, { status: 400 })
            }
        }

        // Fetch complete chart with entries
        const { data, error } = await supabase
            .from('rate_charts')
            .select(`
        *,
        entries:rate_chart_entries(*)
      `)
            .eq('id', chart.id)
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// Calculate rate based on FAT/SNF
export async function calculateRate(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dairyId = searchParams.get('dairyId')
        const fat = parseFloat(searchParams.get('fat') || '0')
        const snf = parseFloat(searchParams.get('snf') || '0')
        const cattleType = searchParams.get('cattleType') || 'COW'

        // Get active rate chart
        const { data: chart, error } = await supabase
            .from('rate_charts')
            .select(`
        *,
        entries:rate_chart_entries(*)
      `)
            .eq('dairyId', dairyId)
            .eq('cattleType', cattleType)
            .eq('isActive', true)
            .single()

        if (error || !chart) {
            // Return default rate if no chart found
            return NextResponse.json({
                success: true,
                data: {
                    rate: calculateDefaultRate(fat, snf),
                    source: 'default'
                }
            })
        }

        // Find matching entry
        const matchingEntry = chart.entries.find((entry: any) => {
            const fatMatch = fat >= entry.fatMin && fat <= entry.fatMax
            const snfMatch = !entry.snfMin || (snf >= entry.snfMin && snf <= entry.snfMax)
            return fatMatch && snfMatch
        })

        if (matchingEntry) {
            return NextResponse.json({
                success: true,
                data: {
                    rate: matchingEntry.ratePerLiter,
                    source: 'chart',
                    chartId: chart.id,
                    entryId: matchingEntry.id
                }
            })
        }

        // Fallback to default rate
        return NextResponse.json({
            success: true,
            data: {
                rate: calculateDefaultRate(fat, snf),
                source: 'default'
            }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

function calculateDefaultRate(fat: number, snf?: number): number {
    if (!fat) return 35.0

    if (fat >= 4.5 && snf && snf >= 8.5) return 48.0
    if (fat >= 4.0 && snf && snf >= 8.5) return 45.0
    if (fat >= 4.0 && snf && snf >= 8.0) return 42.0
    if (fat >= 3.5 && snf && snf >= 8.0) return 38.0
    if (fat >= 3.0 && snf && snf >= 7.5) return 35.0
    if (fat >= 3.0) return 32.0
    return 28.0
}
