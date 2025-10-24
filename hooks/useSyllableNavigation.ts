
import { useState, useMemo, useCallback } from 'react';
import type { ProcessedText, CurrentPosition } from '../types';

export function useSyllableNavigation(processedText: ProcessedText) {
  const [currentPosition, setCurrentPosition] = useState<CurrentPosition>({ wordIndex: 0, syllableIndex: 0 });

  const totalSyllablesInWords = useMemo(() => 
    processedText.map(word => word.syllables.length), 
    [processedText]
  );
  
  const { currentWord, currentSyllable } = useMemo(() => {
    const word = processedText[currentPosition.wordIndex];
    if (!word) return { currentWord: null, currentSyllable: null };
    const syllable = word.syllables[currentPosition.syllableIndex];
    return { currentWord: word, currentSyllable: syllable };
  }, [processedText, currentPosition]);

  const nextSyllable = useCallback(() => {
    setCurrentPosition(prev => {
      const currentWordSyllableCount = totalSyllablesInWords[prev.wordIndex];
      if (prev.syllableIndex < currentWordSyllableCount - 1) {
        // Move to next syllable in the same word
        return { ...prev, syllableIndex: prev.syllableIndex + 1 };
      } else if (prev.wordIndex < processedText.length - 1) {
        // Move to the first syllable of the next word
        return { wordIndex: prev.wordIndex + 1, syllableIndex: 0 };
      }
      // Already at the last syllable of the last word
      return prev;
    });
  }, [processedText, totalSyllablesInWords]);

  const prevSyllable = useCallback(() => {
    setCurrentPosition(prev => {
      if (prev.syllableIndex > 0) {
        // Move to previous syllable in the same word
        return { ...prev, syllableIndex: prev.syllableIndex - 1 };
      } else if (prev.wordIndex > 0) {
        // Move to the last syllable of the previous word
        const prevWordIndex = prev.wordIndex - 1;
        const lastSyllableIndex = totalSyllablesInWords[prevWordIndex] - 1;
        return { wordIndex: prevWordIndex, syllableIndex: lastSyllableIndex };
      }
      // Already at the first syllable of the first word
      return prev;
    });
  }, [totalSyllablesInWords]);
  
  return {
    currentPosition,
    nextSyllable,
    prevSyllable,
    currentWord,
    currentSyllable
  };
}
