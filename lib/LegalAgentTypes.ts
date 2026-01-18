
/**
 * Typer för den interaktiva AI-agenten, baserade på FMJAM-konceptet.
 */

export interface Fact {
  id: string;
  category: string; // En nyckelterm som kan matchas mot lagtext
  description: string;
};

export interface LegalReference {
  id: string;
  title: string;
  text: string; // All lagtext för en källa, konsoliderad
};

export interface Contradiction {
  description: string;
  factIds: string[];
};

export interface Case {
  id: string;
  facts: Fact[];
  contradictions: Contradiction[];
};
