// TODO: update
export interface PromptData {
  id: number;
  content: string;
  scenario_id?: string;
  persona_id?: string;
  created_at: string;
}

export interface PromptWithDetails extends PromptData {
  scenario?: {
    title: string;
    description: string;
    context: string;
  };
}
