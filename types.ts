// Updated types to include learning resources, cost classification, skill gap analysis, future prospects, and talent categories
export interface LearnerProfile {
  name: string;
  educationLevel: string;
  fieldOfStudy: string; // Used for "Sport/Activity" in sports mode
  priorSkills: string;
  socioEconomicContext: string;
  learningPace: 'slow' | 'medium' | 'fast';
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  careerAspirations: string;
  talentCategory: 'Academic/Vocational' | 'Sports/Athletics';
}

export type PathwayStepType =
  | 'Course'
  | 'Certification'
  | 'On-the-Job Training'
  | 'Micro-credential'
  | 'Assessment'
  | 'Apprenticeship'
  | 'Internship'
  | 'Workshop'
  | 'Online Module'
  | 'Athletic Coaching'
  | 'Fitness Training'
  | 'Trial/Selection';

export interface LearningResource {
  label: string;
  url: string;
}

export interface SkillGapAnalysis {
  matchingSkills: string[];
  missingSkills: string[];
  criticalGaps: string[];
  summary: string;
}

export interface JobProspect {
  role: string;
  description: string;
  estimatedPackage: string; 
  growthPotential: 'High' | 'Medium' | 'Low';
}

export interface PathwayStep {
  step: number;
  title: string;
  description: string;
  nsqfLevel: string;
  duration: string;
  type: PathwayStepType;
  relevantSkills?: string[];
  learningResources: LearningResource[];
  costType: 'Free' | 'Paid' | 'Mixed';
  costNotes?: string;
}

export interface TrainingPathway {
  summary: string;
  recommendedRole: string;
  skillsFeedback: string;
  skillGapAnalysis: SkillGapAnalysis;
  futureProspects: JobProspect[];
  pathway: PathwayStep[];
}