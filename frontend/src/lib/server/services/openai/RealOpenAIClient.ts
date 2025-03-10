import { OpenAI } from "openai";
import { OpenAIClientInterface } from './OpenAIClientInterface';

export class RealOpenAIClient implements OpenAIClientInterface {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY, // Ensure this environment variable is set
        });
    }

    async createChatCompletion(request: any): Promise<any> {
        try {
            const response = await this.openai.chat.completions.create(request);
            return response;
        } catch (error) {
            console.error("Error creating chat completion:", error);
            throw error;
        }
    }
} 

