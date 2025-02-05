import { z } from 'zod';

export type TrainingScenario = {
    context: string;
    description: string;
    id: string;
    objectives: string[];
    title: string;
  };
  export const TrainingScenarioSchema = z.object({
    context: z.string(),
    description: z.string(),
    id: z.string(),
    objectives: z.array(z.string()),
    title: z.string(),
  });

  export type TrainingScenarioType = z.infer<typeof TrainingScenarioSchema>;