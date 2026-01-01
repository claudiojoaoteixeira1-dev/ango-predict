export interface PredictionResult {
  prediction: string;
  confidence: number;
  multiplier?: string; // For Crash/Aviator games
  slangQuote: string; // A funny Angolan phrase
  color: 'red' | 'green' | 'yellow';
  timestamp: string;
  platform: string; // The betting platform (e.g., Premier Bet, Elephant Bet)
  serverSeed: string; // The fake Provably Fair hash
}

export enum AppMode {
  HOME = 'HOME',
  AVIATOR = 'AVIATOR', // Specific mode for "Velas"
  ORACLE = 'ORACLE', // General questions
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string | PredictionResult;
  timestamp: number;
}