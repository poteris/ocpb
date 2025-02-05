import { TrainingScenario } from "@/types/scenarios";
import { getAllScenarios as getScenariosFromDb } from "@/lib/db";
import {Result, ok, err} from "@/types/result";

export async function getScenarios(): Promise<Result<TrainingScenario[], string>> {
  const result = await getScenariosFromDb();

  if (!result.isOk) {
    console.error("Error fetching scenarios:", result.error);
    return err(result.error);
  }

  const scenarios = result.value.map((data) => ({
    id: data.id,
    title: data.title,
    description: data.description,
    context: data.context,
    objectives: (data.objectives ?? []).map((obj) => obj),
  }));

  return ok(scenarios);
}


