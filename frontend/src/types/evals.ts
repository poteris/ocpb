export interface Organization {
  id: string;
  name: string;
}

export interface AssertionResult {
  id: string;
  assertion_name: string;
  passed: boolean;
  details: string;
  created_at: string;
}

export interface EvalConversation {
  id: string;
  conversation_id: string;
  user_id: string;
  scenario_id: string;
  persona_id: string;
  created_at: string;
  last_message_at: string;
  organization_id: string;
  organization_name: string;
  message_count: number;
  feedback_score: number | null;
  feedback_summary: string | null;
  feedback_strengths: Array<{ title: string; description: string }>;
  feedback_areas_for_improvement: Array<{ title: string; description: string }>;
  has_feedback: boolean;
  human_rating: string | null;
  human_notes: string | null;
  assertions: AssertionResult[];
  assertion_summary: {
    total: number;
    passed: number;
    failed: number;
  };
  scenario: {
    id: string;
    title: string;
    description: string;
    organisation_id: string;
    organisation?: {
      id: string;
      name: string;
    };
  };
  persona: {
    id: string;
    name: string;
    job: string;
    age: number;
    organisation_id: string;
  };
  messages: Array<{
    id: string;
    role: string;
    content: string;
    created_at: string;
  }>;
  feedback?: Array<{
    id: string;
    score: number;
    summary: string;
    strengths: Array<{ title: string; description: string }>;
    areas_for_improvement: Array<{ title: string; description: string }>;
    created_at: string;
  }>;
}

export interface KPIData {
  totalConversations: number;
  averageConversationLength: number;
}

export interface ScoreDistribution {
  score: number;
  count: number;
}

export interface TrendData {
  date: string;
  averageScore: number;
  conversationCount: number;
}
