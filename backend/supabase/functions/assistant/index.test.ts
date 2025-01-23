import { jest, test, expect } from '@jest/globals';
import OpenAI from 'openai';

// Mocking 'OpenAI' module
jest.mock('openai', () => {
  return {
    __esModule: true,     // Avoids "*.default is not a constructor error":
    default: jest.fn().mockImplementation(() => ({
      // Mock the 'chat.completions.create' method
      chat: {
        completions: {
          create: jest.fn<
            (params: { 
              model: string;
              messages: Array<{ role: string; content: string }>;
              functions?: Array<Record<string, any>>;
            }) => Promise<any>
          >().mockImplementation(({ messages }) => {
            const userMessage = messages.find(msg => msg.role === 'user')?.content || '';
            return Promise.resolve({
              choices: [{
                message: {
                  content: `You said: ${userMessage}`,
                  function_call: {}
                }
              }]
            });
          }),
        },
      },
    })),
  };
});

test('should return echoed AI response', async () => {
  const openai = new OpenAI({ apiKey: 'fake-api-key' });
  const userMessage = 'Hello, this is a test message';
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: userMessage }],
    max_tokens: 100,
  });

  expect(response.choices[0].message.content).toBe(`You said: ${userMessage}`);
});

// TODO: Global implementation for the mock
// TODO: Add function_call to message object completion.choices[0].message.function_call

