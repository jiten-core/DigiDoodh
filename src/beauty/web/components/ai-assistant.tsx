'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, Send, User, Sparkles } from 'lucide-react';

export default function AIAssistant() {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your DigiDhoodh AI assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, { role: 'user', content: input }]);
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: 'I am processing your request. Since I am in demo mode, I can provide general guidance on dairy management.' }]);
        }, 1000);
        setInput('');
    };

    return (
        <Card className="w-full max-w-md mx-auto h-[500px] flex flex-col">
            <CardHeader className="bg-blue-600 text-white rounded-t-xl py-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5" />
                    DigiDhoodh AI
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg flex items-start gap-2 ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}>
                            {msg.role === 'assistant' && <Sparkles className="h-4 w-4 mt-1 shrink-0" />}
                            <p className="text-sm">{msg.content}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
            <div className="p-4 border-t flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
}
