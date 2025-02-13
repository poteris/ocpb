import OpenAI from "openai";
/**
 * This module exports an array of OpenAI itools such as functions
 *
 * To add more functions to OpenAI, follow these steps:
 *
 * Define a new function object with the following structure:
 *    - `name`: The name of the function.
 *    - `description`: A brief description of what the function does.
 *    - `parameters`: An object defining the parameters required by the function.
 *      - `type`: The type of the parameters object (usually "object").
 *      - `properties`: An object where each key is a parameter name and the value is an object defining the parameter's type and description.
 *      - `required`: An array of strings listing the names of required parameters.
 *      - `additionalProperties`: A boolean indicating whether additional properties are allowed.
 *    - `strict`: A boolean indicating whether the function should be strictly validated.
 */
export const tools: OpenAI.ChatCompletionTool[]= [
  {
    type: "function",
    function: {
      name: "generate_feedback",
      description: "Generate structured feedback for a conversation.",
      parameters: {
        type: "object",
        properties: {
          score: {
            type: "number",
            description: "Score between 1 and 5",
          },
          summary: {
            type: "string",
            description: "Brief summary of overall performance",
          },
          strengths: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
              },
              required: ["title", "description"],
              additionalProperties: false, // explicitly disallow extra fields
            },
            description: "List of strengths identified in the conversation",
          },
          areas_for_improvement: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
              },
              required: ["title", "description"],
              additionalProperties: false, 
            },
            description: "List of areas for improvement identified in the conversation",
          },
        },
        required: ["score", "summary", "strengths", "areas_for_improvement"],
        additionalProperties: false, 
      },
      strict: true,
    }
  },
  {
    type: "function",
    function: {
      name: "generate_persona",
      description:
        "Generate a coherent persona for a workplace conversation with a trade union representative.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Full name of the person." },
          segment: {
            type: "string",
            description:
              "Segment of the person (Former Union Member, Non-member, etc.).",
          },
          age: { type: "number", description: "Age of the person (15-62)." },
          gender: {
            type: "string",
            description: "Gender of the person (Male or Female).",
          },
          family_status: {
            type: "string",
            description: "Family status of the person.",
          },
          uk_party_affiliation: {
            type: "string",
            description: "Political affiliation of the person.",
          },
          workplace: { type: "string", description: "Place of work." },
          job: { type: "string", description: "Specific job title and role." },
          busyness_level: {
            type: "string",
            enum: ["low", "medium", "high"], // strict values
            description: "Busyness level (low, medium, high).",
          },
          major_issues_in_workplace: {
            type: "string",
            description: "Key workplace concerns.",
          },
          personality_traits: {
            type: "string", 
            description: "Personality characteristics.",
            additionalProperties: false, 
          },
          emotional_conditions: {
            type: "string",
            description: "Emotional factors influencing union support",
            additionalProperties: false,
          },
        },
        required: [
          "name",
          "segment",
          "age",
          "gender",
          "family_status",
          "uk_party_affiliation",
          "workplace",
          "job",
          "busyness_level",
          "major_issues_in_workplace",
          "personality_traits",
          "emotional_conditions",
        ],
        additionalProperties: false, 
      },
      strict: true, 
    },
  }
  
];
