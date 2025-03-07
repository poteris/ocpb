import { OpenAIClientInterface } from './OpenAIClientInterface';
import { MockOpenAIClient } from './MockOpenAIClient';
import { RealOpenAIClient } from './RealOpenAIClient'; // Assume this is the real client

export function getOpenAIClient(headers: any = {}): OpenAIClientInterface {
    const useMock = process.env.USE_MOCK_OPENAI === 'true';
    const overrideHeader = headers['x-use-real-openai'];

    if (overrideHeader) {
        return new RealOpenAIClient();
    }

    return useMock ? new MockOpenAIClient() : new RealOpenAIClient();
} 