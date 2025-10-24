
import { GoogleGenAI } from "@google/genai";
import type { ProcessedText, Word, Syllable } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a placeholder check. The environment is expected to have the API key.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function syllabifyText(text: string): Promise<ProcessedText> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Take the following text, convert it to all uppercase, and then split each word into syllables separated by a hyphen '-'. Punctuation should be kept with its word, and words separated by newline should be kept on separate lines. For example, 'Привет, как дела?' should become 'ПРИ-ВЕТ, КАК ДЕ-ЛА?'. The text to process is: "${text}"`,
    });

    const processedString = response.text.trim();
    return parseSyllabifiedString(processedString);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to syllabify text with Gemini API.");
  }
}

function parseSyllabifiedString(syllabifiedString: string): ProcessedText {
  const words = syllabifiedString.split(/\s+/);
  
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
