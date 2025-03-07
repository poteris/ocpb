import { OpenAIClientInterface } from './OpenAIClientInterface';
import { v4 as uuidv4 } from 'uuid';

export class MockOpenAIClient implements OpenAIClientInterface {

  async createChatCompletion(request: any): Promise<any> {
    if (request.tool_choice?.function?.name === "generate_persona") {
      // Mock response for generate_persona
      return { 
        choices: [{
          message: {
            tool_calls: [{
              function: {
                name: "generate_persona",
                arguments: JSON.stringify({
                  id: uuidv4(),
                  name: "John Doe",
                  segment: "Young Slacker",
                  age: 30,
                  gender: "Male",
                  family_status: "Single",
                  uk_party_affiliation: "Official Monster Raving Loony Party",
                  workplace: "an office in the department of work and pensions",
                  job: "Policy Advisor",
                  busyness_level: "medium",
                  major_issues_in_workplace: "Staff turnover",
                  personality_traits: "helpful, curious",
                  emotional_conditions: "worried about not much",
                }),
              },
            }],
          },
        }],
      };
    } else if (request.tool_choice?.function?.name === "generate_feedback") {
      // Mock response for generate_feedback
      return {
        choices: [{
          message: {
            tool_calls: [{
              function: {
                name: "generate_feedback",
                arguments: JSON.stringify({
                  score: 5,
                  summary: "Great performance!",
                  strengths: [
                    { title: "Good listener", description: "You listened well." },
                  ],
                  areas_for_improvement: [
                    { title: "Empathy", description: "Show more empathy." },
                  ],
                }),
              },
            }],
          },
        }],
      };
    } else {
      // Default mock response for other function calls
      return {
        choices: [{
          message: {
            content: "This is a default mock response.",
          },
        }],
      };
    }
  }
} 