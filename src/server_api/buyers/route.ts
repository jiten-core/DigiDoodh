// Buyers API Route - Using Supabase
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List all buyers for a dairy
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dairyId = searchParams.get('dairyId')
        const search = searchParams.get('search')

        let query = supabase
            .from('buyers')
            .select(`
        *,
        user:users(id, name, phone, email)
      `)
            .eq('isActive', true)
            .order('createdAt', { ascending: false })

        if (dairyId) query = query.eq('dairyId', dairyId)

        if (search) {
            query = query.or(`buyerCode.ilike.%${search}%,businessName.ilike.%${search}%`)
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

// POST - Create a new buyer
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            name,
            phone,
            email,
            dairyId,
            businessName,
            businessType,
            gstNumber,
            licenseNumber,
            address,
            creditLimit,
            invoiceFrequency,
            paymentTerms
        } = body

        // Create user first
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                name,
                phone,
                email,
                role: 'BUYER',
                password: '',
            })
            .select()
            .single()

        if (userError) {
            return NextResponse.json({ success: false, error: userError.message }, { status: 400 })
        }

        // Generate buyer code
        const { count } = await supabase
            .from('buyers')
            .select('*', { count: 'exact', head: true })
            .eq('dairyId', dairyId)

        const buyerCode = `B${String((count || 0) + 1).padStart(4, '0')}`

        // Create buyer profile
        const { data, error } = await supabase
            .from('buyers')
            .insert({
                userId: userData.id,
                dairyId,
                buyerCode,
                businessName,
                businessType: businessType || 'INDIVIDUAL',
                gstNumber,
                licenseNumber,
                address,
                creditLimit: creditLimit || 10000,
                invoiceFrequency: invoiceFrequency || 'WEEKLY',
                paymentTerms: paymentTerms || 'NET_30',
            })
            .select(`
        *,
        user:users(id, name, phone, email)
      `)
            .single()

        if (error) {
            await supabase.from('users').delete().eq('id', userData.id)
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
