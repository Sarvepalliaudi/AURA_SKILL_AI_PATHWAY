
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18M5.468 12.012A9.004 9.004 0 0112 3.012a9.004 9.004 0 016.532 8.999 9.004 9.004 0 01-6.532 9.001 9.004 9.004 0 01-6.532-9" />
        </svg>
        <h1 className="text-2xl font-bold text-slate-800">
          NCVET AI Pathfinder
        </h1>
      </div>
    </header>
  );
};

export default Header;
