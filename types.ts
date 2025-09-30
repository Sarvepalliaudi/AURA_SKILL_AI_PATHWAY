// FIX: The contents of this file were replaced. It incorrectly contained a copy of the App component,
// causing widespread import and type errors. It now contains the correct type definitions for the application.

export interface LearnerProfile {
  name: string;
  educationLevel: string;
  fieldOfStudy: string;
  priorSkills: string;
  socioEconomicContext: string;
  learningPace: 'slow' | 'medium' | 'fast';
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  careerAspirations: string;
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
  | 'Online Module';

export interface PathwayStep {
  step: number;
  title: string;
  description: string;
  nsqfLevel: string;
  duration: string;
  type: PathwayStepType;
  relevantSkills?: string[];
}

export interface TrainingPathway {
  summary: string;
  recommendedRole: string;
  skillsFeedback: string;
  pathway: PathwayStep[];
}