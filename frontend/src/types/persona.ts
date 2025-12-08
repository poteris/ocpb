
import {z} from 'zod';
export interface Persona {
    id: string;
    name: string;
    segment: string;
    age: number;
    gender: string;
    family_status: string;
    uk_party_affiliation: string;
    workplace: string;
    job: string;
    busyness_level: string;
    major_issues_in_workplace: string;
    personality_traits: string;
    emotional_conditions: string;
    organisation_id?: string;
    // Voice fields
    voice_id?: string;
    voice_name?: string;
    voice_accent?: string;
  }

export const personaSchema = z.object({
    id: z.string(),
    name: z.string(),
    segment: z.string(),
    age: z.number(),
    gender: z.string(),
    family_status: z.string(),
    uk_party_affiliation: z.string(),
    workplace: z.string(),
    job: z.string(),
    busyness_level: z.string(),
    major_issues_in_workplace: z.string(),
    personality_traits: z.string(),
    emotional_conditions: z.string(),
    organisation_id: z.string().nullish(), // Can be null, undefined, or string
    // Voice fields - nullable because DB returns null when not set
    voice_id: z.string().nullish(),
    voice_name: z.string().nullish(),
    voice_accent: z.string().nullish(),
});