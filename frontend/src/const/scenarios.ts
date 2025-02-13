import { TrainingScenario } from "@/types/scenarios";
  

const recruitmentContext: TrainingScenario = {
    context: "The context should be self-explanatory, comrade.",
    description: "Get better at recruiting people for trade union membership in the workplace",
    id: "member-recruitment",
    objectives: [
      ">Practice Active Listening\n\n- Focus on asking open-ended questions rather than jumping to pre-prepared talking points",
      ">Find Personal Connection Points\n\n- Look for opportunities to relate membership in terms of their expressed needs and interests",
      ">Guide Don’t Push\n\n- Let the conversation flow naturally and encourage them to take action rather than pressuring them to join"
    ],
    title: "Joining the Union"
  };
  const workplaceSafetyTraining: TrainingScenario = {
    context: "The context is focused on ensuring a safe and secure working environment.",
    description: "Encourage team members to actively contribute to workplace safety and report hazards.",
    id: "workplace-safety",
    objectives: [
      ">Identify Common Workplace Hazards\n\n- Train employees to spot and report hazards like spills, loose wires, or unsafe equipment.",
      ">Promote Open Communication\n\n- Create a culture where employees feel comfortable reporting safety concerns without fear of reprisal.",
      ">Reinforce Safety Protocols\n\n- Regularly review safety measures like emergency exits, fire drills, and protective gear usage."
    ],
    title: "Workplace Safety Awareness"
  };
  const teamCollaborationTraining: TrainingScenario = {
    context: "The context is about fostering teamwork and improving interpersonal communication within teams.",
    description: "Help employees collaborate effectively to achieve shared goals and resolve conflicts amicably.",
    id: "team-collaboration",
    objectives: [
      ">Encourage Clear Communication\n\n- Focus on sharing thoughts concisely and actively listening to others’ perspectives.",
      ">Build Trust and Respect\n\n- Foster an environment where everyone feels valued and respected.",
      ">Define Roles and Responsibilities\n\n- Clarify individual roles to prevent overlap and improve team efficiency."
    ],
    title: "Building Effective Teams"
  };
  const customerServiceTraining: TrainingScenario = {
    context: "The context focuses on enhancing customer satisfaction through improved service delivery.",
    description: "Train employees to provide outstanding customer service and handle complaints effectively.",
    id: "customer-service",
    objectives: [
      ">Develop Empathy\n\n- Understand and acknowledge customer emotions to build positive rapport.",
      ">Master Problem-Solving Skills\n\n- Equip employees with tools to resolve customer issues quickly and efficiently.",
      ">Provide Consistent Follow-Up\n\n- Ensure customers feel valued by following up on unresolved concerns."
    ],
    title: "Exceeding Customer Expectations"
  };

  const conflictResolutionTraining: TrainingScenario = {
    context: "The context emphasizes resolving disputes constructively within teams or between individuals.",
    description: "Equip team members with strategies to handle conflicts respectfully and effectively.",
    id: "conflict-resolution",
    objectives: [
      ">Understand the Root Cause\n\n- Teach techniques to identify the underlying reasons for conflicts.",
      ">Promote Active Listening\n\n- Train participants to listen without interrupting or making assumptions.",
      ">Focus on Win-Win Solutions\n\n- Encourage collaborative problem-solving that benefits all parties."
    ],
    title: "Resolving Workplace Conflicts"
  };
  const timeManagementTraining: TrainingScenario = {
    context: "The context is aimed at improving personal productivity and effective time use.",
    description: "Help participants prioritize tasks and manage their time efficiently to meet deadlines.",
    id: "time-management",
    objectives: [
      ">Set Clear Priorities\n\n- Teach methods for distinguishing between urgent and important tasks.",
      ">Eliminate Distractions\n\n- Provide tools to minimize interruptions and maintain focus.",
      ">Use Planning Tools Effectively\n\n- Introduce calendars, to-do lists, and time-blocking techniques."
    ],
    title: "Mastering Time Management"
  };
    
  
  export const trainingScenarios: TrainingScenario[] = [
    recruitmentContext,
    workplaceSafetyTraining,
    teamCollaborationTraining,
    customerServiceTraining,
    conflictResolutionTraining,
    timeManagementTraining
  ]
