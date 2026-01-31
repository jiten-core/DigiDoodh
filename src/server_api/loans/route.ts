// Loans API Route - Complete Implementation
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List loans with filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dairyId = searchParams.get('dairyId')
        const farmerId = searchParams.get('farmerId')
        const status = searchParams.get('status')

        let query = supabase
            .from('loans')
            .select(`
        *,
        farmer:farmers(
          id,
          farmerCode,
          user:users(id, name, phone)
        ),
        repayments:loan_repayments(*)
      `)
            .order('createdAt', { ascending: false })

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

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST - Create new loan
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            farmerId,
            amount,
            interestRate = 0,
            totalEmis = 1,
            reason,
            startDate
        } = body

        if (!farmerId || !amount) {
            return NextResponse.json({ success: false, error: 'Farmer ID and amount required' }, { status: 400 })
        }

        // Calculate EMI
        const principal = amount
        const rate = interestRate / 100 / 12
        let emiAmount = amount / totalEmis

        if (interestRate > 0 && totalEmis > 1) {
            // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
            emiAmount = principal * rate * Math.pow(1 + rate, totalEmis) / (Math.pow(1 + rate, totalEmis) - 1)
        }

        // Calculate next due date (10 days from start)
        const start = startDate ? new Date(startDate) : new Date()
        const nextDue = new Date(start)
        nextDue.setDate(nextDue.getDate() + 10)

        const { data, error } = await supabase
            .from('loans')
            .insert({
                farmerId,
                amount,
                interestRate,
                emiAmount: Math.round(emiAmount * 100) / 100,
                totalEmis,
                paidEmis: 0,
                status: 'ACTIVE',
                startDate: start.toISOString(),
                nextDueDate: nextDue.toISOString(),
                reason,
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

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// PATCH - Record loan repayment or update status
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { loanId, action, repaymentAmount, paymentMethod } = body

        // Get loan
        const { data: loan, error: findError } = await supabase
            .from('loans')
            .select('*')
            .eq('id', loanId)
            .single()

        if (findError || !loan) {
            return NextResponse.json({ success: false, error: 'Loan not found' }, { status: 404 })
        }

        if (action === 'repay') {
            // Record repayment
            const { error: repayError } = await supabase
                .from('loan_repayments')
                .insert({
                    loanId,
                    amount: repaymentAmount || loan.emiAmount,
                    date: new Date().toISOString(),
                    method: paymentMethod || 'DEDUCTION',
                })

            if (repayError) {
                return NextResponse.json({ success: false, error: repayError.message }, { status: 400 })
            }

            // Update loan
            const newPaidEmis = loan.paidEmis + 1
            const isCompleted = newPaidEmis >= loan.totalEmis

            const nextDue = new Date(loan.nextDueDate)
            nextDue.setDate(nextDue.getDate() + 10)

            await supabase
                .from('loans')
                .update({
                    paidEmis: newPaidEmis,
                    status: isCompleted ? 'COMPLETED' : 'ACTIVE',
                    nextDueDate: isCompleted ? null : nextDue.toISOString(),
                })
                .eq('id', loanId)

            return NextResponse.json({
                success: true,
                message: isCompleted ? 'Loan fully repaid!' : 'Repayment recorded',
                data: { paidEmis: newPaidEmis, status: isCompleted ? 'COMPLETED' : 'ACTIVE' }
            })
        }

        if (action === 'cancel') {
            await supabase
                .from('loans')
                .update({ status: 'CANCELLED' })
                .eq('id', loanId)

            return NextResponse.json({ success: true, message: 'Loan cancelled' })
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
