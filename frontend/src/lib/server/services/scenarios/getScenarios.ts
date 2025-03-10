import { getAllScenarios as getScenariosFromDb, getScenarioById as getScenarioByIdFromDb } from "@/lib/server/db";
import { isError } from "@/utils/errors";
import { z } from "zod";
import { TrainingScenarioSchema, TrainingScenario } from "@/types/scenarios";

export async function getScenarios(): Promise<TrainingScenario[]> {
try {
  const result = await getScenariosFromDb();

  const validationResult = z.array(TrainingScenarioSchema).safeParse(result);
  if (!validationResult.success) {
    throw new Error("Error validating scenarios data", { cause: validationResult.error });
  }

  const scenarios = validationResult.data.map((data) => ({
    id: data.id,
    title: data.title,
    description: data.description,
    context: data.context,
    objectives: (data.objectives ?? []).map((obj) => obj),
  }));

  const validatedScenarios= z.array(TrainingScenarioSchema).safeParse(scenarios);
  if (!validationResult.success) {
    throw new Error("Error validating scenarios data", { cause: validatedScenarios.error });
  }

  return validationResult.data;
} catch (error: unknown) {
  throw new Error("Error fetching scenarios", { cause: isError(error) ? error as Error : "Unexpected error" });
}
}

export async function getScenarioById(scenarioId: string): Promise<TrainingScenario> {
  try {
    const scenario = await getScenarioByIdFromDb(scenarioId);
    const validatedResult = TrainingScenarioSchema.safeParse(scenario);
    if (!validatedResult.success) {
      throw new Error("Error validating scenario data", { cause: validatedResult.error });
    }

    return validatedResult.data;
  } catch (error: unknown) {
    throw new Error("Error fetching scenario", { cause: isError(error) ? error as Error : "Unexpected error" });
  }
}
