import OpenAI from 'openai'; 
import { Persona } from '@/types/persona';

import { generateNewPersona } from '../../app/api/persona/generate-new-persona/generateNewPersona'; 

// https://community.openai.com/t/testing-application-around-api-calls-with-jest-in-typescript/567809/20
jest.mock('openai', () => {
  const mockCreate = jest.fn().mockResolvedValue({
    choices: [
      {
        message: {
          function_call: {
            name: 'generate_persona',
            arguments: JSON.stringify({
              name: 'John Doe',
              segment: 'Young Slacker',
              age: 30,
              gender: 'Male',
              family_status: 'Single',
              uk_party_affiliation: 'Official Monster Raving Loony Party',
              workplace: 'an office in the department of work and pensions',
              job: 'Policy Advisor',
              busyness_level: 'medium',
              major_issues_in_workplace: 'Staff turnover',
              personality_traits: 'helpful, curious',
              emotional_conditions: 'worried about not much',
            }),
          },
        },
      },
    ],
  });

  const OpenAI = jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));

  return {
    __esModule: true,
    default: OpenAI,
  };
});



describe('generatePersona', () => {
  beforeEach(() => {
    jest.clearAllMocks(); 
  });


  it('should call OpenAI and return the correct response', async () => {
    await generateNewPersona();
    const openaiMock = new OpenAI();
    // const persona: Persona =  await generateNewPersona (); 
    expect(openaiMock.chat.completions.create).toHaveBeenCalledWith({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: expect.any(String) }],
      functions: expect.arrayContaining([
        expect.objectContaining({
          name: 'generate_persona',
          description:
            'Generate a coherent persona for a workplace conversation with a trade union representative',
          parameters: expect.objectContaining({
            type: 'object',
            required: expect.arrayContaining([
              'name',
              'segment',
              'age',
              'gender',
              'family_status',
              'uk_party_affiliation',
              'workplace',
              'job',
              'major_issues_in_workplace',
              'personality_traits',
              'emotional_conditions',
            ]),
          }),
        }),
      ]),
      function_call: { name: 'generate_persona' },
    });
 
  });
  it('should return a valid persona', async () => {
    const persona: Persona = await generateNewPersona();

    expect(persona).toEqual({
      name: 'John Doe',
      segment: 'Young Slacker',
      age: 30,
      gender: 'Male',
      family_status: 'Single',
      uk_party_affiliation: 'Official Monster Raving Loony Party',
      workplace: 'an office in the department of work and pensions',
      job: 'Policy Advisor',
      busyness_level: 'medium',
      major_issues_in_workplace: 'Staff turnover',
      personality_traits: 'helpful, curious',
      emotional_conditions: 'worried about not much',
    });
  });
  it('should throw an error if there is no function_call', async () => {
    
    const openaiMock = new OpenAI();
    (openaiMock.chat.completions.create as jest.Mock).mockResolvedValueOnce({
      choices: [
        {
          message: {
            function_call: null, //  missing function_call
          },
        },
      ],
    });
  
    await expect(generateNewPersona()).rejects.toThrow(
      'No function call or arguments received from OpenAI'
    );
  
    // verify that the mocked method was called
    expect(openaiMock.chat.completions.create).toHaveBeenCalledTimes(1);
  });
  
  it('should throw an error if there are no arguments', async () => {
   
    const openaiMock = new OpenAI();
    (openaiMock.chat.completions.create as jest.Mock).mockResolvedValueOnce({
      choices: [
        {
          message: {
            function_call: {
              name: 'generate_persona',
              arguments: null, //  missing arguments
            },
          },
        },
      ],
    });
  
    await expect(generateNewPersona()).rejects.toThrow(
      'No function call or arguments received from OpenAI'
    );
  
    expect(openaiMock.chat.completions.create).toHaveBeenCalledTimes(1);
  });
  

});
