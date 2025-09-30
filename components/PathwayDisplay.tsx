import React, { useState } from 'react';
import { LearnerProfile, TrainingPathway, PathwayStep } from '../types';
import { PathwayStepIcon, ShareIcon, DownloadIcon, SparklesIcon } from './IconComponents';
import jsPDF from 'jspdf';

interface PathwayDisplayProps {
  pathway: TrainingPathway;
  profile: LearnerProfile;
  onReset: () => void;
}

// Helper to give each step type a unique visual appearance
const getAppearanceForType = (type: PathwayStep['type']) => {
  switch (type) {
    case 'Course':
      return { bgColor: 'bg-indigo-100', iconColor: 'text-indigo-600' };
    case 'Certification':
      return { bgColor: 'bg-emerald-100', iconColor: 'text-emerald-600' };
    case 'On-the-Job Training':
      return { bgColor: 'bg-sky-100', iconColor: 'text-sky-600' };
    case 'Apprenticeship':
      return { bgColor: 'bg-amber-100', iconColor: 'text-amber-600' };
    case 'Internship':
      return { bgColor: 'bg-violet-100', iconColor: 'text-violet-600' };
    case 'Workshop':
      return { bgColor: 'bg-rose-100', iconColor: 'text-rose-600' };
    case 'Online Module':
      return { bgColor: 'bg-cyan-100', iconColor: 'text-cyan-600' };
    case 'Micro-credential':
      return { bgColor: 'bg-pink-100', iconColor: 'text-pink-600' };
    case 'Assessment':
      return { bgColor: 'bg-slate-200', iconColor: 'text-slate-600' };
    default:
      return { bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
  }
};


const PathwayDisplay: React.FC<PathwayDisplayProps> = ({ pathway, profile, onReset }) => {
  const [shareStatus, setShareStatus] = useState('Share');
  const [isExporting, setIsExporting] = useState(false);

  const handleShare = async () => {
    const shareText = `
Check out my personalized career pathway from NCVET AI Pathfinder!

👤 For: ${profile.name}
🎯 Recommended Role: ${pathway.recommendedRole}

📝 Summary: ${pathway.summary}

🗺️ My Step-by-Step Journey:
${pathway.pathway.map(step => `${step.step}. ${step.title}`).join('\n')}

Powered by NCVET AI Pathfinder.
    `.trim();

    try {
      if (navigator.share) {
        await navigator.share({
          title: `My Career Pathway to become a ${pathway.recommendedRole}`,
          text: shareText,
        });
        setShareStatus('Shared!');
      } else {
        await navigator.clipboard.writeText(shareText);
        setShareStatus('Copied!');
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      setShareStatus('Failed');
    }

    setTimeout(() => {
      setShareStatus('Share');
    }, 2500);
  };

  const handleExportPDF = async () => {
    if (!profile) return;
    setIsExporting(true);
  
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      let y = margin;
  
      const addPageIfNeeded = (requiredHeight: number) => {
        if (y + requiredHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };
  
      // --- Document Header ---
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#1e293b'); // slate-800
      doc.text("Your Personalized Pathway to Success", margin, y);
      y += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#475569'); // slate-600
      doc.text(`Generated for: ${profile.name}`, margin, y);
      y += 15;
  
      // --- Recommended Role Card ---
      const roleSummaryLines = doc.splitTextToSize(pathway.summary, contentWidth - 10);
      const roleCardHeight = 20 + (roleSummaryLines.length * 5);
      addPageIfNeeded(roleCardHeight);
      doc.setFillColor('#eef2ff'); // indigo-50
      doc.setDrawColor('#a5b4fc'); // indigo-300
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, roleCardHeight, 'FD'); // Fill and Draw
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#3730a3'); // indigo-800
      doc.text(pathway.recommendedRole, margin + 5, y + 10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#4338ca'); // indigo-700
      doc.text(roleSummaryLines, margin + 5, y + 18);
      y += roleCardHeight + 10;
  
      // --- Skills Feedback Card ---
      const skillsFeedbackLines = doc.splitTextToSize(pathway.skillsFeedback, contentWidth - 10);
      const skillsCardHeight = 15 + (skillsFeedbackLines.length * 5);
      addPageIfNeeded(skillsCardHeight);
      doc.setFillColor('#fffbeb'); // amber-50
      doc.setDrawColor('#fcd34d'); // amber-300
      doc.rect(margin, y, contentWidth, skillsCardHeight, 'FD');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#92400e'); // amber-800
      doc.text("A Note on Your Skills", margin + 5, y + 8);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#b45309'); // amber-700
      doc.text(skillsFeedbackLines, margin + 5, y + 15);
      y += skillsCardHeight + 15;
  
      // --- Step-by-Step Journey Header ---
      addPageIfNeeded(20);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#1e293b'); // slate-800
      doc.text("Your Step-by-Step Journey", margin, y);
      y += 12;
  
      const typeColors = {
        'Course': '#6366f1', 'Certification': '#10b981', 'On-the-Job Training': '#06b6d4',
        'Apprenticeship': '#f59e0b', 'Internship': '#8b5cf6', 'Workshop': '#ec4899',
        'Online Module': '#22d3ee', 'Micro-credential': '#f472b6', 'Assessment': '#64748b',
      };
      
      let lastY = y;
      pathway.pathway.forEach((step, index) => {
        const descriptionLines = doc.splitTextToSize(step.description, contentWidth - 25);
        let relevantSkillsHeight = 0;
        let skillsLines: string[] = [];
        if (step.relevantSkills && step.relevantSkills.length > 0) {
          const skillsText = `Builds on your skills: ${step.relevantSkills.join(', ')}`;
          skillsLines = doc.splitTextToSize(skillsText, contentWidth - 25);
          relevantSkillsHeight = 8 + (skillsLines.length * 5);
        }
        const stepHeight = 20 + (descriptionLines.length * 5) + relevantSkillsHeight;
  
        addPageIfNeeded(stepHeight);
        const stepYStart = y;
  
        // --- Step Content ---
        const textX = margin + 15;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#1e293b');
        doc.text(`${step.step}. ${step.title}`, textX, y + 5);
  
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#475569');
        doc.text(`Duration: ${step.duration} | NSQF: ${step.nsqfLevel}`, textX, y + 10);
  
        y += 15;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#334155');
        doc.text(descriptionLines, textX, y);
        y += descriptionLines.length * 5;
  
        if (skillsLines.length > 0) {
          y += 4;
          doc.setFont('helvetica', 'italic');
          doc.setTextColor('#115e59'); // teal-800
          doc.text(skillsLines, textX, y);
          y += skillsLines.length * 5;
        }
  
        // --- Timeline Graphics ---
        const circleY = stepYStart + 6;
        const iconColor = typeColors[step.type as keyof typeof typeColors] || '#818cf8';
        doc.setFillColor(iconColor);
        doc.setDrawColor(iconColor);
        doc.circle(margin + 5, circleY, 4, 'FD');
  
        // Draw connecting line after we know the full height
        if (index > 0) {
            doc.setDrawColor('#cbd5e1'); // slate-300
            doc.setLineWidth(0.5);
            doc.line(margin + 5, lastY, margin + 5, circleY);
        }
        lastY = circleY;
        
        y += 10; // Spacing after the step
      });
  
      const fileName = `career-pathway-${profile.name.toLowerCase().replace(/\s/g, '-')}.pdf`;
      doc.save(fileName);
  
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="space-y-8 animate-fadeIn">
      {/* This div is now only for web display, not for PDF export */}
      <div>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <h2 className="text-3xl font-bold text-slate-800">Your Personalized Pathway to Success</h2>
          <p className="mt-2 text-slate-500">
            Hello, <span className="font-semibold">{profile.name}</span>! Here is the vocational training plan our AI has crafted just for you.
          </p>

          <div className="mt-6 p-6 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg">
            <h3 className="text-2xl font-bold text-indigo-800">{pathway.recommendedRole}</h3>
            <p className="mt-2 text-lg text-indigo-700 leading-relaxed">{pathway.summary}</p>
          </div>

          <div className="mt-6 p-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
              <h3 className="text-xl font-semibold text-amber-800">A Note on Your Skills</h3>
              <p className="mt-2 text-amber-700 leading-relaxed">{pathway.skillsFeedback}</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 px-4">Your Step-by-Step Journey</h3>
          <div className="relative pl-4">
            {/* Vertical line through the timeline */}
            <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-slate-300" style={{ transform: 'translateX(-50%)' }}></div>
            
            <div className="space-y-8">
              {pathway.pathway.map((step, index) => {
                const appearance = getAppearanceForType(step.type);
                return (
                  <div 
                    key={step.step} 
                    className="relative flex items-start space-x-6 animate-fadeInUp"
                    style={{ animationDelay: `${index * 150}ms`, opacity: 0 }} // Staggered animation
                  >
                    {/* Icon on the timeline with tooltip */}
                    <div className="relative flex-shrink-0 group">
                      <div className={`flex-shrink-0 ${appearance.bgColor} rounded-full h-12 w-12 flex items-center justify-center z-10 ring-8 ring-slate-50`}>
                          <PathwayStepIcon type={step.type} className={`h-6 w-6 ${appearance.iconColor}`} />
                      </div>
                      <span className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-slate-700 text-white text-xs font-semibold rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 invisible group-hover:visible z-20">
                          {step.type}
                      </span>
                    </div>

                    {/* Content card */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                              <p className={`text-sm font-semibold ${appearance.iconColor} uppercase tracking-wide`}>{step.type}</p>
                              <h3 className="text-xl font-bold text-slate-800">{step.step}. {step.title}</h3>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                              <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">{step.duration}</span>
                              <span className="mt-1 block bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">NSQF: {step.nsqfLevel}</span>
                          </div>
                        </div>
                        <p className="text-slate-600">{step.description}</p>
                        
                        {/* Relevant Skills Section */}
                        {step.relevantSkills && step.relevantSkills.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                              <div className="flex items-center gap-2 text-sm font-semibold text-teal-700">
                                  <SparklesIcon className="h-5 w-5 text-teal-500" />
                                  <span>Builds on your existing skills:</span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                  {step.relevantSkills.map((skill, i) => (
                                      <span key={i} className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-1 rounded-full">
                                          {skill}
                                      </span>
                                  ))}
                              </div>
                          </div>
                        )}
                    </div>
                  </div>
                )})}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 bg-gray-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors duration-300 w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isExporting ? 'Exporting...' : (
            <>
              <DownloadIcon className="h-5 w-5" />
              Export as PDF
            </>
          )}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-slate-700 transition-colors duration-300 w-full sm:w-auto"
        >
          <ShareIcon className="h-5 w-5" />
          {shareStatus}
        </button>
        <button
          onClick={onReset}
          className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors duration-300 w-full sm:w-auto"
        >
          Start a New Plan
        </button>
      </div>
    </div>
  );
};

export default PathwayDisplay;