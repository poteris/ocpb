import { TrainingScenario } from "@/types/scenarios";
import { getAllScenarios as getScenariosFromDb } from "@/lib/db";
import {Result} from "@/types/result";


export async function getScenarios(): Promise<Result<TrainingScenario[]>> {
  const result = await getScenariosFromDb();

  if (!result.success ) {
    console.error("Error fetching scenarios:", result.error);
    return { success: false, error: result.error };
  }

  const scenarios = result.data?.map((data) => ({
    id: data.id,
    title: data.title,
    description: data.description,
    context: data.context,
    objectives: (data.objectives ?? []).map((obj) => obj),
  }));

  return { success: true, data: scenarios };
}


