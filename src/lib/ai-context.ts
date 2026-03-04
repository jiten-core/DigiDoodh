// AI Context - DISABLED
// DigiDhoodh does not use AI/LLM features per FINAL_DECISIONS.md

export interface AIChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    metadata?: Record<string, any>;
}

/**
 * AI Context is disabled in DigiDhoodh
 * These are stub functions to prevent import errors
 */
export const getAIContext = () => {
    console.warn('AI Context is disabled in DigiDhoodh');
    return null;
};

export const createAISession = async (_systemPrompt: string) => {
    console.warn('AI Session is disabled in DigiDhoodh');
    return { id: 'disabled' };
};

export const appendToAISession = async (_contextId: string, _message: AIChatMessage) => {
    console.warn('AI Session is disabled in DigiDhoodh');
    return [];
};

export const getAISessionHistory = async (_contextId: string, _version?: number) => {
    console.warn('AI Session is disabled in DigiDhoodh');
    return { messages: [], versions: [] };
};
