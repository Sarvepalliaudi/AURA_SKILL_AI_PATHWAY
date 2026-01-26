import { GoogleGenAI, Type } from "@google/genai";
import { LearnerProfile, TrainingPathway } from '../types';
import { APIError } from "./errors";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A deep, personalized summary explaining why this specific pathway was chosen based on the user's unique talents. Address the learner by name."
    },
    recommendedRole: {
      type: Type.STRING,
      description: "The primary job role or professional athletic title target."
    },
    skillsFeedback: {
      type: Type.STRING,
      description: "Analysis of the user's existing talents (physical or mental) and how they translate to the industry."
    },
    skillGapAnalysis: {
      type: Type.OBJECT,
      properties: {
        matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        criticalGaps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific hurdles (physical, technical, or educational) to overcome immediately." },
        summary: { type: Type.STRING }
      },
      required: ["matchingSkills", "missingSkills", "criticalGaps", "summary"]
    },
    futureProspects: {
      type: Type.ARRAY,
      description: "A list of future career milestones, roles, and realistic income/packages in INR.",
      items: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          description: { type: Type.STRING },
          estimatedPackage: { type: Type.STRING, description: "Monthly or Annual salary/stipend in INR." },
          growthPotential: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
        },
        required: ["role", "description", "estimatedPackage", "growthPotential"]
      }
    },
    pathway: {
      type: Type.ARRAY,
      description: "Step-by-step roadmap including specific Indian training centers, academies, or institutes.",
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          nsqfLevel: { type: Type.STRING, description: "NSQF level for studies, or 'Pro-Track' for sports." },
          duration: { type: Type.STRING },
          type: { 
            type: Type.STRING,
            enum: ['Course', 'Certification', 'On-the-Job Training', 'Micro-credential', 'Assessment', 'Apprenticeship', 'Internship', 'Workshop', 'Online Module', 'Athletic Coaching', 'Fitness Training', 'Trial/Selection']
          },
          costType: { type: Type.STRING, enum: ['Free', 'Paid', 'Mixed'] },
          costNotes: { type: Type.STRING },
          learningResources: {
            type: Type.ARRAY,
            description: "MUST include physical locations/academies (e.g. SAI Center, Bangalore) for sports or specific portals (Swayam) for studies.",
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "Official name of the Academy, Center, or Platform." },
                url: { type: Type.STRING, description: "Website URL or Google Maps Search link for the physical center." }
              },
              required: ["label", "url"]
            }
          },
          relevantSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["step", "title", "description", "nsqfLevel", "duration", "type", "costType", "learningResources"]
      }
    }
  },
  required: ["summary", "recommendedRole", "skillsFeedback", "skillGapAnalysis", "futureProspects", "pathway"]
};

// Defensive check for the global process object
const getApiKey = () => {
  try {
    // Check globalThis for wider environment compatibility
    const env = (globalThis as any).process?.env || {};
    return env.API_KEY;
  } catch (e) {
    return undefined;
  }
};

export const generatePathway = async (profile: LearnerProfile): Promise<TrainingPathway> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new APIError("The Gemini API Key is not configured. Please check your environment settings.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const isSports = profile.talentCategory === 'Sports/Athletics';
  
  const systemInstruction = `You are a World-Class Talent Scout and Career Consultant specializing in both the Indian Vocational (NSQF) and Athletic (SAI/Sports Authority) systems. 
  Your primary goal is to map INDIVIDUAL HUMAN TALENT to professional outcomes. 
  
  For ${isSports ? 'SPORTS' : 'ACADEMIC/VOCATIONAL'} profiles:
  1. Analyze the 'priorSkills' as specific human aptitudes (e.g., endurance, logical reasoning, dexterity).
  2. Map these to ${isSports ? 'specific Sports Academies, SAI Regional Centers, or Olympic tracks' : 'NSQF certified courses, ITIs, and Industry apprenticeship programs'}.
  3. Every human is different; personalize the steps based on their learning pace and socioeconomic context.
  4. For Sports, include 'Trial/Selection' phases and 'Fitness Training' milestones.
  5. Provide REALISTIC career packages in INR (considering sponsorships for sports or industry salaries for vocational).
  6. Output ONLY valid JSON according to the schema.`;

  const prompt = `
    Create a highly personalized Talent-to-Career Pathway for:
    - Name: ${profile.name}
    - Category: ${profile.talentCategory}
    - Base Level: ${profile.educationLevel}
    - Field/Sport: ${profile.fieldOfStudy}
    - User's Unique Talents: ${profile.priorSkills}
    - Desired Goal: ${profile.careerAspirations}
    - Context: ${profile.socioEconomicContext}
    - Pace: ${profile.learningPace}

    Focus heavily on recommending specific PHYSICAL training centers or academies if it's a sports/practical role.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const jsonText = response.text.trim();
    const pathwayData = JSON.parse(jsonText);
    pathwayData.pathway.sort((a: any, b: any) => a.step - b.step);
    return pathwayData as TrainingPathway;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new APIError("Failed to map your talents to a pathway. Please try again.");
  }
};

export const searchCourseUpdates = async (resourceLabel: string, role: string) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find admission forms, trial dates, or contact info for "${resourceLabel}" related to becoming a "${role}" in India.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({ title: chunk.web?.title, uri: chunk.web?.uri }))
      .filter((s: any) => s.uri && s.title) || [];
    
    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return { text, sources, sourceType: 'Grounded Live Update', timestamp };
  } catch (error) {
    throw new Error("Live search failed.");
  }
};