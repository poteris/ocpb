import { OpenAIClientInterface } from './OpenAIClientInterface';
import { MockOpenAIClient } from './MockOpenAIClient';
import { RealOpenAIClient } from './RealOpenAIClient'; 

export function getOpenAIClient(headers: Headers = new Headers()): OpenAIClientInterface {
    const useMock = process.env.USE_MOCK_OPENAI === 'true';

    if (headers.get('x-use-real-openai')) {
        return new RealOpenAIClient();
    }

    return useMock ? new MockOpenAIClient() : new RealOpenAIClient();
} 