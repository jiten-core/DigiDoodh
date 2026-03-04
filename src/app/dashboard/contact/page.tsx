'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    Phone,
    Mail,
    MapPin,
    MessageCircle,
    Send,
    Globe,
    Clock,
    Star,
    CheckCircle,
    Headphones,
    ExternalLink
} from 'lucide-react'

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        subject: '',
        message: '',
    })
    const [sending, setSending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name || !formData.phone || !formData.message) {
            toast.error('Please fill required fields')
            return
        }

        setSending(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 1500))
            toast.success('Message sent! We will contact you soon.')
            setFormData({
                name: '',
                phone: '',
                email: '',
                subject: '',
                message: '',
            })
        } catch (error) {
            toast.error('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <Badge className="mb-4 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    24/7 Support Available
                </Badge>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Contact & Support
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Need help with DigiDhoodh? Our team is here to assist you with any questions or issues.
                </p>
            </motion.div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="h-full bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
                        <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Phone className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Call Us</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">For immediate assistance</p>
                            <a href="tel:+919876543210" className="text-2xl font-bold text-green-600 hover:underline">
                                +91 98765 43210
                            </a>
                            <p className="text-sm text-gray-500 mt-2">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Mon-Sat: 8AM - 8PM
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200">
                        <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">WhatsApp</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">Quick chat support</p>
                            <a
                                href="https://wa.me/919876543210"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-2xl font-bold text-blue-600 hover:underline"
                            >
                                +91 98765 43210
                            </a>
                            <p className="text-sm text-gray-500 mt-2">
                                <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
                                Usually replies within 1 hour
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="h-full bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200">
                        <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">For detailed queries</p>
                            <a href="mailto:support@digidhoodh.com" className="text-xl font-bold text-purple-600 hover:underline">
                                support@digidhoodh.com
                            </a>
                            <p className="text-sm text-gray-500 mt-2">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Reply within 24 hours
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Send className="w-5 h-5 text-green-600" />
                                Send Message
                            </CardTitle>
                            <CardDescription>
                                Fill out the form and we'll get back to you as soon as possible.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Name *</Label>
                                        <Input
                                            value={formData.name}
                                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Your name"
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Phone *</Label>
                                        <Input
                                            value={formData.phone}
                                            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="9876543210"
                                            className="mt-1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="your@email.com"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Subject</Label>
                                    <Input
                                        value={formData.subject}
                                        onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                        placeholder="What's this about?"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Message *</Label>
                                    <textarea
                                        value={formData.message}
                                        onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                        placeholder="Describe your issue or question..."
                                        className="w-full mt-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 min-h-[120px]"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={sending}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg"
                                >
                                    {sending ? 'Sending...' : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Send Message
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Company Info */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-6"
                >
                    {/* Office Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-red-600" />
                                Our Office
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">DigiDhoodh Headquarters</p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        123, Dairy Complex Road,<br />
                                        Anand, Gujarat - 388001<br />
                                        India
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full" asChild>
                                    <a
                                        href="https://maps.google.com/?q=Anand,Gujarat"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MapPin className="w-4 h-4 mr-2" />
                                        View on Google Maps
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* FAQ Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Headphones className="w-5 h-5 text-blue-600" />
                                Frequently Asked Questions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="font-medium text-gray-900 dark:text-white">How do I reset my password?</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Go to login page and click "Forgot Password" to receive an OTP on your registered phone.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="font-medium text-gray-900 dark:text-white">How to add a new farmer?</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Navigate to Farmers section and click "+ Add Farmer" button to register new farmers.
                                </p>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="font-medium text-gray-900 dark:text-white">How is milk rate calculated?</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Rates are calculated based on FAT% and SNF% using the rate charts you configure in Settings.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rating */}
                    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200">
                        <CardContent className="p-6 text-center">
                            <div className="flex justify-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="font-bold text-gray-900 dark:text-white">4.8/5 Rating</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Based on 1,247 reviews</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Social Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
            >
                <p className="text-gray-500 mb-4">Follow us on social media</p>
                <div className="flex justify-center gap-4">
                    {['Facebook', 'Twitter', 'Instagram', 'YouTube'].map(social => (
                        <Button key={social} variant="outline" size="lg">
                            <Globe className="w-5 h-5 mr-2" />
                            {social}
                        </Button>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
