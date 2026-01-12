import 'server-only'
import { OpenAI } from "openai";
import { AIClientInterface } from './AIClientInterface';
import { ChatCompletionResponse, ChatCompletionRequest } from './ChatCompletionTypes';

export class OpenAIClient implements AIClientInterface {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY, 
        });
    }

    async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
        const formattedMessages = request.messages.map((msg) => ({
            role: msg.role as "user" | "system" | "assistant",
            content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
        }));

        // Create requestParams by copying all defined properties from request
        const requestParams = {
            messages: formattedMessages,
            model: request.model,
            ...Object.fromEntries(
                Object.entries(request).filter(([, value]) => value !== undefined)
            ),
        };

        try {
            const response = await this.openai.chat.completions.create(requestParams);
            return response as ChatCompletionResponse; 
        } catch (error) {
            console.error("Error creating chat completion:", error);
            throw error;
        }
    }
} 