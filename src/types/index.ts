export interface Team {
  id: string;
  name: string;
  score: number;
  color: string;
}

export interface QuarterRecord {
  quarter: number;
  teamScores: {
    [teamId: string]: number;
  };
  teamColors: {
    [teamId: string]: string;
  };
}

export interface Game {
  id: string;
  teams: [Team, Team];
  timerSeconds: number;
  isTimerRunning: boolean;
  createdAt: Date;
  currentQuarter: number;
  quarterRecords: QuarterRecord[];
}

export interface AppState {
  currentGame: Game | null;
}