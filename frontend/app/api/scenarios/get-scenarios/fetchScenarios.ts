import { supabase } from '@/lib/supabaseClient';
import  { TrainingScenario } from '@/types/scenarios'
 async function getScenarios(): Promise<TrainingScenario[]> {
    const { data, error } = await supabase
      .from('scenarios')
      .select(`
        id,
        title,
        description,
        context,
        scenario_objectives (objective)
      `);
  
  if (error) {
      console.error('Error fetching scenarios:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
      });
      return [];
  }
  
  
    // Combine scenarios with their objectives
    return data.map(data => ({
     id: data.id,
      title: data.title,
      description: data.description,
      context: data.context,
      objectives: (data.scenario_objectives ?? []).map(obj => obj.objective),
    }));
  }

  export { getScenarios };