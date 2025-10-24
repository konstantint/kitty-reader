
import React, { useState } from 'react';
import { CatIcon } from './icons/CatIcon';

interface SetupScreenProps {
  onStart: (text: string) => void;
  isLoading: boolean;
  error: string | null;
  initialText: string;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, isLoading, error, initialText }) => {
  const [text, setText] = useState<string>(initialText);

  const handleStartClick = () => {
    if (text.trim() && !isLoading) {
      onStart(text);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-amber-200">
      <div className="flex items-center gap-4 mb-6">
        <CatIcon className="h-16 w-16 text-amber-500" />
        <h1 className="text-5xl font-bold text-slate-700 tracking-tight">Kitty Reader</h1>
      </div>
      <p className="text-slate-500 mb-8 text-center">Paste a story below and press "Start Reading" to begin the adventure!</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-48 p-4 border-2 border-amber-300 rounded-xl focus:ring-4 focus:ring-amber-200 focus:border-amber-400 outline-none transition duration-300 ease-in-out text-lg resize-none"
        placeholder="Once upon a time..."
      />
      
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      <button
        onClick={handleStartClick}
        disabled={isLoading || !text.trim()}
        className="mt-8 w-full max-w-sm flex items-center justify-center px-8 py-4 bg-amber-500 text-white font-bold text-2xl rounded-full shadow-lg hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-amber-300"
      >
        {isLoading ? (
          <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          "Start Reading"
        )}
      </button>
    </div>
  );
};

export default SetupScreen;
