import 'server-only'
import { AIClientInterface } from './AIClientInterface';
import { MockOpenAIClient } from './MockOpenAIClient';
import { OpenAIClient } from './OpenAIClient'; 

export function getOpenAIClient(headers: Headers = new Headers()): AIClientInterface {
    const useMocks = process.env.USE_MOCK_OPENAI === 'true';

    if (headers.get('x-use-real-openai')) {
        return new OpenAIClient();
    }

    return useMocks ? new MockOpenAIClient() : new OpenAIClient();
} 