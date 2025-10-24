import React, { useState, useCallback } from 'react';
import SetupScreen from './components/SetupScreen';
import ReadingScreen from './components/ReadingScreen';
import { syllabifyText } from './services/geminiService';
import type { ProcessedText } from './types';

type AppState = 'setup' | 'reading';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [processedText, setProcessedText] = useState<ProcessedText | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState<string>('Привет, как дела? Меня зовут Котёнок. Давай читать вместе!');

  const handleStartReading = useCallback((text: string) => {
    setIsLoading(true);
    setError(null);
    setRawText(text);

    // Using a timeout to ensure the loading spinner is visible for a moment,
    // providing better user feedback even for a fast synchronous operation.
    setTimeout(() => {
      try {
        const result = syllabifyText(text);
        setProcessedText(result);
        setAppState('reading');
      } catch (e) {
        setError('Could not process the text. An unexpected error occurred.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 50); // A small delay for UX
  }, []);

  const handleGoBack = useCallback(() => {
    setAppState('setup');
    setProcessedText(null);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-amber-50 font-sans text-slate-800">
      {appState === 'setup' && (
        <SetupScreen
          onStart={handleStartReading}
          isLoading={isLoading}
          error={error}
          initialText={rawText}
        />
      )}
      {appState === 'reading' && processedText && (
        <ReadingScreen processedText={processedText} onBack={handleGoBack} />
      )}
    </div>
  );
};

export default App;
