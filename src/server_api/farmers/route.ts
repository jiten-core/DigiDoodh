// Farmers API Route - Using Supabase
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List all farmers for a dairy
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dairyId = searchParams.get('dairyId')
        const search = searchParams.get('search')
        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = supabase
            .from('farmers')
            .select(`
        *,
        user:users(id, name, phone, email, avatar)
      `)
            .eq('isActive', true)
            .order('createdAt', { ascending: false })
            .range(offset, offset + limit - 1)

        if (dairyId) {
            query = query.eq('dairyId', dairyId)
        }

        if (search) {
            query = query.or(`farmerCode.ilike.%${search}%,user.name.ilike.%${search}%,user.phone.ilike.%${search}%`)
        }

        const { data, error, count } = await query

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            data,
            total: count,
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST - Create a new farmer
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, phone, email, dairyId, aadharNumber, bankAccount, ifsc, upiId, address, village } = body

        // First create the user
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                name,
                phone,
                email,
                role: 'FARMER',
                password: '', // OTP based auth
            })
            .select()
            .single()

        if (userError) {
            return NextResponse.json({ success: false, error: userError.message }, { status: 400 })
        }

        // Generate farmer code
        const { count } = await supabase
            .from('farmers')
            .select('*', { count: 'exact', head: true })
            .eq('dairyId', dairyId)

        const farmerCode = `F${String((count || 0) + 1).padStart(4, '0')}`

        // Create farmer profile
        const { data, error } = await supabase
            .from('farmers')
            .insert({
                userId: userData.id,
                dairyId,
                farmerCode,
                aadharNumber,
                bankAccount,
                ifsc,
                upiId,
                address,
                village,
            })
            .select(`
        *,
        user:users(id, name, phone, email)
      `)
            .single()

        if (error) {
            // Rollback user creation
            await supabase.from('users').delete().eq('id', userData.id)
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
