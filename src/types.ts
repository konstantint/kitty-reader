
export interface Syllable {
  text: string;
  id: string; // e.g., syllable-0-1 (wordIndex-syllableIndex)
}

export interface Word {
  id: string; // e.g., word-0
  displayText: string; // The full word with dashes, e.g., "ПРИ-ВЕТ,"
  syllables: Syllable[];
}

export type ProcessedText = Word[];

export interface CurrentPosition {
  wordIndex: number;
  syllableIndex: number;
}