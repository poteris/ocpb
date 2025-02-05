import { z } from "zod";

export const TrainingScenarioSchema = z.object({
  id: z.string(),
  context: z.string(),
  description: z.string(),
  objectives: z.array(z.string()),
  title: z.string(),
});

interface Scenario {
  id: string;
  context: string;
  description: string;
  title: string;
}

interface CompleteTrainingScenario extends Scenario {
  objectives: string[];
}

export type TrainingScenario = CompleteTrainingScenario;
