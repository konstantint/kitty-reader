import React, { useEffect, useRef } from 'react';
import type { ProcessedText } from '../types';
import { useSyllableNavigation } from '../hooks/useSyllableNavigation';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface ReadingScreenProps {
  processedText: ProcessedText;
  onBack: () => void;
}

const ReadingScreen: React.FC<ReadingScreenProps> = ({ processedText, onBack }) => {
  const { currentSyllable, nextSyllable, prevSyllable, currentWord } = useSyllableNavigation(processedText);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const syllableRefs = useRef<Map<string, HTMLSpanElement>>(new Map());
  const kittyRef = useRef<HTMLDivElement>(null);
  const prevPositionRef = useRef<{ top: number; left: number } | null>(null);

  useEffect(() => {
    wordRefs.current.clear();
    syllableRefs.current.clear();
    prevPositionRef.current = null; // Reset position on new text
  }, [processedText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextSyllable();
      } else if (e.key === 'ArrowLeft') {
        prevSyllable();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSyllable, prevSyllable]);
  
  // Effect for scrolling the word into view
  useEffect(() => {
    if (currentWord) {
      const wordEl = wordRefs.current.get(currentWord.id);
      wordEl?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [currentWord]);

  // Effect for positioning and animating the kitty
  useEffect(() => {
    if (!currentSyllable || !currentWord || !kittyRef.current) {
      return;
    }

    const kittyEl = kittyRef.current;
    const syllableEl = syllableRefs.current.get(currentSyllable.id);
    const wordEl = wordRefs.current.get(currentWord.id);

    if (syllableEl && wordEl) {
      const kittyWidth = kittyEl.offsetWidth || 48; // Use measured width or fallback to 48px (approx for text-5xl)
      
      // Correctly calculate position by combining word and syllable offsets
      const targetLeft = wordEl.offsetLeft + syllableEl.offsetLeft + (syllableEl.offsetWidth / 2) - (kittyWidth / 2);
      const targetTop = wordEl.offsetTop + syllableEl.offsetTop - 50; // 50px above the syllable

      const startPosition = prevPositionRef.current;
      
      // Update previous position for the next animation cycle
      prevPositionRef.current = { top: targetTop, left: targetLeft };

      if (startPosition) {
        // A smaller jump for adjacent syllables, a bigger one for words far apart
        const jumpHeight = Math.min(60, 20 + Math.abs(targetLeft - startPosition.left) * 0.1);
        
        kittyEl.animate([
          { transform: `translate(${startPosition.left}px, ${startPosition.top}px)`, opacity: 1 },
          { transform: `translate(${(startPosition.left + targetLeft) / 2}px, ${targetTop - jumpHeight}px)`, offset: 0.5, opacity: 1 },
          { transform: `translate(${targetLeft}px, ${targetTop}px)`, opacity: 1 }
        ], {
          duration: 400,
          easing: 'cubic-bezier(0.45, 0, 0.55, 1)', // A standard ease-in-out curve
          fill: 'forwards' // Persist the final state of the animation
        });
      } else {
        // First render, just appear without animation.
        kittyEl.style.transform = `translate(${targetLeft}px, ${targetTop}px)`;
        kittyEl.style.opacity = '1';
      }
    }
  }, [currentSyllable, currentWord]);
  
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <button onClick={onBack} className="absolute top-4 left-4 z-20 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-amber-100 transition-colors">
        <ArrowLeftIcon className="h-6 w-6 text-slate-600" />
      </button>

      <div 
        ref={scrollContainerRef}
        className="relative w-full flex items-center justify-start overflow-x-auto overflow-y-hidden whitespace-nowrap px-10 py-20 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none' }}
      >
        {/* Padding to center the first and last words */}
        <div className="flex-shrink-0 w-1/2"></div>
        {processedText.map((word) => (
          <div
            key={word.id}
            ref={el => {
              if (el) {
                wordRefs.current.set(word.id, el);
              } else {
                wordRefs.current.delete(word.id);
              }
            }}
            className={`relative mx-4 transition-all duration-500 ease-in-out p-4 rounded-2xl ${word.id === currentWord?.id ? 'bg-amber-200/80' : 'bg-transparent'}`}
          >
            <h2 className="text-8xl font-bold tracking-widest text-slate-700">
              {word.syllables.map((syllable, index) => (
                <span
                  key={syllable.id}
                  ref={el => {
                    if (el) {
                      syllableRefs.current.set(syllable.id, el);
                    } else {
                      syllableRefs.current.delete(syllable.id);
                    }
                  }}
                  className="inline-block"
                >
                  {syllable.text}
                  {(index < word.syllables.length - 1) && <span className="text-amber-400">-</span>}
                </span>
              ))}
            </h2>
          </div>
        ))}
        <div className="flex-shrink-0 w-1/2"></div>
        
        {/* Kitty is now the last child to ensure it's rendered on top */}
        <div 
          ref={kittyRef}
          className="absolute text-5xl"
          style={{ 
            opacity: 0,
            zIndex: 20, // Explicitly higher z-index
            willChange: 'transform',
            top: 0,
            left: 0,
            pointerEvents: 'none', // Prevent kitty from blocking mouse events
          }}
          >
          🐱
        </div>
      </div>

      <div className="absolute bottom-8 text-slate-500 text-xl flex items-center gap-3">
        Use
        <button
          onClick={prevSyllable}
          className="px-5 py-2 text-3xl font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-200 active:scale-95 transition-transform"
          aria-label="Previous syllable"
        >
          ←
        </button>
        &
        <button
          onClick={nextSyllable}
          className="px-5 py-2 text-3xl font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-200 active:scale-95 transition-transform"
          aria-label="Next syllable"
        >
          →
        </button>
        keys or buttons to read.
      </div>
    </div>
  );
};

export default ReadingScreen;