import type { ProcessedText, Word, Syllable } from '../types';

// Vowels for Russian, German, and English (case-insensitive)
const ALL_VOWELS = /[аеёиоуыэюяaeiouyäöü]/i;

/**
 * A heuristic-based algorithm to split a single word into syllables.
 * This is not linguistically perfect but provides a reasonable approximation
 * for children's reading assistance across multiple languages.
 * @param word The word to syllabify (should not contain punctuation).
 * @returns The word with syllables separated by hyphens.
 */
function syllabifyWord(word: string): string {
    // Don't split short words or words with fewer than two vowel sounds.
    const vowelGroups = word.match(new RegExp(ALL_VOWELS.source, 'gi'));
    if (!vowelGroups || vowelGroups.length < 2) {
        return word;
    }

    const chars = word.split('');
    const syllableBreaks = new Set<number>();
    let lastVowelGroupEnd = -1;

    for (let i = 0; i < chars.length; i++) {
        if (ALL_VOWELS.test(chars[i])) {
            const vowelGroupStart = i;
            // Find the end of the current vowel group
            while (i + 1 < chars.length && ALL_VOWELS.test(chars[i + 1])) {
                i++;
            }
            const vowelGroupEnd = i;

            if (lastVowelGroupEnd !== -1) {
                const consonantsBetween = vowelGroupStart - lastVowelGroupEnd - 1;

                if (consonantsBetween === 1) {
                    // V-CV pattern: split before the consonant
                    syllableBreaks.add(vowelGroupStart - 1);
                } else if (consonantsBetween >= 2) {
                    // VC-CV or VC-CCV pattern: split after the first consonant
                    syllableBreaks.add(lastVowelGroupEnd + 2);
                }
            }
            lastVowelGroupEnd = vowelGroupEnd;
        }
    }

    if (syllableBreaks.size === 0) {
        return word;
    }

    let result = '';
    let lastBreak = 0;
    const sortedBreaks = Array.from(syllableBreaks).sort((a, b) => a - b);
    
    for (const breakIndex of sortedBreaks) {
        if (breakIndex > lastBreak && breakIndex < word.length) {
            result += word.substring(lastBreak, breakIndex) + '-';
            lastBreak = breakIndex;
        }
    }
    result += word.substring(lastBreak);
    return result;
}

/**
 * Takes a raw string, capitalizes it, and splits each word into syllables.
 * @param text The raw input text.
 * @returns A single string with words syllabified, ready for parsing.
 */
function localSyllabifyAndFormat(text: string): string {
    const upperCaseText = text.toUpperCase();
    const parts = upperCaseText.split(/(\s+)/); // Split on whitespace, keeping it

    return parts.map(part => {
        if (/^\s+$/.test(part) || part === '') {
            return part; // It's whitespace, keep it.
        }
        
        // Separate word from trailing punctuation
        const match = part.match(/^([A-ZА-ЯÄÖÜ]+)([^A-ZА-ЯÄÖÜ]*)$/);
        if (match) {
            const [, word, punctuation] = match;
            return syllabifyWord(word) + punctuation;
        }
        return part; // Return as-is if no match (e.g., pure punctuation)
    }).join('');
}


function parseSyllabifiedString(syllabifiedString: string): ProcessedText {
    const words = syllabifiedString.split(/\s+/).filter(w => w);
  
    return words.map((wordStr, wordIndex) => {
        const syllableStrings = wordStr.split('-').filter(s => s);
        const syllables: Syllable[] = syllableStrings.map((syllableStr, syllableIndex) => ({
            text: syllableStr,
            id: `syllable-${wordIndex}-${syllableIndex}`,
        }));

        const word: Word = {
            id: `word-${wordIndex}`,
            displayText: wordStr,
            syllables,
        };
        return word;
    });
}

/**
 * Processes a raw text string locally to convert it into the ProcessedText structure.
 * This function is now synchronous and does not make any network requests.
 * @param text The raw input text.
 * @returns A ProcessedText object.
 */
export function syllabifyText(text: string): ProcessedText {
    const processedString = localSyllabifyAndFormat(text);
    return parseSyllabifiedString(processedString);
}
