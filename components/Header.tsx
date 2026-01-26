import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-indigo-600 p-1.5 md:p-2 rounded-lg mr-3 shadow-lg shadow-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18M5.468 12.012A9.004 9.004 0 0112 3.012a9.004 9.004 0 016.532 8.999 9.004 9.004 0 01-6.532 9.001 9.004 9.004 0 01-6.532-9" />
            </svg>
          </div>
          <h1 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">
            NCVET <span className="text-indigo-600">AI</span> Pathfinder
          </h1>
        </div>
        <div className="hidden md:block">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Vocational Intelligence</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
