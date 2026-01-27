
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 mt-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
           <a href="https://sarvepalliaudi.github.io/asphenixnewprotofolio/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">Portfolio</a>
           <span className="text-slate-200">•</span>
           <a href="https://www.linkedin.com/in/audi-siva-bhanuvardhan-sarvepalli-4598a8289/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#0077B5] transition-colors">LinkedIn</a>
           <span className="text-slate-200">•</span>
           <a href="mailto:sarvepalliaudi@gmail.com" className="text-slate-400 hover:text-indigo-600 transition-colors">Feedback</a>
        </div>
        
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-2">Developed for the AURA SKILL - NCVET AI Challenge</p>
        <p className="text-slate-900 font-black text-sm">
          AUDI SIVA BHANUVARDHAN SARVEPALLI
        </p>
        <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto leading-relaxed">
          B.Tech CSE (Cybersecurity), School of Engineering and Technology, Dhanalakshmi Srinivasan University
        </p>
        
        <div className="mt-8 pt-8 border-t border-slate-50">
          <p className="text-slate-300 text-[10px] font-bold uppercase tracking-tighter">© 2024 AURA SKILL - NCVET AI Pathfinder • Asphenix Intelligence</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
