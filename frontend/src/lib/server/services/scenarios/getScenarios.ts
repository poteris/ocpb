import { getAllScenarios as getScenariosFromDb, getScenarioById as getScenarioByIdFromDb } from "@/lib/db";
import { DatabaseError, isError } from "@/utils/errors";
import { z } from "zod";
import { TrainingScenarioSchema, TrainingScenario } from "@/types/scenarios";

export async function getScenarios(): Promise<TrainingScenario[]> {
try {
  const result = await getScenariosFromDb();

  const validationResult = z.array(TrainingScenarioSchema).safeParse(result);
  if (!validationResult.success) {
    throw new DatabaseError("Error validating scenarios data", "getScenarios", validationResult.error);
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
    throw new DatabaseError("Error validating scenarios data", "getScenarios", validatedScenarios.error);
  }

  return validationResult.data;
} catch (error: unknown) {
  throw new DatabaseError("Error fetching scenarios", "getScenarios", isError(error) ? error as Error : "Unexpected error");
}
}

export async function getScenarioById(scenarioId: string): Promise<TrainingScenario> {
  try {
    const scenario = await getScenarioByIdFromDb(scenarioId);
    const validatedResult = TrainingScenarioSchema.safeParse(scenario);
    if (!validatedResult.success) {
      throw new DatabaseError("Error validating scenario data", "getScenarioById", validatedResult.error);
    }

    return validatedResult.data;
  } catch (error: unknown) {
    throw new DatabaseError("Error fetching scenario", "getScenarioById", isError(error) ? error as Error : "Unexpected error");
  }
}
