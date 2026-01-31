// WhatsApp Integration Service
// Handles all WhatsApp Business API interactions

import { supabase } from './supabase'

interface WhatsAppMessage {
    to: string
    template?: string
    templateParams?: Record<string, string>
    message?: string
}

interface BillData {
    farmerName: string
    farmerPhone: string
    billNumber: string
    period: string
    totalLiters: number
    totalAmount: number
    deductions: number
    netAmount: number
    dairyName: string
}

interface MilkSlipData {
    farmerName: string
    farmerPhone: string
    date: string
    shift: 'MORNING' | 'EVENING'
    liters: number
    fat: number
    snf?: number
    rate: number
    amount: number
    dairyName: string
}

class WhatsAppService {
    private apiUrl: string
    private apiToken: string
    private businessId: string

    constructor() {
        this.apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0'
        this.apiToken = process.env.WHATSAPP_API_TOKEN || ''
        this.businessId = process.env.WHATSAPP_BUSINESS_ID || ''
    }

    // Send raw message
    async sendMessage(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const formattedPhone = this.formatPhoneNumber(to)

            const response = await fetch(`${this.apiUrl}/${this.businessId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: formattedPhone,
                    type: 'text',
                    text: { body: message }
                })
            })

            const data = await response.json()

            if (response.ok) {
                await this.logMessage(to, message, 'SENT')
                return { success: true, messageId: data.messages?.[0]?.id }
            } else {
                await this.logMessage(to, message, 'FAILED', data.error?.message)
                return { success: false, error: data.error?.message }
            }
        } catch (error: any) {
            await this.logMessage(to, message, 'FAILED', error.message)
            return { success: false, error: error.message }
        }
    }

    // Send template message
    async sendTemplate(
        to: string,
        templateName: string,
        params: Record<string, string>
    ): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            const formattedPhone = this.formatPhoneNumber(to)

            const components = Object.entries(params).map(([key, value], index) => ({
                type: 'body',
                parameters: [{ type: 'text', text: value }]
            }))

            const response = await fetch(`${this.apiUrl}/${this.businessId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: formattedPhone,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: { code: 'hi' },
                        components
                    }
                })
            })

            const data = await response.json()

            if (response.ok) {
                return { success: true, messageId: data.messages?.[0]?.id }
            } else {
                return { success: false, error: data.error?.message }
            }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    // Send daily milk slip
    async sendMilkSlip(data: MilkSlipData): Promise<{ success: boolean; error?: string }> {
        const shiftLabel = data.shift === 'MORNING' ? 'सुबह' : 'शाम'

        const message = `🥛 *${data.dairyName}*
━━━━━━━━━━━━━━━
📅 दिनांक: ${data.date}
⏰ पाली: ${shiftLabel}

👤 किसान: ${data.farmerName}
━━━━━━━━━━━━━━━
📊 दूध विवरण:
• लीटर: ${data.liters.toFixed(1)} L
• फैट: ${data.fat.toFixed(1)}%
${data.snf ? `• SNF: ${data.snf.toFixed(1)}%` : ''}
• दर: ₹${data.rate.toFixed(2)}/L

💰 कुल राशि: *₹${data.amount.toFixed(2)}*
━━━━━━━━━━━━━━━
✅ DigiDhoodh से भेजा गया`

        return this.sendMessage(data.farmerPhone, message)
    }

    // Send bill notification
    async sendBillNotification(data: BillData): Promise<{ success: boolean; error?: string }> {
        const message = `📄 *बिल अधिसूचना*
━━━━━━━━━━━━━━━
🏪 ${data.dairyName}
📋 बिल नंबर: ${data.billNumber}

👤 किसान: ${data.farmerName}
📆 अवधि: ${data.period}
━━━━━━━━━━━━━━━
📊 विवरण:
• कुल लीटर: ${data.totalLiters.toFixed(1)} L
• कुल राशि: ₹${data.totalAmount.toFixed(2)}
• कटौती: ₹${data.deductions.toFixed(2)}

💰 *शुद्ध राशि: ₹${data.netAmount.toFixed(2)}*
━━━━━━━━━━━━━━━
🔗 विस्तृत बिल के लिए ऐप देखें

✅ DigiDhoodh से भेजा गया`

        return this.sendMessage(data.farmerPhone, message)
    }

    // Send payment reminder
    async sendPaymentReminder(
        farmerPhone: string,
        farmerName: string,
        amount: number,
        dueDate: string,
        dairyName: string
    ): Promise<{ success: boolean; error?: string }> {
        const message = `⚠️ *भुगतान अनुस्मारक*
━━━━━━━━━━━━━━━
🏪 ${dairyName}

👤 प्रिय ${farmerName},

आपका बकाया भुगतान:
💰 *₹${amount.toFixed(2)}*

📅 देय तिथि: ${dueDate}

कृपया समय पर भुगतान करें।
━━━━━━━━━━━━━━━
✅ DigiDhoodh से भेजा गया`

        return this.sendMessage(farmerPhone, message)
    }

    // Send rate change alert
    async sendRateChangeAlert(
        farmerPhone: string,
        farmerName: string,
        oldRate: number,
        newRate: number,
        effectiveFrom: string,
        dairyName: string
    ): Promise<{ success: boolean; error?: string }> {
        const changeType = newRate > oldRate ? '📈 बढ़ोतरी' : '📉 कमी'
        const changeAmount = Math.abs(newRate - oldRate).toFixed(2)

        const message = `📢 *दर परिवर्तन सूचना*
━━━━━━━━━━━━━━━
🏪 ${dairyName}

👤 प्रिय ${farmerName},

${changeType}: ₹${changeAmount}/L

• पुरानी दर: ₹${oldRate.toFixed(2)}/L
• नई दर: ₹${newRate.toFixed(2)}/L

📅 प्रभावी: ${effectiveFrom}
━━━━━━━━━━━━━━━
✅ DigiDhoodh से भेजा गया`

        return this.sendMessage(farmerPhone, message)
    }

    // Format phone number for WhatsApp
    private formatPhoneNumber(phone: string): string {
        // Remove all non-digits
        let cleaned = phone.replace(/\D/g, '')

        // Add India country code if not present
        if (cleaned.length === 10) {
            cleaned = '91' + cleaned
        }

        return cleaned
    }

    // Log message to database
    private async logMessage(
        to: string,
        message: string,
        status: 'SENT' | 'FAILED',
        error?: string
    ): Promise<void> {
        try {
            await supabase.from('notification_logs').insert({
                type: 'WHATSAPP',
                recipient: to,
                content: message.substring(0, 500),
                status,
                error,
                createdAt: new Date().toISOString()
            })
        } catch (e) {
            console.error('Failed to log WhatsApp message:', e)
        }
    }

    // Check if WhatsApp is configured
    isConfigured(): boolean {
        return Boolean(this.apiToken && this.businessId)
    }

    // Get remaining credits
    async getRemainingCredits(dairyId: string): Promise<number> {
        try {
            const { data, error } = await supabase
                .from('dairies')
                .select('whatsappCredits')
                .eq('id', dairyId)
                .single()

            if (error) throw error
            return data?.whatsappCredits || 0
        } catch (error) {
            console.error('Error getting WhatsApp credits:', error)
            return 0
        }
    }

    // Deduct credit after sending
    async deductCredit(dairyId: string): Promise<boolean> {
        try {
            const { error } = await supabase.rpc('decrement_whatsapp_credits', {
                dairy_id: dairyId
            })

            return !error
        } catch (error) {
            console.error('Error deducting WhatsApp credit:', error)
            return false
        }
    }
}

// Export singleton instance
export const whatsappService = new WhatsAppService()

// Export for use in API routes
export default WhatsAppService
