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
            description: "MUST prioritize official GoI links. Include portals like Skill India Digital (skillindiadigital.gov.in), Swayam (swayam.gov.in), SAI (sportsauthorityofindia.nic.in), NCVET, or MyGov.",
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "Official name of the Academy, Center, or GoI Portal." },
                url: { type: Type.STRING, description: "Official .gov.in or .nic.in URL or a verified training center link." }
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

export const generatePathway = async (profile: LearnerProfile): Promise<TrainingPathway> => {
  if (!process.env.API_KEY) {
    throw new APIError("The Gemini API key is not configured in the environment variables. Please ensure API_KEY is set in your project settings.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isSports = profile.talentCategory === 'Sports/Athletics';
  
  const systemInstruction = `You are the core intelligence of AURA SKILL - NCVET AI Pathfinder. Your expertise covers the National Skills Qualifications Framework (NSQF) and the Sports Authority of India (SAI) ecosystems. 
  
  CRITICAL GUIDELINES:
  1. ACCURACY: You must provide links and references to official Indian Government portals.
  2. RESOURCES: For vocational tracks, prioritize Skill India Digital, NCVET, Swayam, and NSDC. For sports, prioritize SAI Academies, Khelo India, and National Sports Federations.
  3. LOCALIZATION: Reference physical centers in major Indian cities (Delhi, Mumbai, Bengaluru, etc.) relevant to the user's location or context.
  4. NSQF ALIGNMENT: Every vocational step MUST have an explicit NSQF Level (1-10).
  5. OUTPUT: Return valid JSON matching the schema. Be encouraging, precise, and professional.`;

  const prompt = `User Profile:
  Name: ${profile.name}
  Talent Category: ${profile.talentCategory}
  Education: ${profile.educationLevel}
  Focus: ${profile.fieldOfStudy}
  Unique Talents: ${profile.priorSkills}
  Aspiration: ${profile.careerAspirations}
  Pace: ${profile.learningPace}
  
  Task: Construct a complete Career/Talent Roadmap. Ensure all Resource URLs are authentic GoI platforms or verified training institutes.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    const jsonText = response.text.trim();
    const pathwayData = JSON.parse(jsonText);
    pathwayData.pathway.sort((a: any, b: any) => a.step - b.step);
    return pathwayData as TrainingPathway;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new APIError("The AI encountered an error while mapping your GoI pathway. Please try again.");
  }
};

export const searchCourseUpdates = async (resourceLabel: string, role: string) => {
  if (!process.env.API_KEY) {
    throw new APIError("The Gemini API key is not configured. Please ensure API_KEY is set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for official notification, admission dates, or registration links on government websites (.gov.in, .nic.in) for "${resourceLabel}" training in India for the role of "${role}".`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    
    const text = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({ title: chunk.web?.title, uri: chunk.web?.uri }))
      .filter((s: any) => s.uri && s.title) || [];
    
    const timestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });

    return { text, sources, sourceType: 'Grounded GoI Update', timestamp };
  } catch (error) {
    console.error("Search API Error:", error);
    throw new Error("Live search failed. Please try again.");
  }
};
