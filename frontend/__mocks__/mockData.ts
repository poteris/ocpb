import { TrainingScenario } from "@/types/scenarios";
import { Persona } from "@/types/persona";

export const mockTrainingScenario: TrainingScenario = {
  id: "loony-party-recruitment",
  title: "The Official Loony Party Recruitment Drive",
  context:
    "The Official Loony Party is embarking on its most ambitious (and utterly nonsensical) campaign to date: “A Chicken in Every Bathtub, and Free Cheese for All Wednesdays!” As Chief Party Recruiter, you are tasked with finding kindred spirits who embrace our philosophy that politics is far too important to be taken seriously.",
  description:
    "Your mission is to traverse the whimsical world of tea-drinking ferrets, invisible bicycles, and sentient garden gnomes to uncover delightfully eccentric individuals who will bring unique energy and a touch of the absurd to our campaign.",
  objectives: [
    "Identify potential party members with a knack for telling knock-knock jokes that make no sense but feel profound.",
    "Explain the party’s “platform,” which includes mandatory naps for pets, free pogo sticks for all citizens, and the establishment of a Ministry of Silly Walks.",
    "Address serious questions (e.g., fiscal policy) by diverting into poetic soliloquies about the moon’s feelings.",
    "Successfully recruit at least one new member by convincing them to declare allegiance while wearing a cheese hat or waving a rubber chicken.",
  ],
};

export const mockPersona: Persona = {
  id: "loony-persona-id",
  name: "Loony McLoonyface",
  segment: "Whimsical",
  age: 42,
  gender: "Unicorn",
  family_status: "Married to the Moon",
  uk_party_affiliation: "The Official Loony Party",
  workplace: "Candyland",
  job: "Chief Whimsy Officer",
  busyness_level: "Always on an Adventure",
  major_issues_in_workplace: "Too much fun",
  personality_traits: "Eccentric, Imaginative, Playful",
  emotional_conditions: "Perpetually Joyful",
};
