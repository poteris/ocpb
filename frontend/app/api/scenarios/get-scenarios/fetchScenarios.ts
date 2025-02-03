import { TrainingScenario } from "@/types/scenarios";
import { getAllScenarios as getScenariosFromDb } from "@/lib/db";
async function getScenarios(): Promise<TrainingScenario[]> {
  const scenarios = await getScenariosFromDb();

  if (!scenarios) {
    return [];
  }

  // Combine scenarios with their objectives
  return scenarios.map((data) => ({
    id: data.id,
    title: data.title,
    description: data.description,
    context: data.context,
    objectives: (data.scenario_objectives ?? []).map((obj) => obj.objective),
  }));
}

export { getScenarios };
