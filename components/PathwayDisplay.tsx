import React, { useState, useEffect } from 'react';
import { LearnerProfile, TrainingPathway, PathwayStep } from '../types';
import { 
  PathwayStepIcon, 
  ShareIcon, 
  DownloadIcon, 
  SparklesIcon, 
  SearchIcon, 
  TagIcon,
  TwitterIcon,
  FacebookIcon,
  LinkedInIcon,
  GoogleIcon
} from './IconComponents';
import { searchCourseUpdates } from '../services/geminiService';
import jsPDF from 'jspdf';

interface PathwayDisplayProps {
  pathway: TrainingPathway;
  profile: LearnerProfile;
  onReset: () => void;
}

interface SearchResultState {
  [key: string]: {
    text: string;
    sources: { title: string; uri: string }[];
    sourceType: string;
    timestamp: string;
    loading: boolean;
    error?: string;
  };
}

const getAppearanceForType = (type: PathwayStep['type']) => {
  switch (type) {
    case 'Athletic Coaching':
    case 'Fitness Training':
    case 'Trial/Selection':
      return { bgColor: 'bg-orange-100', iconColor: 'text-orange-600', hex: '#ea580c' };
    case 'Course': return { bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', hex: '#4f46e5' };
    case 'Certification': return { bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', hex: '#059669' };
    case 'Assessment': return { bgColor: 'bg-slate-200', iconColor: 'text-slate-600', hex: '#475569' };
    default: return { bgColor: 'bg-gray-100', iconColor: 'text-gray-600', hex: '#4b5563' };
  }
};

const PathwayDisplay: React.FC<PathwayDisplayProps> = ({ pathway, profile, onReset }) => {
  const [shareStatus, setShareStatus] = useState('Share');
  const [isExporting, setIsExporting] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultState>({});
  
  const isSports = profile.talentCategory === 'Sports/Athletics';
  const themeColor = isSports ? 'orange' : 'indigo';
  const themeHex = isSports ? '#ea580c' : '#4f46e5';

  const handleLiveSearch = async (resourceLabel: string, stepIndex: number, resIndex: number) => {
    const key = `${stepIndex}-${resIndex}`;
    setSearchResults(prev => ({ ...prev, [key]: { text: '', sources: [], sourceType: '', timestamp: '', loading: true } }));
    try {
      const result = await searchCourseUpdates(resourceLabel, pathway.recommendedRole);
      setSearchResults(prev => ({ ...prev, [key]: { ...result, loading: false } }));
    } catch (err) {
      setSearchResults(prev => ({ ...prev, [key]: { text: '', sources: [], sourceType: '', timestamp: '', loading: false, error: 'Search failed.' } }));
    }
  };

  const handleDirectGoogleSearch = (resourceLabel: string) => {
    const query = encodeURIComponent(`${resourceLabel} ${pathway.recommendedRole} training in India`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFontSize(22);
      doc.setTextColor(isSports ? 234 : 79, isSports ? 88 : 70, isSports ? 12 : 229);
      doc.text("NCVET AI TALENT REPORT", 20, 25);
      
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text(`Candidate: ${profile.name}`, 20, 40);
      doc.text(`Track: ${profile.talentCategory} (${profile.fieldOfStudy})`, 20, 47);
      
      doc.setFontSize(14);
      doc.text("Strategic Summary", 20, 60);
      const summLines = doc.splitTextToSize(pathway.summary, 170);
      doc.setFontSize(10);
      doc.text(summLines, 20, 67);
      
      doc.save(`TalentPathway-${profile.name}.pdf`);
    } catch (e) { console.error(e); } finally { setIsExporting(false); }
  };

  const shareText = `I just generated my personal talent-to-career pathway for ${pathway.recommendedRole} using NCVET AI Pathfinder! Check it out.`;
  const shareUrl = window.location.href;
  const hashtags = "NCVET,AI,CareerPath,SkillIndia,Talent";

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    let url = '';
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedHashtags = encodeURIComponent(hashtags);

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}&hashtags=${encodedHashtags}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NCVET AI Pathfinder - My Career Map',
          text: shareText,
          url: shareUrl,
        });
        setShareStatus('Shared!');
      } catch (e) {
        console.error("Error sharing", e);
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareStatus('Copied!');
    }
    setTimeout(() => setShareStatus('Share'), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-slate-100">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-${themeColor}-600 shadow-lg shadow-${themeColor}-200`}>
            {profile.talentCategory} Track
          </span>
          <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
            {profile.learningPace} Pace
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">Your Talent Roadmap</h2>
        
        <div className={`p-8 bg-${themeColor}-50/50 border-l-[12px] border-${themeColor}-600 rounded-3xl mb-8 relative overflow-hidden`}>
           <div className={`absolute -right-10 -top-10 h-32 w-32 bg-${themeColor}-600/5 rounded-full`}></div>
           <h3 className={`text-2xl font-black text-${themeColor}-900 mb-3`}>{pathway.recommendedRole}</h3>
           <p className={`text-${themeColor}-800 font-medium text-lg leading-relaxed`}>{pathway.summary}</p>
        </div>

        {/* Talent Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Leveraging Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {pathway.skillGapAnalysis.matchingSkills.map((skill, i) => (
                  <span key={i} className="bg-white text-emerald-700 text-xs font-bold px-4 py-2 rounded-xl shadow-sm border border-emerald-100">{skill}</span>
                ))}
              </div>
           </div>
           <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl">
              <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-4">Gaps to Overcome</h4>
              <div className="flex flex-wrap gap-2">
                {pathway.skillGapAnalysis.missingSkills.map((skill, i) => (
                  <span key={i} className="bg-white text-rose-700 text-xs font-bold px-4 py-2 rounded-xl shadow-sm border border-rose-100">{skill}</span>
                ))}
              </div>
           </div>
        </div>

        {/* Career Outlook Section */}
        <div className="bg-slate-900 p-8 rounded-3xl text-white mb-8">
          <div className="flex items-center gap-3 mb-6">
            <SparklesIcon className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-black uppercase tracking-tight">Future Career Outlook</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pathway.futureProspects.map((prospect, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-bold group-hover:text-white transition-colors">{prospect.role}</h4>
                  <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${prospect.growthPotential === 'High' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {prospect.growthPotential}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-4 line-clamp-2">{prospect.description}</p>
                <div className="pt-4 border-t border-white/5">
                   <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Estimated Package</p>
                   <p className={`text-sm font-black text-${themeColor}-400`}>{prospect.estimatedPackage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 bg-amber-50/50 border-l-4 border-amber-500 rounded-2xl mb-8`}>
          <h4 className="text-xs font-bold text-amber-900 mb-1 uppercase">Expert Insights</h4>
          <p className="text-sm text-amber-800 italic leading-relaxed">{pathway.skillsFeedback}</p>
        </div>

        {/* Social Share Bar */}
        <div className="pt-6 border-t border-slate-100">
           <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Share Your Achievement</p>
           <div className="flex justify-center items-center gap-4">
              <button 
                onClick={() => handleSocialShare('twitter')}
                className="p-3 bg-black text-white rounded-full hover:scale-110 transition-all shadow-md"
                title="Share on X (Twitter)"
              >
                <TwitterIcon />
              </button>
              <button 
                onClick={() => handleSocialShare('facebook')}
                className="p-3 bg-[#1877F2] text-white rounded-full hover:scale-110 transition-all shadow-md"
                title="Share on Facebook"
              >
                <FacebookIcon />
              </button>
              <button 
                onClick={() => handleSocialShare('linkedin')}
                className="p-3 bg-[#0077B5] text-white rounded-full hover:scale-110 transition-all shadow-md"
                title="Share on LinkedIn"
              >
                <LinkedInIcon />
              </button>
              <button 
                onClick={handleNativeShare}
                className={`p-3 bg-${themeColor}-600 text-white rounded-full hover:scale-110 transition-all shadow-md flex items-center gap-2 px-5`}
                title="Copy Link or Share"
              >
                <ShareIcon className="h-5 w-5" />
                <span className="text-xs font-bold">{shareStatus}</span>
              </button>
           </div>
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-2xl font-black text-slate-900 mb-10 px-4 flex items-center gap-3">
           <div className={`h-8 w-2 bg-${themeColor}-600 rounded-full`}></div>
           Development Journey
        </h3>
        <div className="relative">
          <div className="absolute left-7 md:left-10 top-0 bottom-0 w-1 bg-slate-200" style={{ transform: 'translateX(-50%)' }}></div>
          <div className="space-y-12">
            {pathway.pathway.map((step, sIdx) => {
              const app = getAppearanceForType(step.type);
              return (
                <div key={step.step} className="relative flex items-start space-x-6 md:space-x-12 animate-fadeInUp" style={{ animationDelay: `${sIdx * 150}ms`, opacity: 0 }}>
                  <div className="relative flex-shrink-0 z-10">
                    <div className={`${app.bgColor} rounded-full h-14 w-14 md:h-20 md:w-20 flex items-center justify-center shadow-xl ring-8 ring-slate-50 border border-white`}>
                      <PathwayStepIcon type={step.type} className={`h-6 w-6 md:h-10 md:w-10 ${app.iconColor}`} />
                    </div>
                  </div>

                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 flex-1 hover:shadow-2xl transition-all group">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-2">
                       <div>
                          <p className={`text-[10px] font-black ${app.iconColor} uppercase tracking-widest mb-1`}>{step.type}</p>
                          <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">{step.step}. {step.title}</h3>
                       </div>
                       <div className="flex flex-wrap gap-2">
                         <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase">{step.nsqfLevel}</span>
                         <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase">{step.duration}</span>
                       </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6">{step.description}</p>
                    
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Training Centers & Academies</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {step.learningResources.map((res, rIdx) => (
                          <div key={rIdx} className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <a 
                                href={res.url} target="_blank" rel="noopener noreferrer" 
                                className={`flex-1 text-xs font-black text-${themeColor}-600 bg-white p-4 rounded-xl border border-${themeColor}-50 hover:bg-${themeColor}-600 hover:text-white transition-all shadow-sm flex items-center justify-between group/link`}
                              >
                                {res.label}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                              </a>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleLiveSearch(res.label, sIdx, rIdx)} 
                                  className="p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                                  title="Get AI Insights"
                                >
                                  <SearchIcon />
                                </button>
                                <button 
                                  onClick={() => handleDirectGoogleSearch(res.label)} 
                                  className="p-4 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm text-slate-400 hover:text-indigo-600"
                                  title="Search on Google"
                                >
                                  <GoogleIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            
                            {searchResults[`${sIdx}-${rIdx}`] && (
                              <div className="bg-white border p-4 rounded-xl mt-2 animate-fadeIn text-xs text-slate-600 shadow-sm border-indigo-100">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-50">
                                   <span className="font-black uppercase text-[9px] text-indigo-600 flex items-center gap-1">
                                      <SparklesIcon className="w-3 h-3" />
                                      AI Insight
                                   </span>
                                   <span className="text-[9px] text-slate-400 font-medium">
                                      Last Updated: {searchResults[`${sIdx}-${rIdx}`].timestamp}
                                   </span>
                                </div>
                                <div className="leading-relaxed">
                                   {searchResults[`${sIdx}-${rIdx}`].text}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Meet the Developer & Feedback Section */}
      <div className="mt-20 p-8 md:p-12 bg-white rounded-3xl shadow-2xl border border-slate-100 text-center animate-fadeInUp">
        <div className="inline-flex p-3 bg-indigo-50 rounded-2xl mb-6">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">Have Queries or Feedback?</h3>
        <p className="text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed text-lg">
          I'm <strong>AUDI SIVA BHANUVARDHAN SARVEPALLI</strong>, the developer behind NCVET AI Pathfinder. 
          I'd love to hear your thoughts on this system or connect professionally.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <a href="mailto:sarvepalliaudi@gmail.com" className="flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Send Feedback
          </a>
          <a href="https://www.linkedin.com/in/audi-siva-bhanuvardhan-sarvepalli-4598a8289/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-white text-[#0077B5] border-2 border-[#0077B5]/20 font-bold py-4 px-6 rounded-2xl hover:bg-[#0077B5] hover:text-white transition-all shadow-lg shadow-slate-100 active:scale-95">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            Connect LinkedIn
          </a>
          <a href="https://sarvepalliaudi.github.io/asphenixnewprotofolio/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            My Portfolio
          </a>
          <a href="https://asphenix-rrq5sx5.gamma.site/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-white text-slate-800 border-2 border-slate-200 font-bold py-4 px-6 rounded-2xl hover:bg-slate-50 transition-all shadow-lg active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
            Visit Website
          </a>
        </div>
      </div>

      <div className="sticky bottom-6 flex flex-col sm:flex-row justify-center gap-4 pt-10 z-40 px-4">
        <button onClick={handleExportPDF} className="bg-slate-900 text-white font-black py-5 px-10 rounded-2xl hover:bg-black w-full sm:w-auto shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
          <DownloadIcon className="h-6 w-6" /> Download Full Profile
        </button>
        <button onClick={onReset} className={`bg-${themeColor}-600 text-white font-black py-5 px-10 rounded-2xl hover:bg-${themeColor}-700 w-full sm:w-auto shadow-2xl active:scale-[0.98] transition-all`}>
          New Talent Assessment
        </button>
      </div>
    </div>
  );
};

export default PathwayDisplay;