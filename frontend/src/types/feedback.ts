import {z} from 'zod';
export interface FeedbackData {
  score: number;
  strengths: { title: string; description: string; }[];
  areas_for_improvement: { title: string; description: string; }[];
  summary: string;
}

export const feedbackDataSchema = z.object({
  score: z.number(),
  strengths: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
  areas_for_improvement: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
  summary: z.string(),
});