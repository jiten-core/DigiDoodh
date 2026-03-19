// Notifications API Route - Complete Implementation
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { whatsappService } from '@/lib/whatsapp'

// GET - List notifications
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const dairyId = searchParams.get('dairyId')
        const unreadOnly = searchParams.get('unreadOnly') === 'true'
        const limit = parseInt(searchParams.get('limit') || '50')

        let query = supabase
            .from('notifications')
            .select('*')
            .order('createdAt', { ascending: false })
            .limit(limit)

        if (dairyId) query = query.eq('dairyId', dairyId)
        if (unreadOnly) query = query.eq('isRead', false)

        const { data, error } = await query

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        // Get unread count
        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('dairyId', dairyId)
            .eq('isRead', false)

        return NextResponse.json({
            success: true,
            data,
            unreadCount: count || 0,
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// POST - Create and send notification
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            dairyId,
            title,
            message,
            type,
            recipients,  // Array of phone numbers
            sendVia = 'IN_APP'  // IN_APP, WHATSAPP, BOTH
        } = body

        // Create notification record
        const { data: notification, error } = await supabase
            .from('notifications')
            .insert({
                dairyId,
                title,
                message,
                type,
                isRead: false,
                sentVia: sendVia,
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }

        // Send WhatsApp if requested
        if ((sendVia === 'WHATSAPP' || sendVia === 'BOTH') && recipients?.length > 0) {
            const fullMessage = `📢 *${title}*\n\n${message}\n\n- DigiDhoodh`

            const results = await Promise.all(
                recipients.map((phone: string) => whatsappService.sendMessage(phone, fullMessage))
            )

            const successCount = results.filter(r => r.success).length
            const failCount = results.length - successCount

            // Log results
            await supabase.from('notification_logs').insert({
                notificationId: notification.id,
                type: 'WHATSAPP',
                successCount,
                failCount,
                createdAt: new Date().toISOString(),
            })

            return NextResponse.json({
                success: true,
                data: notification,
                whatsappResults: { sent: successCount, failed: failCount }
            })
        }

        return NextResponse.json({ success: true, data: notification })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// PATCH - Mark as read
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { notificationId, action, dairyId } = body

        if (action === 'mark_read') {
            await supabase
                .from('notifications')
                .update({ isRead: true })
                .eq('id', notificationId)

            return NextResponse.json({ success: true, message: 'Marked as read' })
        }

        if (action === 'mark_all_read') {
            await supabase
                .from('notifications')
                .update({ isRead: true })
                .eq('dairyId', dairyId)
                .eq('isRead', false)

            return NextResponse.json({ success: true, message: 'All marked as read' })
        }

        if (action === 'delete') {
            await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId)

            return NextResponse.json({ success: true, message: 'Notification deleted' })
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
