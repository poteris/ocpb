import { supabase } from "@/lib/init";

export async function deleteScenario(scenarioId: string) {
  try {
    // First delete the objectives for this scenario
    const { error: objectivesError } = await supabase
      .from("scenario_objectives")
      .delete()
      .eq("scenario_id", scenarioId);

    if (objectivesError) {
      console.error("Error deleting objectives:", objectivesError);
      throw objectivesError;
    }

    // Then delete the scenario
    const { error: scenarioError } = await supabase.from("scenarios").delete().eq("id", scenarioId);

    if (scenarioError) {
      console.error("Error deleting scenario:", scenarioError);
      throw scenarioError;
    }
  } catch (error) {
    console.error("Error in deleteScenario:", error);
    throw error;
  }
}
