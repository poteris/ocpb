import { TrainingScenario } from "@/types/scenarios";
import { Persona } from "@/types/persona";
import { FeedbackData } from "@/types/feedback";

export const mockTrainingScenario: TrainingScenario = {
  id: "conflict-resolution-training",
  title: "Workplace Conflict Resolution Workshop",
  context:
    "You are a department manager at a large technology company facing increasing interpersonal conflicts between team members. Recent organizational changes and high-pressure deadlines have created tension, affecting team productivity and morale.",
  description:
    "Your task is to facilitate a conflict resolution workshop aimed at improving team dynamics and establishing better communication protocols. You need to address both immediate conflicts and implement long-term strategies for maintaining a healthy work environment.",
  objectives: [
    "Identify and analyze the root causes of team conflicts using specific examples while maintaining confidentiality.",
    "Demonstrate effective mediation techniques when addressing disagreements between team members.",
    "Implement clear communication guidelines and feedback mechanisms to prevent future conflicts.",
    "Create an action plan for regular team-building activities and stress management workshops.",
  ],
};

export const mockPersona: Persona = {
  id: "tech-manager-persona",
  name: "Sarah Chen",
  segment: "Management",
  age: 38,
  gender: "Female",
  family_status: "Married",
  uk_party_affiliation: "Independent",
  workplace: "Enterprise Software Company",
  job: "Senior Development Manager",
  busyness_level: "Very High",
  major_issues_in_workplace: "Team conflicts, deadline pressure, communication gaps",
  personality_traits: "Analytical, Direct, Solution-oriented",
  emotional_conditions: "Stressed but composed",
};

export const mockFeedback: FeedbackData = {
        score: 3,
        strengths: [
          {
            title: "Good listener",
            description:
              "You listened to the user's concerns and responded appropriately.",
          },
          {
            title: "Clear communication",
            description:
              "You communicated clearly and effectively, which helped the user understand your responses.",
          },
        ],

        areas_for_improvement: [
          {
            title: "Empathy",
            description:
              "You could show more empathy towards the user's situation to build rapport and trust.",
          },
          {
            title: "Active listening",
            description:
              "You could improve your active listening skills by summarizing the user's concerns before responding.",
          },
        ],
        summary:
          "Overall, you did a good job in this conversation. Keep up the good work and continue to improve your communication skills.",
      };
