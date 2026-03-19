'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Check, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Hinglish Number Parser - Converts spoken Hindi/English to numbers
const HINGLISH_NUMBERS: Record<string, number> = {
    // English
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
    'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
    'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
    'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
    'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,

    // Hindi (transliterated)
    'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5, 'panch': 5,
    'chhah': 6, 'chhe': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
    'gyarah': 11, 'barah': 12, 'terah': 13, 'chaudah': 14, 'pandrah': 15,
    'solah': 16, 'satrah': 17, 'athrah': 18, 'unees': 19, 'bees': 20,
    'tees': 30, 'chaalis': 40, 'pachaas': 50, 'saath': 60, 'sattar': 70,
    'assi': 80, 'nabbe': 90, 'sau': 100,

    // Common variations
    'aadha': 0.5, 'dedh': 1.5, 'dhai': 2.5, 'saade': 0.5, // "saade char" = 4.5
    'point': -1, // Marker for decimal
};

// Keywords for context detection
const KEYWORDS = {
    liters: ['liter', 'litre', 'lit', 'l', 'लीटर', 'लिटर'],
    fat: ['fat', 'फैट', 'phat', 'faat'],
    snf: ['snf', 'एसएनएफ', 'solid'],
    morning: ['morning', 'subah', 'सुबह', 'savera'],
    evening: ['evening', 'shaam', 'शाम', 'raat'],
};

interface ParsedVoiceData {
    liters?: number;
    fat?: number;
    snf?: number;
    shift?: 'Morning' | 'Evening';
    rawText: string;
    confidence: number;
}

// Parse Hinglish voice input to structured data
function parseVoiceInput(text: string): ParsedVoiceData {
    const lowerText = text.toLowerCase().trim();
    const result: ParsedVoiceData = {
        rawText: text,
        confidence: 0
    };

    // Detect shift
    if (KEYWORDS.morning.some(k => lowerText.includes(k))) {
        result.shift = 'Morning';
    } else if (KEYWORDS.evening.some(k => lowerText.includes(k))) {
        result.shift = 'Evening';
    }

    // Extract numbers with context
    // Pattern: "5 liter fat 4.5" or "paanch liter char point paanch fat"
    const words = lowerText.split(/[\s,]+/);
    let currentNumber: number | null = null;
    let decimalPending = false;
    let lastContext: 'liters' | 'fat' | 'snf' | null = null;

    for (let i = 0; i < words.length; i++) {
        const word = words[i];

        // Check if it's a number word
        if (HINGLISH_NUMBERS[word] !== undefined) {
            const num = HINGLISH_NUMBERS[word];

            if (num === -1) {
                // "point" - next number is decimal
                decimalPending = true;
            } else if (decimalPending && currentNumber !== null) {
                // Add as decimal
                currentNumber = currentNumber + (num < 1 ? num : num / 10);
                decimalPending = false;
            } else if (word === 'saade' && currentNumber !== null) {
                // "saade char" = 4.5
                currentNumber += 0.5;
            } else {
                currentNumber = num;
            }
        }

        // Check if it's a numeric digit
        const numMatch = word.match(/^(\d+\.?\d*)$/);
        if (numMatch) {
            currentNumber = parseFloat(numMatch[1]);
        }

        // Check for context keywords
        if (KEYWORDS.liters.some(k => word.includes(k))) {
            if (currentNumber !== null) {
                result.liters = currentNumber;
                result.confidence += 0.3;
            }
            lastContext = 'liters';
            currentNumber = null;
        } else if (KEYWORDS.fat.some(k => word.includes(k))) {
            if (currentNumber !== null) {
                result.fat = currentNumber;
                result.confidence += 0.3;
            } else {
                lastContext = 'fat';
            }
            currentNumber = null;
        } else if (KEYWORDS.snf.some(k => word.includes(k))) {
            if (currentNumber !== null) {
                result.snf = currentNumber;
                result.confidence += 0.2;
            } else {
                lastContext = 'snf';
            }
            currentNumber = null;
        }
    }

    // If we have a trailing number, assign it to last context
    if (currentNumber !== null && lastContext) {
        if (lastContext === 'liters' && !result.liters) result.liters = currentNumber;
        if (lastContext === 'fat' && !result.fat) result.fat = currentNumber;
        if (lastContext === 'snf' && !result.snf) result.snf = currentNumber;
    }

    // Fallback: First number is liters, second is FAT
    if (!result.liters && !result.fat) {
        const numbers = text.match(/\d+\.?\d*/g);
        if (numbers && numbers.length >= 1) {
            result.liters = parseFloat(numbers[0]);
            result.confidence += 0.2;
        }
        if (numbers && numbers.length >= 2) {
            result.fat = parseFloat(numbers[1]);
            result.confidence += 0.2;
        }
    }

    result.confidence = Math.min(result.confidence, 1);
    return result;
}

interface VoiceInputProps {
    onResult: (data: ParsedVoiceData) => void;
    onCancel?: () => void;
    language?: 'hi-IN' | 'en-IN' | 'gu-IN';
    className?: string;
    placeholder?: string;
}

export function VoiceInput({
    onResult,
    onCancel,
    language = 'hi-IN',
    className,
    placeholder = "बोलिए: '5 लीटर, फैट 4.5'"
}: VoiceInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Check for browser support
    const isSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    // Play confirmation beep
    const playBeep = useCallback((type: 'start' | 'success' | 'error') => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        if (type === 'start') {
            oscillator.frequency.value = 880; // A5
            gainNode.gain.value = 0.1;
        } else if (type === 'success') {
            oscillator.frequency.value = 1320; // E6 (higher = success)
            gainNode.gain.value = 0.1;
        } else {
            oscillator.frequency.value = 220; // A3 (lower = error)
            gainNode.gain.value = 0.15;
        }

        oscillator.start();
        setTimeout(() => {
            oscillator.stop();
        }, type === 'success' ? 200 : 100);
    }, []);

    // Initialize speech recognition
    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('Voice input not supported on this browser');
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = language;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            setTranscript('');
            playBeep('start');
        };

        recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const result = event.results[current];
            const text = result[0].transcript;
            setTranscript(text);

            // If final result
            if (result.isFinal) {
                setIsProcessing(true);
                const parsed = parseVoiceInput(text);

                setTimeout(() => {
                    playBeep('success');
                    onResult(parsed);
                    setIsProcessing(false);
                    setIsListening(false);
                }, 300);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            playBeep('error');
            if (event.error === 'no-speech') {
                setError('कोई आवाज़ नहीं सुनाई दी');
            } else if (event.error === 'not-allowed') {
                setError('माइक्रोफ़ोन की अनुमति दें');
            } else {
                setError('कुछ गड़बड़ हुई, फिर से बोलें');
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isSupported, language, onResult, playBeep]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        if (onCancel) onCancel();
    }, [onCancel]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    if (!isSupported) {
        return (
            <div className={cn("p-4 bg-red-50 rounded-2xl text-red-600 text-sm text-center", className)}>
                <MicOff className="w-6 h-6 mx-auto mb-2" />
                Voice input not supported. Use Chrome or Edge browser.
            </div>
        );
    }

    return (
        <div className={cn("relative", className)}>
            <AnimatePresence mode="wait">
                {!isListening && !isProcessing ? (
                    // Start Button
                    <motion.div
                        key="start"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center"
                    >
                        <Button
                            onClick={startListening}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-xl"
                        >
                            <Mic className="w-8 h-8 text-white" />
                        </Button>
                        <p className="mt-3 text-sm text-neutral-500">{placeholder}</p>
                        {error && (
                            <p className="mt-2 text-sm text-red-500">{error}</p>
                        )}
                    </motion.div>
                ) : (
                    // Listening State
                    <motion.div
                        key="listening"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center"
                    >
                        {/* Animated Voice Waveform */}
                        <div className="relative w-24 h-24 mx-auto mb-4">
                            {/* Pulsing rings */}
                            <motion.div
                                className="absolute inset-0 rounded-full bg-red-500/20"
                                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <motion.div
                                className="absolute inset-2 rounded-full bg-red-500/30"
                                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            />

                            {/* Main button */}
                            <button
                                onClick={stopListening}
                                className="absolute inset-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl"
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                ) : (
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                    >
                                        <Mic className="w-8 h-8 text-white" />
                                    </motion.div>
                                )}
                            </button>
                        </div>

                        {/* Live transcript */}
                        <div className="min-h-[60px] px-4">
                            {transcript ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 bg-white rounded-xl shadow-sm border border-neutral-100"
                                >
                                    <p className="text-lg font-medium text-neutral-800">
                                        "{transcript}"
                                    </p>
                                </motion.div>
                            ) : (
                                <p className="text-neutral-400 animate-pulse">सुन रहा हूँ...</p>
                            )}
                        </div>

                        {/* Cancel button */}
                        <Button
                            variant="ghost"
                            onClick={stopListening}
                            className="mt-4 text-neutral-500"
                        >
                            <X className="w-4 h-4 mr-2" />
                            रद्द करें
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Compact inline voice button for form fields
interface VoiceFieldButtonProps {
    onResult: (value: string) => void;
    language?: 'hi-IN' | 'en-IN' | 'gu-IN';
    className?: string;
}

export function VoiceFieldButton({
    onResult,
    language = 'hi-IN',
    className
}: VoiceFieldButtonProps) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    const isSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        if (!isSupported) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = language;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript;
            // Extract first number from speech
            const numbers = text.match(/\d+\.?\d*/);
            if (numbers) {
                onResult(numbers[0]);
            } else {
                // Try Hinglish parsing
                const parsed = parseVoiceInput(text);
                if (parsed.liters) onResult(parsed.liters.toString());
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [isListening, isSupported, language, onResult]);

    if (!isSupported) return null;

    return (
        <button
            type="button"
            onClick={toggleListening}
            className={cn(
                "p-2 rounded-lg transition-colors",
                isListening
                    ? "bg-red-100 text-red-600 animate-pulse"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200",
                className
            )}
        >
            <Mic className="w-5 h-5" />
        </button>
    );
}

export { parseVoiceInput };
export type { ParsedVoiceData };
