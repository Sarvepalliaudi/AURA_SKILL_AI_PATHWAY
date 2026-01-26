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
  talentCategory: 'Academic/Vocational' | 'Sports/Athletics';
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
    talentCategory: 'Academic/Vocational',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.fieldOfStudy.trim()) newErrors.fieldOfStudy = formData.talentCategory === 'Sports/Athletics' ? "Preferred Sport is required." : "Subject/Trade is required.";
    if (!formData.careerAspirations.trim()) newErrors.careerAspirations = "Goal is required.";

    if (formData.educationLevel === 'Other' && !formData.educationLevelOther.trim()) {
      newErrors.educationLevelOther = "Please specify.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const profileToSubmit: LearnerProfile = {
        ...formData,
        educationLevel: formData.educationLevel === 'Other' ? formData.educationLevelOther : formData.educationLevel,
        socioEconomicContext: formData.socioEconomicContext === 'Other' ? formData.socioEconomicContextOther : formData.socioEconomicContext,
      };
      onSubmit(profileToSubmit);
    }
  };

  const educationLevels = ["10th Pass", "12th Pass", "Diploma", "Undergraduate", "Graduate", "Postgraduate", "Other"];
  const inputClasses = "mt-1 block w-full px-4 py-3 text-base bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400";
  const errorInputClasses = "mt-1 block w-full px-4 py-3 text-base bg-white border border-red-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all";

  return (
    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl border border-slate-100 animate-fadeInUp">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-2">Talent Pathfinder</h2>
        <p className="text-slate-500 max-w-lg mx-auto">Every human has a unique spark. Whether it's a technical trade or a physical sport, we'll map your pathway to the right training center.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Talent Category Toggle */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, talentCategory: 'Academic/Vocational' }))}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${formData.talentCategory === 'Academic/Vocational' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-9-5.747h18M5.468 12.012A9.004 9.004 0 0112 3.012a9.004 9.004 0 016.532 8.999 9.004 9.004 0 01-6.532 9.001 9.004 9.004 0 01-6.532-9" /></svg>
            Study & Work
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, talentCategory: 'Sports/Athletics' }))}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${formData.talentCategory === 'Sports/Athletics' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Sports & Athletic
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Your Name</label>
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className={errors.name ? errorInputClasses : inputClasses} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Base Level</label>
            <select name="educationLevel" value={formData.educationLevel} onChange={handleChange} className={inputClasses}>
              {educationLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">
            {formData.talentCategory === 'Academic/Vocational' ? 'Field of Study / Trade' : 'Primary Sport / Physical Skill'}
          </label>
          <input 
            type="text" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} 
            placeholder={formData.talentCategory === 'Academic/Vocational' ? "e.g., Electronics, Cybersecurity, Plumbing, CSE, MECH, CIVIL,Electrical" : "e.g., Javelin Throw, High Jump, Football, Volleyball, Swimming"} 
            className={errors.fieldOfStudy ? errorInputClasses : inputClasses} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Describe Your Talents</label>
          <textarea 
            name="priorSkills" value={formData.priorSkills} onChange={handleChange} rows={3} 
            placeholder={formData.talentCategory === 'Academic/Vocational' ? "e.g., Good with hands, logical problem solver, C++,CAD, Quantum Computing, Ms office" : "e.g., High explosive power, district-level swimming experience, great balance"} 
            className={inputClasses}
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">What's the Dream?</label>
          <textarea 
            name="careerAspirations" value={formData.careerAspirations} onChange={handleChange} rows={2} 
            placeholder={formData.talentCategory === 'Academic/Vocational' ? "e.g. Work as a lead technician at Tata, want to become an CEO" : "e.g. Enter a SAI Academy and play for India, want to win National Medal In Swimming for India"} 
            className={errors.careerAspirations ? errorInputClasses : inputClasses}
          ></textarea>
        </div>

        <button 
          type="submit" 
          className={`w-full text-white font-black py-4 px-6 rounded-2xl active:scale-[0.98] transition-all duration-200 shadow-xl ${formData.talentCategory === 'Sports/Athletics' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
        >
          Generate My Pathway
        </button>
      </form>
    </div>
  );
};

export default LearnerProfileForm;