// Advances API Route - Complete Implementation
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List advances with filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dairyId = searchParams.get('dairyId')
        const farmerId = searchParams.get('farmerId')
        const status = searchParams.get('status')

        let query = supabase
            .from('advances')
            .select(`
        *,
        farmer:farmers(
          id,
          farmerCode,
          user:users(id, name, phone)
        )
      `)
            .order('givenAt', { ascending: false })

        if (farmerId) query = query.eq('farmerId', farmerId)
        if (status) query = query.eq('status', status)

        // Filter by dairy through farmer
        if (dairyId) {
            const { data: farmerIds } = await supabase
                .from('farmers')
                .select('id')
                .eq('dairyId', dairyId)

            if (farmerIds) {
                query = query.in('farmerId', farmerIds.map(f => f.id))
            }
        }

        const { data, error } = await query

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        // Calculate totals
        const pendingAdvances = data?.filter(a => a.status === 'PENDING') || []
        const totalPending = pendingAdvances.reduce((sum, a) => sum + a.amount, 0)

        return NextResponse.json({
            success: true,
            data,
            summary: {
                total: data?.length || 0,
                pending: pendingAdvances.length,
                totalPendingAmount: totalPending,
            }
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST - Give new advance
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { farmerId, amount, reason } = body

        if (!farmerId || !amount) {
            return NextResponse.json({ success: false, error: 'Farmer ID and amount required' }, { status: 400 })
        }

        if (amount <= 0) {
            return NextResponse.json({ success: false, error: 'Amount must be positive' }, { status: 400 })
        }

        // Check farmer exists
        const { data: farmer, error: farmerError } = await supabase
            .from('farmers')
            .select('id, walletBalance')
            .eq('id', farmerId)
            .single()

        if (farmerError || !farmer) {
            return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 })
        }

        // Create advance
        const { data, error } = await supabase
            .from('advances')
            .insert({
                farmerId,
                amount,
                reason,
                status: 'PENDING',
                givenAt: new Date().toISOString(),
            })
            .select(`
        *,
        farmer:farmers(
          farmerCode,
          user:users(name, phone)
        )
      `)
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        // Update farmer wallet balance (debit)
        await supabase
            .from('farmers')
            .update({
                walletBalance: farmer.walletBalance - amount
            })
            .eq('id', farmerId)

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// PATCH - Repay or cancel advance
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { advanceId, action } = body

        // Get advance
        const { data: advance, error: findError } = await supabase
            .from('advances')
            .select('*, farmer:farmers(walletBalance)')
            .eq('id', advanceId)
            .single()

        if (findError || !advance) {
            return NextResponse.json({ success: false, error: 'Advance not found' }, { status: 404 })
        }

        if (advance.status !== 'PENDING') {
            return NextResponse.json({ success: false, error: 'Advance already processed' }, { status: 400 })
        }

        if (action === 'repay') {
            // Mark as repaid
            await supabase
                .from('advances')
                .update({
                    status: 'REPAID',
                    repaidAt: new Date().toISOString(),
                })
                .eq('id', advanceId)

            // Credit farmer wallet
            await supabase
                .from('farmers')
                .update({
                    walletBalance: advance.farmer.walletBalance + advance.amount
                })
                .eq('id', advance.farmerId)

            return NextResponse.json({ success: true, message: 'Advance repaid' })
        }

        if (action === 'cancel') {
            // Cancel and refund
            await supabase
                .from('advances')
                .update({ status: 'CANCELLED' })
                .eq('id', advanceId)

            // Credit farmer wallet (cancel the debit)
            await supabase
                .from('farmers')
                .update({
                    walletBalance: advance.farmer.walletBalance + advance.amount
                })
                .eq('id', advance.farmerId)

            return NextResponse.json({ success: true, message: 'Advance cancelled' })
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
