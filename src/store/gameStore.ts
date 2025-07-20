import { create } from 'zustand';
import { Game, Team, QuarterRecord } from '../types';
import * as Haptics from 'expo-haptics';

interface GameStore {
  currentGame: Game | null;
  
  // Game actions
  createGame: () => void;
  updateScore: (teamId: string, delta: number) => void;
  resetScores: () => void;
  resetCurrentQuarter: () => void;
  updateTeamName: (teamId: string, name: string) => void;
  updateTeamColor: (teamId: string, color: string) => void;
  
  // Timer actions
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  setTimer: (seconds: number) => void;
  updateTimer: (seconds: number) => void;
  
  // Quarter actions
  nextQuarter: () => void;
  previousQuarter: () => void;
  saveCurrentQuarter: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  currentGame: null,
  
  createGame: () => {
    const newGame: Game = {
      id: Date.now().toString(),
      teams: [
        { id: '1', name: 'Player1', score: 0, color: '#3B82F6' },
        { id: '2', name: 'Player2', score: 0, color: '#EF4444' },
      ],
      timerSeconds: 600, // 10 minutes default
      isTimerRunning: false,
      createdAt: new Date(),
      currentQuarter: 1,
      quarterRecords: [],
    };
    
    set({
      currentGame: newGame,
    });
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  
  
  updateScore: (teamId: string, delta: number) => {
    set((state) => {
      if (!state.currentGame) return state;
      
      const updatedTeams = state.currentGame.teams.map((team) => {
        if (team.id === teamId) {
          const newScore = Math.max(0, team.score + delta);
          if (newScore !== team.score) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          return { ...team, score: newScore };
        }
        return team;
      }) as [Team, Team];
      
      return {
        currentGame: {
          ...state.currentGame,
          teams: updatedTeams,
        },
      };
    });
  },
  
  resetScores: () => {
    set((state) => {
      if (!state.currentGame) return state;
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      const resetTeams = state.currentGame.teams.map((team) => ({
        ...team,
        score: 0,
      })) as [Team, Team];
      
      return {
        currentGame: {
          ...state.currentGame,
          teams: resetTeams,
          currentQuarter: 1,
          quarterRecords: [],
        },
      };
    });
  },
  
  resetCurrentQuarter: () => {
    set((state) => {
      if (!state.currentGame) return state;
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Simply reset scores to 0 for current quarter
      const resetTeams = state.currentGame.teams.map((team) => ({
        ...team,
        score: 0,
      })) as [Team, Team];
      
      return {
        currentGame: {
          ...state.currentGame,
          teams: resetTeams,
        },
      };
    });
  },
  
  updateTeamName: (teamId: string, name: string) => {
    set((state) => {
      if (!state.currentGame) return state;
      
      const updatedTeams = state.currentGame.teams.map((team) => {
        if (team.id === teamId) {
          return { ...team, name };
        }
        return team;
      }) as [Team, Team];
      
      return {
        currentGame: {
          ...state.currentGame,
          teams: updatedTeams,
        },
      };
    });
  },
  
  updateTeamColor: (teamId: string, color: string) => {
    set((state) => {
      if (!state.currentGame) return state;
      
      const updatedTeams = state.currentGame.teams.map((team) => {
        if (team.id === teamId) {
          return { ...team, color };
        }
        return team;
      }) as [Team, Team];
      
      return {
        currentGame: {
          ...state.currentGame,
          teams: updatedTeams,
        },
      };
    });
  },
  
  startTimer: () => {
    set((state) => {
      if (!state.currentGame) return state;
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      return {
        currentGame: {
          ...state.currentGame,
          isTimerRunning: true,
        },
      };
    });
  },
  
  stopTimer: () => {
    set((state) => {
      if (!state.currentGame) return state;
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      return {
        currentGame: {
          ...state.currentGame,
          isTimerRunning: false,
        },
      };
    });
  },
  
  resetTimer: () => {
    set((state) => {
      if (!state.currentGame) return state;
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      return {
        currentGame: {
          ...state.currentGame,
          timerSeconds: 600,
          isTimerRunning: false,
        },
      };
    });
  },
  
  setTimer: (seconds: number) => {
    set((state) => {
      if (!state.currentGame) return state;
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      return {
        currentGame: {
          ...state.currentGame,
          timerSeconds: seconds,
          isTimerRunning: false,
        },
      };
    });
  },
  
  updateTimer: (seconds: number) => {
    set((state) => {
      if (!state.currentGame) return state;
      
      return {
        currentGame: {
          ...state.currentGame,
          timerSeconds: seconds,
        },
      };
    });
  },
  
  
  nextQuarter: () => {
    set((state) => {
      if (!state.currentGame) return state;
      
      const nextQuarter = Math.min(state.currentGame.currentQuarter + 1, 9);
      
      if (nextQuarter !== state.currentGame.currentQuarter) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Save current quarter record with the scores and colors for this quarter only
        const currentQuarterRecord: QuarterRecord = {
          quarter: state.currentGame.currentQuarter,
          teamScores: {
            [state.currentGame.teams[0].id]: state.currentGame.teams[0].score,
            [state.currentGame.teams[1].id]: state.currentGame.teams[1].score,
          },
          teamColors: {
            [state.currentGame.teams[0].id]: state.currentGame.teams[0].color,
            [state.currentGame.teams[1].id]: state.currentGame.teams[1].color,
          },
        };
        
        // Update or add quarter record
        const updatedRecords = [...state.currentGame.quarterRecords];
        const existingIndex = updatedRecords.findIndex(r => r.quarter === state.currentGame!.currentQuarter);
        
        if (existingIndex >= 0) {
          updatedRecords[existingIndex] = currentQuarterRecord;
        } else {
          updatedRecords.push(currentQuarterRecord);
        }
        
        // Ensure all existing records have teamColors (migration)
        updatedRecords.forEach(record => {
          if (!record.teamColors) {
            record.teamColors = {
              [state.currentGame!.teams[0].id]: state.currentGame!.teams[0].color,
              [state.currentGame!.teams[1].id]: state.currentGame!.teams[1].color,
            };
          }
        });
        
        // Check if the target quarter already has saved scores
        const targetQuarterRecord = updatedRecords.find(r => r.quarter === nextQuarter);
        
        const newTeams = state.currentGame.teams.map((team) => ({
          ...team,
          score: targetQuarterRecord?.teamScores?.[team.id] || 0,
        })) as [Team, Team];
        
        return {
          currentGame: {
            ...state.currentGame,
            teams: newTeams,
            currentQuarter: nextQuarter,
            quarterRecords: updatedRecords,
          },
        };
      }
      
      return state;
    });
  },
  
  previousQuarter: () => {
    set((state) => {
      if (!state.currentGame) return state;
      
      const previousQuarter = Math.max(state.currentGame.currentQuarter - 1, 1);
      
      if (previousQuarter !== state.currentGame.currentQuarter) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Save current quarter record before going back
        const currentQuarterRecord: QuarterRecord = {
          quarter: state.currentGame.currentQuarter,
          teamScores: {
            [state.currentGame.teams[0].id]: state.currentGame.teams[0].score,
            [state.currentGame.teams[1].id]: state.currentGame.teams[1].score,
          },
          teamColors: {
            [state.currentGame.teams[0].id]: state.currentGame.teams[0].color,
            [state.currentGame.teams[1].id]: state.currentGame.teams[1].color,
          },
        };
        
        // Update or add quarter record
        const updatedRecords = [...state.currentGame.quarterRecords];
        const existingIndex = updatedRecords.findIndex(r => r.quarter === state.currentGame!.currentQuarter);
        
        if (existingIndex >= 0) {
          updatedRecords[existingIndex] = currentQuarterRecord;
        } else {
          updatedRecords.push(currentQuarterRecord);
        }
        
        // Ensure all existing records have teamColors (migration)
        updatedRecords.forEach(record => {
          if (!record.teamColors) {
            record.teamColors = {
              [state.currentGame!.teams[0].id]: state.currentGame!.teams[0].color,
              [state.currentGame!.teams[1].id]: state.currentGame!.teams[1].color,
            };
          }
        });
        
        // Load the target quarter's scores (if any)
        const targetQuarterRecord = updatedRecords.find(r => r.quarter === previousQuarter);
        
        const restoredTeams = state.currentGame.teams.map((team) => ({
          ...team,
          score: targetQuarterRecord?.teamScores?.[team.id] || 0,
        })) as [Team, Team];
        
        return {
          currentGame: {
            ...state.currentGame,
            teams: restoredTeams,
            currentQuarter: previousQuarter,
            quarterRecords: updatedRecords,
          },
        };
      }
      
      return state;
    });
  },

  saveCurrentQuarter: () => {
    set((state) => {
      if (!state.currentGame) return state;
      
      // Save current quarter record
      const currentQuarterRecord: QuarterRecord = {
        quarter: state.currentGame.currentQuarter,
        teamScores: {
          [state.currentGame.teams[0].id]: state.currentGame.teams[0].score,
          [state.currentGame.teams[1].id]: state.currentGame.teams[1].score,
        },
        teamColors: {
          [state.currentGame.teams[0].id]: state.currentGame.teams[0].color,
          [state.currentGame.teams[1].id]: state.currentGame.teams[1].color,
        },
      };
      
      // Update or add quarter record
      const updatedRecords = [...state.currentGame.quarterRecords];
      const existingIndex = updatedRecords.findIndex(r => r.quarter === state.currentGame!.currentQuarter);
      
      if (existingIndex >= 0) {
        updatedRecords[existingIndex] = currentQuarterRecord;
      } else {
        updatedRecords.push(currentQuarterRecord);
      }
      
      // Ensure all existing records have teamColors (migration)
      updatedRecords.forEach(record => {
        if (!record.teamColors) {
          record.teamColors = {
            [state.currentGame!.teams[0].id]: state.currentGame!.teams[0].color,
            [state.currentGame!.teams[1].id]: state.currentGame!.teams[1].color,
          };
        }
      });
      
      return {
        currentGame: {
          ...state.currentGame,
          quarterRecords: updatedRecords,
        },
      };
    });
  },
}));