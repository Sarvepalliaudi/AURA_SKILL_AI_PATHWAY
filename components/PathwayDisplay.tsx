import React, { useState } from 'react';
import { LearnerProfile, TrainingPathway, PathwayStep } from '../types';
import { 
  PathwayStepIcon, 
  ShareIcon, 
  DownloadIcon, 
  SparklesIcon, 
  SearchIcon, 
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
      return { bgColor: 'bg-orange-100', iconColor: 'text-orange-600', hex: '#ea580c', rgb: [234, 88, 12] };
    case 'Course': return { bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600', hex: '#4f46e5', rgb: [79, 70, 229] };
    case 'Certification': return { bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600', hex: '#059669', rgb: [5, 150, 105] };
    case 'Assessment': return { bgColor: 'bg-slate-200', iconColor: 'text-slate-600', hex: '#475569', rgb: [71, 85, 105] };
    default: return { bgColor: 'bg-gray-100', iconColor: 'text-gray-600', hex: '#4b5563', rgb: [75, 85, 99] };
  }
};

const PathwayDisplay: React.FC<PathwayDisplayProps> = ({ pathway, profile, onReset }) => {
  const [shareStatus, setShareStatus] = useState('Share');
  const [isExporting, setIsExporting] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultState>({});
  
  const isSports = profile.talentCategory === 'Sports/Athletics';
  const themeColor = isSports ? 'orange' : 'indigo';
  const themeRGB = isSports ? [234, 88, 12] : [79, 70, 229];

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
    const query = encodeURIComponent(`site:.gov.in OR site:.nic.in ${resourceLabel} ${pathway.recommendedRole}`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank', 'noopener,noreferrer');
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let y = 0;

      const ensureFullUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
      };

      const checkPageBreak = (neededSpace: number) => {
        if (y + neededSpace > 275) {
          doc.addPage();
          y = 20;
          return true;
        }
        return false;
      };

      const drawSectionHeader = (title: string) => {
        checkPageBreak(15);
        doc.setFillColor(themeRGB[0], themeRGB[1], themeRGB[2]);
        doc.rect(margin, y, contentWidth, 8, 'F');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), margin + 4, y + 5.5);
        y += 14;
      };

      // --- PAGE 1: COVER ---
      doc.setFillColor(themeRGB[0], themeRGB[1], themeRGB[2]);
      doc.rect(0, 0, pageWidth, 60, 'F');
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text("AURA SKILL", margin, 30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text("NCVET AI TALENT STRATEGIC ROADMAP", margin, 42);
      
      y = 75;
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text(`Candidate Career Profile: ${profile.name}`, margin, y);
      y += 10;

      const drawProfileInfo = (label: string, value: string, cy: number) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(label, margin, cy);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(value || "N/A", margin + 45, cy);
      };

      drawProfileInfo("Talent Stream:", profile.talentCategory, y); y += 8;
      drawProfileInfo("Education Level:", profile.educationLevel, y); y += 8;
      drawProfileInfo("Primary Interest:", profile.fieldOfStudy, y); y += 8;
      drawProfileInfo("Learning Pace:", profile.learningPace.toUpperCase(), y); y += 15;

      drawSectionHeader("Executive Summary");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(pathway.summary, contentWidth);
      doc.text(summaryLines, margin, y);
      y += (summaryLines.length * 5) + 12;

      drawSectionHeader("Expert AI Analysis");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      const feedbackLines = doc.splitTextToSize(pathway.skillsFeedback, contentWidth);
      doc.text(feedbackLines, margin, y);
      y += (feedbackLines.length * 5) + 15;

      // --- PAGE 2: FUTURE PROSPECTS ---
      doc.addPage();
      y = 20;
      drawSectionHeader("Future Job & Career Prospects");
      
      pathway.futureProspects.forEach((prospect) => {
        const descLines = doc.splitTextToSize(prospect.description, contentWidth - 10);
        const cardHeight = 35 + (descLines.length * 4.5);
        
        checkPageBreak(cardHeight + 10);
        
        // Card Border and Background
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(252, 254, 255);
        doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2, 'FD');
        
        // Role Title
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(prospect.role, margin + 5, y + 8);
        
        // Growth Badge
        doc.setFontSize(8);
        const growthColor = prospect.growthPotential === 'High' ? [5, 150, 105] : [217, 119, 6];
        doc.setTextColor(growthColor[0], growthColor[1], growthColor[2]);
        doc.text(`GROWTH: ${prospect.growthPotential.toUpperCase()}`, margin + contentWidth - 5, y + 8, { align: 'right' });
        
        // Separator
        doc.setDrawColor(241, 245, 249);
        doc.line(margin + 5, y + 11, margin + contentWidth - 5, y + 11);
        
        // Description
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text("Role Overview:", margin + 5, y + 16);
        doc.text(descLines, margin + 5, y + 21);
        
        // Package Info
        const packageY = y + 21 + (descLines.length * 4.5) + 5;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(`Expected Salary: ${prospect.estimatedPackage}`, margin + 5, packageY);
        
        y += cardHeight + 8;
      });

      // --- PAGE 3: ROADMAP ---
      doc.addPage();
      y = 20;
      drawSectionHeader("Your Official Step-by-Step Pathway");

      pathway.pathway.forEach((step) => {
        checkPageBreak(70);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, contentWidth, 10, 1, 1, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`${step.step}. ${step.title}`, margin + 3, y + 6.5);
        y += 14;

        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`Type: ${step.type} | Duration: ${step.duration} | NSQF Level: ${step.nsqfLevel}`, margin + 5, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const dLines = doc.splitTextToSize(step.description, contentWidth - 10);
        doc.text(dLines, margin + 5, y);
        y += (dLines.length * 5) + 8;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text("Official Government & Training Links:", margin + 5, y);
        y += 5;
        step.learningResources.forEach((res) => {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(37, 99, 235);
          const linkUrl = ensureFullUrl(res.url);
          doc.text(`• ${res.label}`, margin + 8, y);
          const tWidth = doc.getTextWidth(`• ${res.label}`);
          doc.link(margin + 8, y - 3, tWidth, 5, { url: linkUrl });
          y += 5;
        });
        y += 10;
      });

      // Page numbers
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`AURA SKILL Strategic Report | ${profile.name} | Page ${i} of ${totalPages}`, pageWidth / 2, 288, { align: 'center' });
      }

      doc.save(`AURA-SKILL-Strategy-${profile.name.replace(/\s+/g, '-')}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Error generating PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeShare = async () => {
    const shareText = `Check out my career roadmap for ${pathway.recommendedRole} generated by AURA SKILL!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'AURA SKILL', text: shareText, url: window.location.href });
        setShareStatus('Shared!');
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(shareText + " " + window.location.href);
      setShareStatus('Copied!');
    }
    setTimeout(() => setShareStatus('Share'), 2500);
  };

  return (
    <div className="space-y-12 animate-fadeIn pb-48">
      {/* Top Banner & Summary */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-${themeColor}-600 shadow-xl`}>
            {profile.talentCategory}
          </span>
          <span className="bg-slate-100 text-slate-500 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">
            NSQF Mapped Profile
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">Your Strategic Roadmap</h2>
        
        <div className={`p-10 bg-${themeColor}-50/50 border-l-[16px] border-${themeColor}-600 rounded-[2rem] mb-10`}>
           <h3 className={`text-2xl font-black text-${themeColor}-900 mb-4`}>{pathway.recommendedRole}</h3>
           <p className={`text-${themeColor}-800 font-medium text-lg leading-relaxed`}>{pathway.summary}</p>
        </div>

        <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white mb-10 relative group">
           <h4 className="text-yellow-400 text-[11px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
             Expert Path Commentary
           </h4>
           <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-line font-medium italic">
             "{pathway.skillsFeedback}"
           </p>
        </div>

        {/* Skill Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
           <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-3xl">
              <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-6">Leveraging Strengths</h4>
              <div className="flex flex-wrap gap-2.5">
                {pathway.skillGapAnalysis.matchingSkills.map((skill, i) => (
                  <span key={i} className="bg-white text-emerald-700 text-xs font-bold px-5 py-2.5 rounded-2xl shadow-sm border border-emerald-100">{skill}</span>
                ))}
              </div>
           </div>
           <div className="bg-rose-50/50 border border-rose-100 p-8 rounded-3xl">
              <h4 className="text-[11px] font-black text-rose-600 uppercase tracking-widest mb-6">Critical Hurdles</h4>
              <div className="flex flex-wrap gap-2.5">
                {pathway.skillGapAnalysis.criticalGaps.map((skill, i) => (
                  <span key={i} className="bg-white text-rose-700 text-xs font-bold px-5 py-2.5 rounded-2xl shadow-sm border border-rose-100">{skill}</span>
                ))}
              </div>
           </div>
        </div>

        <div className="pt-8 border-t border-slate-100">
           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Industry Career Prospects</h4>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pathway.futureProspects.map((prospect, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-6 rounded-3xl hover:bg-white hover:shadow-xl transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <h5 className="text-sm font-black text-slate-900 leading-tight">{prospect.role}</h5>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${prospect.growthPotential === 'High' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {prospect.growthPotential}
                      </span>
                   </div>
                   <p className="text-[11px] text-slate-500 mb-5 line-clamp-2">{prospect.description}</p>
                   <div className="pt-4 border-t border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Expected Package</p>
                      <p className={`text-sm font-black text-${themeColor}-600`}>{prospect.estimatedPackage}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Progression Journey */}
      <div className="mt-20">
        <h3 className="text-3xl font-black text-slate-900 mb-12 px-6 flex items-center gap-4">
           <div className={`h-10 w-2.5 bg-${themeColor}-600 rounded-full shadow-lg`}></div>
           Step-by-Step Pathway
        </h3>
        <div className="relative">
          <div className="absolute left-8 md:left-12 top-0 bottom-0 w-1.5 bg-slate-200" style={{ transform: 'translateX(-50%)' }}></div>
          <div className="space-y-16">
            {pathway.pathway.map((step, sIdx) => {
              const app = getAppearanceForType(step.type);
              return (
                <div key={step.step} className="relative flex items-start space-x-8 md:space-x-16 animate-fadeInUp" style={{ animationDelay: `${sIdx * 150}ms`, opacity: 0 }}>
                  <div className="relative flex-shrink-0 z-10">
                    <div className={`${app.bgColor} rounded-full h-16 w-16 md:h-24 md:w-24 flex items-center justify-center shadow-2xl ring-8 ring-slate-50 border-4 border-white`}>
                      <PathwayStepIcon type={step.type} className={`h-8 w-8 md:h-12 md:w-12 ${app.iconColor}`} />
                    </div>
                  </div>
                  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 flex-1 group">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-3">
                       <div>
                          <p className={`text-[11px] font-black ${app.iconColor} uppercase tracking-widest mb-2`}>{step.type}</p>
                          <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">{step.step}. {step.title}</h3>
                       </div>
                       <div className="flex flex-wrap gap-2">
                         <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-tighter">Level {step.nsqfLevel}</span>
                         <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-tighter">{step.duration}</span>
                       </div>
                    </div>
                    <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-8">{step.description}</p>
                    
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Official Training Links</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {step.learningResources.map((res, rIdx) => (
                          <div key={rIdx} className="flex gap-2">
                            <a href={res.url} target="_blank" rel="noopener noreferrer" className={`flex-1 text-xs font-black text-${themeColor}-600 bg-white p-5 rounded-2xl border border-${themeColor}-50 hover:bg-${themeColor}-600 hover:text-white transition-all shadow-md flex items-center justify-between`}>
                              {res.label}<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                            </a>
                            <div className="flex gap-1.5">
                              <button onClick={() => handleLiveSearch(res.label, sIdx, rIdx)} className="p-5 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 shadow-sm"><SearchIcon className="w-5 h-5" /></button>
                              <button onClick={() => handleDirectGoogleSearch(res.label)} className="p-5 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 shadow-sm"><GoogleIcon className="h-5 w-5" /></button>
                            </div>
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

      {/* NEW SECTION: HELP MANUAL IN SIMPLE INDIAN ENGLISH */}
      <div className="mt-32 p-10 md:p-16 bg-white rounded-[3rem] shadow-2xl border border-slate-100">
        <h3 className="text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
          <SparklesIcon className="h-8 w-8 text-indigo-600" />
          A Guide to Your Career Path
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">What is AURA SKILL?</h4>
              <p className="text-slate-600 leading-relaxed">
                This app is an AI tool designed for Indian youth. It looks at your skills and interests to find the best career path for you. We use data from official government systems to make sure your training is recognized by the industry.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">What is NSQF?</h4>
              <p className="text-slate-600 leading-relaxed">
                NSQF stands for <strong>National Skills Qualifications Framework</strong>. It is a government system that ranks your skill level from 1 to 10. 
                <br /><br />
                • <strong>Level 1-3:</strong> Entry-level (Basic skills).
                <br />
                • <strong>Level 4-6:</strong> Skilled Worker (Technical expertise).
                <br />
                • <strong>Level 7-10:</strong> Advanced/Professional (Degree equivalent).
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">Where is this data from?</h4>
              <p className="text-slate-600 leading-relaxed">
                All training centers and roles are based on official Indian Government portals. We take references from:
              </p>
              <ul className="mt-4 space-y-2">
                <li><a href="https://www.skillindiadigital.gov.in/" target="_blank" className="text-indigo-600 font-bold hover:underline">Skill India Digital Portal</a></li>
                <li><a href="https://ncvet.gov.in/" target="_blank" className="text-indigo-600 font-bold hover:underline">NCVET (National Council for Vocational Education)</a></li>
                <li><a href="https://sportsauthorityofindia.nic.in/" target="_blank" className="text-indigo-600 font-bold hover:underline">Sports Authority of India (SAI)</a></li>
                <li><a href="https://swayam.gov.in/" target="_blank" className="text-indigo-600 font-bold hover:underline">SWAYAM Learning Portal</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">How to use this report?</h4>
              <p className="text-slate-600 leading-relaxed">
                Download the PDF and visit the training center links. These are official institutes where you can get certified and start your job journey or sports career.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FINAL ACTION SECTION */}
      <div className={`mt-24 p-12 md:p-20 bg-${themeColor}-600 rounded-[4rem] shadow-2xl text-center text-white relative overflow-hidden animate-fadeInUp`}>
        <div className="relative z-10">
          <h3 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">Your Path is Ready.</h3>
          <p className="text-${themeColor}-100 max-w-3xl mx-auto mb-16 text-xl md:text-2xl leading-relaxed opacity-90 font-medium">
            Download your personalized <strong>AURA SKILL</strong> strategic profile now. This roadmap aligns your unique talent with India's official NCVET standards.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <button 
              onClick={handleExportPDF} 
              disabled={isExporting}
              className="group bg-white text-slate-900 font-black py-7 px-14 rounded-[2.5rem] hover:bg-slate-100 transition-all shadow-2xl flex items-center gap-5 active:scale-95 disabled:opacity-75 ring-8 ring-white/10"
            >
              {isExporting ? <span className="animate-pulse flex items-center gap-3">Building Profile...</span> : (
                <><DownloadIcon className="h-10 w-10 transition-transform group-hover:translate-y-2" /><span className="text-2xl">Download Report (PDF)</span></>
              )}
            </button>
            
            <button 
              onClick={onReset} 
              className="bg-transparent text-white border-4 border-white/30 font-black py-7 px-14 rounded-[2.5rem] hover:bg-white/10 transition-all active:scale-95 flex items-center gap-5 group"
            >
              <svg className="w-10 h-10 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span className="text-2xl">Start New Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Persistent Floating Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl bg-white/95 backdrop-blur-3xl border border-slate-200 rounded-[3rem] p-4 md:p-5 z-[100] flex items-center justify-between gap-4 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] animate-fadeInUp ring-1 ring-black/5">
        <button onClick={onReset} className="p-5 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100 group" title="New Roadmap">
          <svg className="w-7 h-7 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>

        <button onClick={handleExportPDF} disabled={isExporting} className={`flex-1 ${isSports ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-300' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-300'} text-white font-black py-5 px-8 rounded-[2.5rem] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 group relative overflow-hidden`}>
          {isExporting ? <span className="animate-pulse">Generating PDF...</span> : (
            <><DownloadIcon className="h-7 w-7 transition-transform group-hover:translate-y-1" /> <span className="hidden sm:inline">Save Strategic Profile</span><span className="inline sm:hidden">Save PDF</span></>
          )}
        </button>
        
        <button onClick={handleNativeShare} className="p-5 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100" title="Share Pathway">
          <ShareIcon className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
};

export default PathwayDisplay;