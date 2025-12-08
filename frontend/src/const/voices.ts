/**
 * Curated list of British voices from ElevenLabs
 * Covering various UK accents for realistic persona representation
 */

export type VoiceGender = 'male' | 'female';

export interface BritishVoice {
  id: string;
  name: string;
  accent: string;
  description: string;
  gender: VoiceGender;
}

// Male voices
export const MALE_VOICES: BritishVoice[] = [
  {
    id: 'v9I7auPeR1xGKYRPwQGG',
    name: 'Tony',
    accent: 'Liverpool',
    description: 'Tony - Liverpool accent',
    gender: 'male'
  },
  {
    id: 'G17SuINrv2H9FC6nvetn',
    name: 'Christopher',
    accent: 'Southern English',
    description: 'Christopher - Southern English',
    gender: 'male'
  },
  {
    id: 's8AECd9nnogIc2M6gtnS',
    name: 'Jav',
    accent: 'British',
    description: 'Jav - British accent',
    gender: 'male'
  },
  {
    id: 'aMdQCEO9kwP77QH1DiFy',
    name: 'Archie',
    accent: 'Scottish',
    description: 'Archie - Scottish',
    gender: 'male'
  },
  {
    id: 'wUkGqD7qevNIshEdEC5s',
    name: 'Matthew',
    accent: 'Welsh',
    description: 'Matthew - Welsh',
    gender: 'male'
  },
  {
    id: 'eyuCA3LWMylRajljTeOo',
    name: 'Gerry',
    accent: 'British',
    description: 'Gerry - British accent',
    gender: 'male'
  }
];

// Female voices
export const FEMALE_VOICES: BritishVoice[] = [
  {
    id: 'wJqPPQ618aTW29mptyoc',
    name: 'Ana-Rita',
    accent: 'Southern English',
    description: 'Ana-Rita - Southern English',
    gender: 'female'
  },
  {
    id: 'jXL9qhD2NCIaHLhia8ex',
    name: 'Laura',
    accent: 'Northern Irish',
    description: 'Laura - Northern Irish',
    gender: 'female'
  },
  {
    id: 'sccYFB6TkWjH8RZUaqGK',
    name: 'Daria',
    accent: 'British',
    description: 'Daria - Young flexible female',
    gender: 'female'
  },
  {
    id: 'aTbnroHRGIomiKpqAQR8',
    name: 'Felicity',
    accent: 'British',
    description: 'Felicity - Young and well-spoken',
    gender: 'female'
  },
  {
    id: 'MzqUf1HbJ8UmQ0wUsx2p',
    name: 'Katie',
    accent: 'British',
    description: 'Katie - Call Center English Female',
    gender: 'female'
  }
];

// Combined list for backwards compatibility
export const BRITISH_VOICES: BritishVoice[] = [...MALE_VOICES, ...FEMALE_VOICES];

export const DEFAULT_MALE_VOICE_ID = 'v9I7auPeR1xGKYRPwQGG'; // Tony - Liverpool accent
export const DEFAULT_FEMALE_VOICE_ID = 'jXL9qhD2NCIaHLhia8ex'; // Laura - Northern Irish
export const DEFAULT_VOICE_ID = DEFAULT_MALE_VOICE_ID; // Backwards compatibility

/**
 * Get voice by ID
 */
export function getVoiceById(voiceId: string): BritishVoice | undefined {
  return BRITISH_VOICES.find(v => v.id === voiceId);
}

/**
 * Get a random voice matching the specified gender
 */
export function getRandomVoiceByGender(gender?: string): BritishVoice {
  const normalizedGender = gender?.toLowerCase();
  
  if (normalizedGender === 'female' || normalizedGender === 'f') {
    const randomIndex = Math.floor(Math.random() * FEMALE_VOICES.length);
    return FEMALE_VOICES[randomIndex];
  }
  
  // Default to male voice for 'male', 'm', or any other value
  const randomIndex = Math.floor(Math.random() * MALE_VOICES.length);
  return MALE_VOICES[randomIndex];
}

/**
 * Get default voice or fallback, respecting gender if provided
 */
export function getVoiceOrDefault(voiceId?: string, gender?: string): BritishVoice {
  // If a specific voice ID is provided and exists, use it
  if (voiceId) {
    const voice = getVoiceById(voiceId);
    if (voice) return voice;
  }
  
  // Otherwise, get a random voice matching the gender
  return getRandomVoiceByGender(gender);
}




