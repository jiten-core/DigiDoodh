'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    X,
    Send,
    User,
    Clock,
    Wifi,
    WifiOff,
    ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { createAISession, appendToAISession, getAISessionHistory } from '@/lib/ai-context';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

/**
 * DoodhAI - Bharat-First AI Assistant
 * Philosophy: Simple, helpful, like a trusted neighbor
 * Design: High contrast, large text, one-thumb operation
 */
export default function DoodhAI() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [contextId, setContextId] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Check online status
    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Initial session setup
    useEffect(() => {
        const initSession = async () => {
            try {
                const sysPrompt = "Aap DoodhAI hain, DigiDhoodh ka madad karne wala saathi. Aap dairy maalik aur kisano ko doodh record, billing, aur dairy kaam mein madad karte hain. Chhote aur saaf jawab dein.";
                const session = await createAISession(sysPrompt);
                setContextId(session.id);
                setMessages([{ role: 'assistant', content: 'Namaste! 🙏 Kaise madad kar sakta hoon?' }]);
            } catch (error) {
                console.error('AI Init failed:', error);
                setMessages([{ role: 'assistant', content: 'Namaste! Aaj aapki kya seva karein?' }]);
            }
        };
        initSession();
    }, []);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            if (contextId) {
                await appendToAISession(contextId, userMsg);
            }

            // Simulated response (connect to actual LLM in production)
            setTimeout(async () => {
                const aiMsg: Message = {
                    role: 'assistant',
                    content: `Samajh gaya. "${input.slice(0, 30)}..." ke baare mein madad karta hoon. Aap kya jaanna chahte hain?`
                };

                if (contextId) {
                    await appendToAISession(contextId, aiMsg);
                }
                setMessages(prev => [...prev, aiMsg]);
                setIsLoading(false);
            }, 800);

        } catch (error) {
            console.error('Chat Error:', error);
            setIsLoading(false);
        }
    };

    // Quick action buttons - common queries
    const quickActions = [
        { label: 'Aaj ka doodh?', query: 'Aaj kitna doodh aaya?' },
        { label: 'Baki paisa?', query: 'Mera baki paisa kitna hai?' },
        { label: 'Bill banao', query: 'Naya bill kaise banaye?' },
    ];

    return (
        <>
            {/* Floating Button - Saffron, 56px touch target */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-20 right-4 z-50 w-14 h-14 bg-[#FF9933] text-white rounded-full shadow-lg flex items-center justify-center"
                    style={{ minWidth: 56, minHeight: 56 }}
                    aria-label="Madad chahiye?"
                >
                    <MessageCircle className="w-7 h-7" />
                </motion.button>
            )}

            {/* Chat Panel - Full screen on mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 bg-[#FFF8E7] flex flex-col"
                    >
                        {/* Header - Simple, high contrast */}
                        <div className="bg-[#FF9933] text-white p-4 flex items-center gap-4 safe-area-top">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20"
                                style={{ minWidth: 44, minHeight: 44 }}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-hindi)' }}>
                                    मदद चैट
                                </h2>
                                <div className="flex items-center gap-2 text-sm opacity-90">
                                    {isOnline ? (
                                        <>
                                            <Wifi className="w-4 h-4" />
                                            <span>Online</span>
                                        </>
                                    ) : (
                                        <>
                                            <WifiOff className="w-4 h-4" />
                                            <span>Offline - Jawab baad mein milega</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Messages - Large text, paper-like feel */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4"
                            style={{ background: 'linear-gradient(to bottom, #FFF8E7, #FFFDF5)' }}
                        >
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex gap-3",
                                        msg.role === 'user' ? "flex-row-reverse" : ""
                                    )}
                                >
                                    {/* Avatar */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg font-bold",
                                        msg.role === 'user'
                                            ? "bg-[#1A1A1A] text-white"
                                            : "bg-[#228B22] text-white"
                                    )}>
                                        {msg.role === 'user' ? 'आप' : '🥛'}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={cn(
                                        "max-w-[75%] p-4 rounded-2xl",
                                        msg.role === 'user'
                                            ? "bg-[#1A1A1A] text-white rounded-tr-sm"
                                            : "bg-white text-[#1A1A1A] rounded-tl-sm shadow-sm border border-gray-100"
                                    )}
                                        style={{ fontSize: 18, lineHeight: 1.6 }}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#228B22] text-white flex items-center justify-center text-lg">
                                        🥛
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-[#228B22] rounded-full animate-bounce" />
                                            <span className="w-2 h-2 bg-[#228B22] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                            <span className="w-2 h-2 bg-[#228B22] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions - Only show when no messages yet */}
                            {messages.length <= 1 && (
                                <div className="pt-4">
                                    <p className="text-sm text-gray-500 mb-3 font-medium">Seedha poochein:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {quickActions.map((action, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setInput(action.query);
                                                }}
                                                className="px-4 py-3 bg-white border-2 border-[#FF9933] text-[#FF9933] rounded-full text-base font-medium hover:bg-[#FF9933] hover:text-white transition-colors"
                                                style={{ minHeight: 48 }}
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Bar - 56px height, full width primary */}
                        <div className="bg-white border-t border-gray-200 p-4 safe-area-bottom">
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Sawaal likhein..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="flex-1 h-14 px-5 text-lg rounded-2xl border-2 border-gray-200 focus:border-[#FF9933] bg-[#FFF8E7]"
                                    style={{ fontSize: 18, minHeight: 56 }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="w-14 h-14 bg-[#FF9933] text-white rounded-2xl flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
                                    style={{ minWidth: 56, minHeight: 56 }}
                                >
                                    <Send className="w-6 h-6" />
                                </button>
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-3">
                                Aapka digital padosi jo dairy samajhta hai
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
