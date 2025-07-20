import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { Game } from '../types';

const getScreenDimensions = () => {
  try {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    return {
      screenWidth: screenWidth || 375,
      screenHeight: screenHeight || 667
    };
  } catch {
    return { screenWidth: 375, screenHeight: 667 };
  }
};

interface QuarterRecordsViewProps {
  game: Game;
  onClose: () => void;
}

export default function QuarterRecordsView({ game, onClose }: QuarterRecordsViewProps) {
  const { screenWidth, screenHeight } = getScreenDimensions();
  const getQuarterScore = (quarter: number, teamId: string): number => {
    const record = game.quarterRecords?.find(r => r.quarter === quarter);
    return record?.teamScores?.[teamId] || 0;
  };

  const getQuarterColor = (quarter: number, teamId: string): string => {
    const record = game.quarterRecords?.find(r => r.quarter === quarter);
    const color = record?.teamColors?.[teamId];
    if (color) {
      return color;
    }
    // Fallback to current team color if not stored
    return game.teams?.find(t => t.id === teamId)?.color || '#3B82F6';
  };
  
  const getCurrentQuarterScore = (teamId: string): number => {
    return game.teams?.find(t => t.id === teamId)?.score || 0;
  };
  
  const getTotalScore = (teamId: string): number => {
    let total = 0;
    
    // Add all completed quarter scores
    if (game.quarterRecords && Array.isArray(game.quarterRecords)) {
      game.quarterRecords.forEach(record => {
        total += record?.teamScores?.[teamId] || 0;
      });
    }
    
    // Add current quarter score if not already saved
    const currentQuarterSaved = game.quarterRecords?.some(r => r.quarter === game.currentQuarter) || false;
    if (!currentQuarterSaved) {
      total += game.teams?.find(t => t.id === teamId)?.score || 0;
    }
    
    return total;
  };

  const getQuarterWins = (teamId: string): number => {
    let wins = 0;
    
    // Check completed quarters
    if (game.quarterRecords && Array.isArray(game.quarterRecords)) {
      game.quarterRecords.forEach(record => {
        const team1Id = game.teams[0].id;
        const team2Id = game.teams[1].id;
        const team1Score = record?.teamScores?.[team1Id] || 0;
        const team2Score = record?.teamScores?.[team2Id] || 0;
        
        if (team1Score !== team2Score) { // No tie
          const winnerId = team1Score > team2Score ? team1Id : team2Id;
          if (winnerId === teamId) {
            wins++;
          }
        }
      });
    }
    
    // Check current quarter if not saved yet
    const currentQuarterSaved = game.quarterRecords?.some(r => r.quarter === game.currentQuarter) || false;
    if (!currentQuarterSaved) {
      const team1Score = game.teams[0].score;
      const team2Score = game.teams[1].score;
      
      if (team1Score !== team2Score) { // No tie
        const winnerId = team1Score > team2Score ? game.teams[0].id : game.teams[1].id;
        if (winnerId === teamId) {
          wins++;
        }
      }
    }
    
    return wins;
  };

  const isSmallScreen = screenWidth < 375 || screenHeight < 667;
  const isVerySmallScreen = screenWidth < 350;

  // Safety check for game data
  if (!game || !game.teams || game.teams.length < 2) {
    return null;
  }

  // Show all quarters 1-9
  const quartersToShow = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // If no quarters to show, show message (this should rarely happen now)
  if (quartersToShow.length === 0) {
    return (
      <TouchableOpacity 
        style={styles.container}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={[
            styles.content,
            isSmallScreen && styles.contentSmall,
            isVerySmallScreen && styles.contentVerySmall
          ]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={[
              styles.title,
              isSmallScreen && styles.titleSmall
            ]}>Quarter Records</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons 
                name="close" 
                size={isSmallScreen ? 20 : 24} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quarters with scores yet</Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container}
      activeOpacity={1}
      onPress={onClose}
    >
      <TouchableOpacity 
        style={[
          styles.content,
          isSmallScreen && styles.contentSmall,
          isVerySmallScreen && styles.contentVerySmall
        ]}
        activeOpacity={1}
        onPress={(e) => e.stopPropagation()}
      >
        <View style={styles.header}>
          <Text style={[
            styles.title,
            isSmallScreen && styles.titleSmall
          ]}>Quarter Records</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons 
              name="close" 
              size={isSmallScreen ? 20 : 24} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.teamColumn}>
              <Text style={styles.headerText}>Team</Text>
            </View>
            {quartersToShow.map((quarter) => (
              <View key={quarter} style={styles.quarterColumn}>
                <Text style={styles.headerText}>{quarter}Q</Text>
              </View>
            ))}
            <View style={styles.totalColumn}>
              <Text style={styles.headerText}>Total</Text>
            </View>
            <View style={styles.winsColumn}>
              <Text style={styles.headerText}>Wins</Text>
            </View>
          </View>
          
          {/* Table Body */}
          {game.teams.map((team) => (
            <View key={team.id} style={styles.tableRow}>
              <View style={styles.teamColumn}>
                <View style={styles.teamInfo}>
                  <View style={[styles.teamIndicator, { backgroundColor: getQuarterColor(game.currentQuarter, team.id) }]} />
                  <Text style={styles.teamNameText} numberOfLines={1}>
                    {team.name.length > 6 ? `${team.name.substring(0, 5)}...` : team.name}
                  </Text>
                </View>
              </View>
              {quartersToShow.map((quarter) => (
                <View key={quarter} style={styles.quarterColumn}>
                  <Text style={styles.scoreText}>
                    {quarter === game.currentQuarter 
                      ? getCurrentQuarterScore(team.id)
                      : getQuarterScore(quarter, team.id)}
                  </Text>
                </View>
              ))}
              <View style={styles.totalColumn}>
                <Text style={styles.totalScoreText}>{getTotalScore(team.id)}</Text>
              </View>
              <View style={styles.winsColumn}>
                <Text style={styles.winsText}>{getQuarterWins(team.id)}</Text>
              </View>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    position: 'absolute',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '75%',
    maxWidth: 700,
  },
  contentSmall: {
    width: '90%',
    padding: theme.spacing.md,
  },
  contentVerySmall: {
    width: '90%',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  titleSmall: {
    fontSize: 18,
  },
  tableContainer: {
    flex: 1,
    paddingVertical: theme.spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    height: 40,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
    height: 40,
    alignItems: 'center',
  },
  teamColumn: {
    width: 80,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  quarterColumn: {
    width: 40,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  totalColumn: {
    width: 60,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  winsColumn: {
    width: 50,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  teamNameText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginLeft: theme.spacing.xs,
  },
  teamIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.xs,
  },
  headerText: {
    ...theme.typography.caption,
    color: theme.colors.textDark,
    fontWeight: 'bold',
  },
  scoreText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalScoreText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  winsText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textDark,
    textAlign: 'center',
  },
});