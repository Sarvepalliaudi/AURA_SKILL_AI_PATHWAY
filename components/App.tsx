import React, { useState, useCallback, useEffect } from 'react';
import { LearnerProfile, TrainingPathway } from '../types';
import { generatePathway } from '../services/geminiService';
import Header from './Header';
import Footer from './Footer';
import LearnerProfileForm from './LearnerProfileForm';
import PathwayDisplay from './PathwayDisplay';
import { APIError, ParseError } from '../services/errors';
import { ErrorIcon } from './IconComponents';

const LOCAL_STORAGE_KEY = 'ncvet-pathway-data';

const App: React.FC = () => {
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [trainingPathway, setTrainingPathway] = useState<TrainingPathway | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  useEffect(() => {
    try {
      const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedData) {
        const { pathway, profile } = JSON.parse(savedData);
        if (pathway && profile) {
          setTrainingPathway(pathway);
          setLearnerProfile(profile);
        }
      }
    } catch (err) {
      console.error("Failed to load or parse saved pathway from localStorage.", err);
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear corrupted data
    }
  }, []);

  // Effect to simulate progress when loading
  useEffect(() => {
    let timer: number | undefined;
    if (isLoading && progress < 95) {
      // Use a timeout to increment progress, creating a simulation
      timer = window.setTimeout(() => {
        setProgress(prev => Math.min(prev + Math.floor(Math.random() * 10) + 5, 95));
      }, 400);
    }
    return () => clearTimeout(timer);
  }, [isLoading, progress]);

  // Effect to update the status text based on progress
  useEffect(() => {
    if (!isLoading) {
      setProgressText('');
      return;
    }

    if (progress < 33) {
      setProgressText("Analyzing market trends for your role...");
    } else if (progress < 66) {
      setProgressText("Mapping NSQF levels to your skills...");
    } else {
      setProgressText("Just a moment while we craft your future...");
    }
  }, [isLoading, progress]);

  const handleProfileSubmit = useCallback(async (profile: LearnerProfile) => {
    setIsLoading(true);
    setProgress(0); // Start progress from 0
    setError(null);
    setTrainingPathway(null);
    setLearnerProfile(profile);

    try {
      const pathway = await generatePathway(profile);
      setProgress(100); // Set progress to 100% on success
      setTrainingPathway(pathway);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ pathway, profile }));
      
      // Pause briefly to show 100% before switching view
      setTimeout(() => {
        setIsLoading(false);
      }, 500);

    } catch (err) {
      console.error(err);
      if (err instanceof APIError || err instanceof ParseError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please review your input and try again.');
      }
      setProgress(100); // Also complete progress on error
      
      // Pause briefly before showing error
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, []);

  const handleReset = () => {
    setLearnerProfile(null);
    setTrainingPathway(null);
    setError(null);
    setIsLoading(false);
    setProgress(0); // Reset progress
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {!trainingPathway && !isLoading && (
            <LearnerProfileForm onSubmit={handleProfileSubmit} />
          )}
          
          {isLoading && (
             <div className="text-center p-8 bg-white rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold text-slate-700">Crafting Your Future...</h2>
                <p className="text-slate-500 mt-4 text-lg min-h-[1.5em]">
                  {progressText}
                </p>
                
                <div className="w-full bg-slate-200 rounded-full h-2.5 my-6">
                    <div 
                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-linear" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                
                <p className="text-sm text-slate-600 font-medium">{Math.round(progress)}% Complete</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="text-center p-8 bg-white rounded-xl shadow-md border border-red-200">
              <ErrorIcon />
              <h2 className="text-xl font-semibold text-red-600 mt-4">Error Generating Pathway</h2>
              <p className="text-slate-600 mt-2">{error}</p>
              <button
                onClick={handleReset}
                className="mt-6 bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          )}

          {trainingPathway && !isLoading && (
            <PathwayDisplay pathway={trainingPathway} profile={learnerProfile!} onReset={handleReset} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;