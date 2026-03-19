// Bills API Route - Complete Implementation
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { whatsappService } from '@/lib/whatsapp'

// GET - List bills with filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dairyId = searchParams.get('dairyId')
        const farmerId = searchParams.get('farmerId')
        const status = searchParams.get('status')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
            .from('bills')
            .select(`
        *,
        farmer:farmers(
          id,
          farmerCode,
          user:users(id, name, phone)
        )
      `)
            .order('createdAt', { ascending: false })
            .range(offset, offset + limit - 1)

        if (dairyId) query = query.eq('dairyId', dairyId)
        if (farmerId) query = query.eq('farmerId', farmerId)
        if (status) query = query.eq('status', status)
        if (startDate) query = query.gte('startDate', startDate)
        if (endDate) query = query.lte('endDate', endDate)

        const { data, error, count } = await query

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, data, total: count })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST - Generate a new bill
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { dairyId, farmerId, billingPeriod, startDate, endDate, otherDeductions = 0 } = body

        // Fetch milk collections for the period
        const { data: collections, error: collectionsError } = await supabase
            .from('milk_collections')
            .select('*')
            .eq('dairyId', dairyId)
            .eq('farmerId', farmerId)
            .gte('collectionDate', startDate)
            .lte('collectionDate', endDate)

        if (collectionsError) {
            return NextResponse.json({ success: false, error: collectionsError.message }, { status: 400 })
        }

        // Calculate totals
        const totalLiters = collections?.reduce((sum, c) => sum + c.liters, 0) || 0
        const totalAmount = collections?.reduce((sum, c) => sum + c.totalAmount, 0) || 0

        // Get pending advances
        const { data: advances } = await supabase
            .from('advances')
            .select('amount')
            .eq('farmerId', farmerId)
            .eq('status', 'PENDING')

        const advanceAmount = advances?.reduce((sum, a) => sum + a.amount, 0) || 0

        // Get active loan EMIs
        const { data: loans } = await supabase
            .from('loans')
            .select('emiAmount')
            .eq('farmerId', farmerId)
            .eq('status', 'ACTIVE')

        const loanDeduction = loans?.reduce((sum, l) => sum + l.emiAmount, 0) || 0

        // Calculate net amount
        const netAmount = totalAmount - advanceAmount - loanDeduction - otherDeductions

        // Generate bill number
        const { count } = await supabase
            .from('bills')
            .select('*', { count: 'exact', head: true })
            .eq('dairyId', dairyId)

        const billNumber = `BILL${String((count || 0) + 1).padStart(6, '0')}`

        // Create bill
        const { data: bill, error } = await supabase
            .from('bills')
            .insert({
                dairyId,
                farmerId,
                billNumber,
                billingPeriod,
                startDate,
                endDate,
                totalLiters,
                totalAmount,
                advanceAmount,
                loanDeduction,
                otherDeductions,
                netAmount,
                status: 'DRAFT',
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

        return NextResponse.json({ success: true, data: bill })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// PATCH - Update bill status or send via WhatsApp
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { billId, action, status } = body

        if (action === 'send_whatsapp') {
            // Get bill details
            const { data: bill, error: billError } = await supabase
                .from('bills')
                .select(`
          *,
          farmer:farmers(
            user:users(name, phone)
          ),
          dairy:dairies(name)
        `)
                .eq('id', billId)
                .single()

            if (billError || !bill) {
                return NextResponse.json({ success: false, error: 'Bill not found' }, { status: 404 })
            }

            // Send WhatsApp notification
            const result = await whatsappService.sendBillNotification({
                farmerName: bill.farmer.user.name,
                farmerPhone: bill.farmer.user.phone,
                billNumber: bill.billNumber,
                period: `${bill.startDate} - ${bill.endDate}`,
                totalLiters: bill.totalLiters,
                totalAmount: bill.totalAmount,
                deductions: bill.advanceAmount + bill.loanDeduction + bill.otherDeductions,
                netAmount: bill.netAmount,
                dairyName: bill.dairy.name,
            })

            if (result.success) {
                await supabase
                    .from('bills')
                    .update({ whatsappSent: true, status: 'SENT' })
                    .eq('id', billId)

                return NextResponse.json({ success: true, message: 'Bill sent via WhatsApp' })
            } else {
                return NextResponse.json({ success: false, error: result.error }, { status: 400 })
            }
        }

        // Update status
        if (status) {
            const updateData: any = { status }
            if (status === 'PAID') {
                updateData.paidAt = new Date().toISOString()
            }

            const { data, error } = await supabase
                .from('bills')
                .update(updateData)
                .eq('id', billId)
                .select()
                .single()

            if (error) {
                return NextResponse.json({ success: false, error: error.message }, { status: 400 })
            }

            return NextResponse.json({ success: true, data })
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
