import React, { useState } from 'react';
import { LearnerProfile } from '../types';

interface LearnerProfileFormProps {
  onSubmit: (profile: LearnerProfile) => void;
}

interface FormState {
  name: string;
  educationLevel: string;
  educationLevelOther: string;
  fieldOfStudy: string;
  priorSkills: string;
  socioEconomicContext: string;
  socioEconomicContextOther: string;
  learningPace: 'slow' | 'medium' | 'fast';
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  careerAspirations: string;
}

const LearnerProfileForm: React.FC<LearnerProfileFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    educationLevel: '12th Pass',
    educationLevelOther: '',
    fieldOfStudy: '',
    priorSkills: '',
    socioEconomicContext: 'Urban',
    socioEconomicContextOther: '',
    learningPace: 'medium',
    difficultyLevel: 'Beginner',
    careerAspirations: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.fieldOfStudy.trim()) newErrors.fieldOfStudy = "Field of study is required.";
    if (!formData.careerAspirations.trim()) newErrors.careerAspirations = "Career aspirations are required.";

    if (formData.educationLevel === 'Other' && !formData.educationLevelOther.trim()) {
      newErrors.educationLevelOther = "Please specify your education level.";
    }
    if (formData.socioEconomicContext === 'Other' && !formData.socioEconomicContextOther.trim()) {
      newErrors.socioEconomicContextOther = "Please specify your location context.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const profileToSubmit: LearnerProfile = {
        name: formData.name,
        educationLevel: formData.educationLevel === 'Other' ? formData.educationLevelOther : formData.educationLevel,
        fieldOfStudy: formData.fieldOfStudy,
        priorSkills: formData.priorSkills,
        socioEconomicContext: formData.socioEconomicContext === 'Other' ? formData.socioEconomicContextOther : formData.socioEconomicContext,
        learningPace: formData.learningPace,
        difficultyLevel: formData.difficultyLevel,
        careerAspirations: formData.careerAspirations,
      };
      onSubmit(profileToSubmit);
    }
  };

  const educationLevels = ["10th Pass", "12th Pass", "Diploma", "Undergraduate", "Graduate", "Postgraduate", "Other"];
  const contexts = ["Urban", "Semi-urban", "Rural", "Other"];
  const paces = [{value: "slow", label: "Slow & Steady"}, {value: "medium", label: "Moderate Pace"}, {value: "fast", label: "Fast-tracked"}];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Discover Your Learning Path</h2>
      <p className="text-slate-500 mb-8">Tell us about yourself, and our AI will create a personalized vocational training plan for you.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.name ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="educationLevel" className="block text-sm font-medium text-slate-700">Highest Education Level</label>
            <select id="educationLevel" name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              {educationLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
            {formData.educationLevel === 'Other' && (
              <div className="mt-2">
                <label htmlFor="educationLevelOther" className="block text-sm font-medium text-slate-700 mb-1">
                  Please Specify <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="educationLevelOther"
                  name="educationLevelOther" 
                  value={formData.educationLevelOther} 
                  onChange={handleChange} 
                  className={`block w-full px-3 py-2 bg-white border ${errors.educationLevelOther ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} 
                />
                {errors.educationLevelOther && <p className="text-red-500 text-xs mt-1">{errors.educationLevelOther}</p>}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-slate-700">Field of Study / Major Subject <span className="text-red-500">*</span></label>
          <input type="text" id="fieldOfStudy" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} placeholder="e.g., Science, Commerce, Arts, ITI Fitter" className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.fieldOfStudy ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} />
          {errors.fieldOfStudy && <p className="text-red-500 text-xs mt-1">{errors.fieldOfStudy}</p>}
        </div>

        <div>
          <label htmlFor="priorSkills" className="block text-sm font-medium text-slate-700">Prior Skills or Experience (Optional)</label>
          <textarea id="priorSkills" name="priorSkills" value={formData.priorSkills} onChange={handleChange} rows={3} placeholder="e.g., Basic computer skills, MS Office, customer service" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
        </div>
        
        <div>
            <label htmlFor="socioEconomicContext" className="block text-sm font-medium text-slate-700">Your Location Context</label>
            <select id="socioEconomicContext" name="socioEconomicContext" value={formData.socioEconomicContext} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              {contexts.map(ctx => <option key={ctx} value={ctx}>{ctx}</option>)}
            </select>
            {formData.socioEconomicContext === 'Other' && (
              <div className="mt-2">
                 <label htmlFor="socioEconomicContextOther" className="block text-sm font-medium text-slate-700 mb-1">
                  Please Specify <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  id="socioEconomicContextOther"
                  name="socioEconomicContextOther" 
                  value={formData.socioEconomicContextOther} 
                  onChange={handleChange} 
                  className={`block w-full px-3 py-2 bg-white border ${errors.socioEconomicContextOther ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} 
                />
                {errors.socioEconomicContextOther && <p className="text-red-500 text-xs mt-1">{errors.socioEconomicContextOther}</p>}
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="learningPace" className="block text-sm font-medium text-slate-700">Preferred Learning Pace</label>
            <select id="learningPace" name="learningPace" value={formData.learningPace} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              {paces.map(pace => <option key={pace.value} value={pace.value}>{pace.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="difficultyLevel" className="block text-sm font-medium text-slate-700">Preferred Difficulty</label>
            <select id="difficultyLevel" name="difficultyLevel" value={formData.difficultyLevel} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              {difficulties.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="careerAspirations" className="block text-sm font-medium text-slate-700">Career Aspirations <span className="text-red-500">*</span></label>
          <textarea id="careerAspirations" name="careerAspirations" value={formData.careerAspirations} onChange={handleChange} rows={3} placeholder="Describe your dream job or the field you want to work in, e.g., 'I want to become a solar panel technician' or 'I am interested in digital marketing'" className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.careerAspirations ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}></textarea>
          {errors.careerAspirations && <p className="text-red-500 text-xs mt-1">{errors.careerAspirations}</p>}
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Generate My Pathway
          </button>
        </div>
      </form>
    </div>
  );
};

export default LearnerProfileForm;