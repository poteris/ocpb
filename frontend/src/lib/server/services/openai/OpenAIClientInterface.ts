export interface OpenAIClientInterface {
  createChatCompletion(request: any): Promise<any>;
} 