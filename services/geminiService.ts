import { GoogleGenAI, Type } from "@google/genai";
import { LearnerProfile, TrainingPathway } from '../types';
import { APIError, ParseError } from "./errors";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A brief, encouraging summary of the recommended pathway for the learner. Address the learner by name."
    },
    recommendedRole: {
      type: Type.STRING,
      description: "The specific job role this pathway prepares the learner for."
    },
    skillsFeedback: {
      type: Type.STRING,
      description: "Provide specific, actionable advice based on the learner's 'priorSkills'. This should be constructive and encouraging. If they have relevant skills, suggest how to build on them. If they are starting new, suggest foundational first steps. Crucially, include recommendations for concrete actions, such as 'Consider exploring free courses on data entry on the eSkill India portal' or 'A good starting project would be to create a simple budget spreadsheet using MS Excel to practice your skills.'"
    },
    pathway: {
      type: Type.ARRAY,
      description: "The sequence of steps in the training journey.",
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER, description: "The step number, starting from 1." },
          title: { type: Type.STRING, description: "A clear title for this step (e.g., 'Foundational Skills in Digital Literacy', 'Advanced Certification in Cloud Computing')." },
          description: { type: Type.STRING, description: "A detailed explanation of this step, including what the learner will achieve and why it's important." },
          nsqfLevel: { type: Type.STRING, description: "The corresponding NSQF level for this training step (e.g., 'Level 3', 'Level 5'). If not applicable, state 'N/A'." },
          duration: { type: Type.STRING, description: "An estimated duration for completing this step (e.g., '3 months', '40 hours', '6 weeks')." },
          type: { 
            type: Type.STRING,
            enum: ['Course', 'Certification', 'On-the-Job Training', 'Micro-credential', 'Assessment', 'Apprenticeship', 'Internship', 'Workshop', 'Online Module'],
            description: "The type of activity." 
          },
          relevantSkills: {
            type: Type.ARRAY,
            description: "An array of strings listing which of the user's 'priorSkills' are directly relevant to this step. Only include skills from the user's input. If no prior skills apply, this can be omitted.",
            items: { type: Type.STRING }
          }
        },
        required: ["step", "title", "description", "nsqfLevel", "duration", "type"]
      }
    }
  },
  required: ["summary", "recommendedRole", "skillsFeedback", "pathway"]
};


export const generatePathway = async (profile: LearnerProfile): Promise<TrainingPathway> => {
  const systemInstruction = `You are an expert career counselor for India's National Skills Qualifications Framework (NSQF). Your role is to create a personalized, adaptive vocational training pathway for a learner based on their profile and aspirations. The pathway must align with NCVET qualifications and consider current industry demands for skills in India. The output must be a structured JSON object following the provided schema.`;

  const prompt = `
    Please generate a personalized training pathway for the following learner:

    - Name: ${profile.name}
    - Highest Education: ${profile.educationLevel}
    - Field of Study: ${profile.fieldOfStudy}
    - Existing Skills: ${profile.priorSkills || 'None specified'}
    - Socio-economic Context: ${profile.socioEconomicContext}
    - Preferred Learning Pace: ${profile.learningPace}
    - Preferred Difficulty Level: ${profile.difficultyLevel}
    - Career Aspiration: ${profile.careerAspirations}

    Based on this profile, create a step-by-step pathway that is realistic, encouraging, and leads to a specific, in-demand job role. Ensure the steps are logical and build upon each other.

    To make the pathway more practical and comprehensive, incorporate a variety of training types. Where appropriate, include hands-on experiences like 'Apprenticeship', 'Internship', and 'On-the-Job Training', along with focused, shorter-term options like 'Workshop' and 'Online Module' to supplement core 'Courses' and 'Certifications'.

    For each step in the pathway, if any of the learner's 'Existing Skills' are a direct foundation for that step, list them in the 'relevantSkills' field for that step. This helps the learner see how their current knowledge applies.

    For the 'skillsFeedback', provide highly specific and actionable advice. Go beyond general statements. Suggest specific types of free online courses on relevant platforms (like Swayam, NPTEL, or the eSkill India portal) or recommend a small, practical project the learner can start immediately to build confidence and foundational skills relevant to their new pathway.
  `;

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
      throw new APIError("The AI service is currently unavailable due to a configuration issue. Our team has been notified.");
    }
    throw new APIError("There was a problem communicating with the AI service. Please check your internet connection or try again in a few moments.");
  }
  
  let pathwayData;
  try {
    const jsonText = response.text.trim();
     if (!jsonText) {
      throw new ParseError("The AI returned an empty response, which may be a temporary issue. Please try your request again.");
    }
    pathwayData = JSON.parse(jsonText);
  } catch (error) {
    console.error("Error parsing JSON response from AI:", error);
    if (error instanceof ParseError) {
      throw error;
    }
    throw new ParseError("The AI service returned an invalid response. This can happen during high traffic. Please try again in a moment.");
  }
  
  if (!pathwayData.pathway || !Array.isArray(pathwayData.pathway) || pathwayData.pathway.length === 0) {
    throw new ParseError("The AI's response was incomplete or did not contain a valid pathway. Please try refining your career goals and submit again.");
  }

  // Sort pathway steps just in case the model returns them out of order
  pathwayData.pathway.sort((a: any, b: any) => a.step - b.step);

  return pathwayData as TrainingPathway;
};