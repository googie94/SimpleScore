import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  PanResponder,
  Platform,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '../store/gameStore';
import { theme } from '../constants/theme';
import { scaleSize, scaleFont, isSmallDevice } from '../utils/dimensions';
import MinimalColorPicker from '../components/MinimalColorPicker';
import QuarterRecordsView from '../components/QuarterRecordsView';
import soundManager from '../utils/soundManager';

interface TeamScoreProps {
  team: any;
  onScoreChange: (delta: number) => void;
  onTeamNameChange: (name: string) => void;
  onColorPress: () => void;
}

const TeamScore: React.FC<TeamScoreProps> = ({ team, onScoreChange, onTeamNameChange, onColorPress }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState('');

  // PanResponder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only respond to significant vertical movement
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderGrant: () => {
      // Gesture has started
    },
    onPanResponderMove: () => {
      // Handle move if needed
    },
    onPanResponderRelease: (_, gestureState) => {
      const { dy } = gestureState;
      
      // If swipe down (positive dy) and significant distance
      if (dy > 30) {
        onScoreChange(-1); // Decrease score
      } 
      // If swipe up (negative dy) or tap
      else if (dy < -10) {
        onScoreChange(1); // Increase score
      }
      // If minimal movement, treat as tap
      else if (Math.abs(dy) <= 10) {
        onScoreChange(1); // Increase score
      }
    },
  });

  const handleTeamNamePress = () => {
    setIsEditingName(true);
    setTeamNameInput(team.name);
  };

  const handleTeamNameSubmit = () => {
    if (teamNameInput.trim()) {
      onTeamNameChange(teamNameInput.trim());
    }
    setIsEditingName(false);
    setTeamNameInput('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.teamContainer}>
      <View style={styles.scoreBoard}>
        {/* Team Name Area - Separate Touch Area */}
        <View style={styles.teamHeader}>
          <TouchableOpacity 
            style={styles.teamNameButton}
            onPress={handleTeamNamePress}
          >
            {isEditingName ? (
              <View style={styles.teamNameInputContainer}>
                <TextInput
                  style={styles.teamNameInput}
                  value={teamNameInput}
                  onChangeText={setTeamNameInput}
                  onSubmitEditing={handleTeamNameSubmit}
                  onBlur={handleTeamNameSubmit}
                  autoFocus
                  maxLength={12}
                  placeholder="Team Name"
                  placeholderTextColor={theme.colors.textDark}
                />
              </View>
            ) : (
              <View style={styles.teamNameContainer}>
                <Text allowFontScaling={false} style={styles.teamName}>{team.name}</Text>
                <Ionicons name="create-outline" size={20} color={theme.colors.textDark} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.teamIndicator, { backgroundColor: team.color }]}
            onPress={onColorPress}
          />
        </View>
        
        {/* Score Touch Area with Swipe */}
        <View style={styles.scoreTouchArea} {...panResponder.panHandlers}>
          {/* Score Display */}
          <View style={styles.scoreDisplay}>
            <Text 
              allowFontScaling={false}
              style={[
                styles.score,
                team.score >= 100 && styles.scoreThreeDigits,
                isSmallDevice && styles.scoreSmallDevice
              ]}
            >{team.score}</Text>
          </View>
        </View>
        
        {/* Bottom spacer for visual balance */}
        <View style={styles.bottomSpacer} />
      </View>
    </View>
  );
};

export default function ScoreboardScreen({ navigation }: any) {
  const { currentGame, updateScore, resetCurrentQuarter, updateTeamName, updateTeamColor, updateTimer, stopTimer, nextQuarter, previousQuarter, saveCurrentQuarter } = useGameStore();
  const timerInterval = useRef<NodeJS.Timeout | undefined>(undefined);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [quarterRecordsVisible, setQuarterRecordsVisible] = useState(false);
  
  // Initialize sound manager
  useEffect(() => {
    soundManager.initialize();
    
    return () => {
      soundManager.cleanup();
    };
  }, []);
  

  useEffect(() => {
    if (currentGame?.isTimerRunning && !colorPickerVisible) {
      timerInterval.current = setInterval(() => {
        if (currentGame.timerSeconds > 0) {
          // Update timer first
          updateTimer(currentGame.timerSeconds - 1);
          
          // Check AFTER updating timer for correct timing
          const newSeconds = currentGame.timerSeconds - 1;
          
          // Vibration and sound feedback when 5 seconds or less
          if (newSeconds === 5 || newSeconds === 4 || 
              newSeconds === 3 || newSeconds === 2 || 
              newSeconds === 1) {
            // Use native Vibration API for stronger feedback
            Vibration.vibrate(300);
            
            // Play countdown sound
            soundManager.playCountdownBeep();
          } else if (newSeconds === 0) {
            // Play final sound immediately when reaching 0
            Vibration.vibrate([0, 500, 200, 500]);
            soundManager.playFinalAlarm();
          }
        } else {
          // Timer reached 0 - stop timer
          stopTimer();
        }
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = undefined;
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
        timerInterval.current = undefined;
      }
    };
  }, [currentGame?.isTimerRunning, currentGame?.timerSeconds, colorPickerVisible]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleColorPress = (teamId: string) => {
    setSelectedTeamId(teamId);
    setColorPickerVisible(true);
  };

  const handleColorSelect = (color: string) => {
    if (selectedTeamId) {
      updateTeamColor(selectedTeamId, color);
    }
    setColorPickerVisible(false);
    setSelectedTeamId(null);
  };

  const handleColorPickerClose = () => {
    setColorPickerVisible(false);
    setSelectedTeamId(null);
  };

  if (!currentGame || !currentGame.teams || currentGame.teams.length < 2) {
    return null;
  }

  const handleOutsidePress = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={[styles.safeArea, Platform.OS === 'android' && styles.androidSafeArea]}>
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={[styles.container, Platform.OS === 'android' && styles.androidContainer]}>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor={Platform.OS === 'android' ? theme.colors.background : undefined}
            translucent={Platform.OS === 'android' ? false : undefined}
          />
      
      {/* Digital Clock Style Layout */}
      <View style={styles.digitalClockLayout}>
        

        {/* Center Area - Scoreboard */}
        <View style={styles.centerZone}>
          <View style={styles.scoreZone}>
            <TeamScore
              team={currentGame.teams[0]}
              onScoreChange={(delta) => updateScore(currentGame.teams[0].id, delta)}
              onTeamNameChange={(name) => updateTeamName(currentGame.teams[0].id, name)}
              onColorPress={() => handleColorPress(currentGame.teams[0].id)}
            />
            
            <TeamScore
              team={currentGame.teams[1]}
              onScoreChange={(delta) => updateScore(currentGame.teams[1].id, delta)}
              onTeamNameChange={(name) => updateTeamName(currentGame.teams[1].id, name)}
              onColorPress={() => handleColorPress(currentGame.teams[1].id)}
            />
          </View>
        </View>

        {/* Bottom Area - Quarter, Reset, Time */}
        <View style={styles.bottomZone}>
          <View style={styles.quarterZone}>
            <TouchableOpacity
              style={styles.quarterButton}
              onPress={previousQuarter}
              disabled={currentGame.currentQuarter === 1}
            >
              <Ionicons name="chevron-back" size={16} color={currentGame.currentQuarter === 1 ? theme.colors.textDark : theme.colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quarterDisplay}
              onPress={() => {
                saveCurrentQuarter();
                setQuarterRecordsVisible(true);
              }}
            >
              <Ionicons name="bar-chart-outline" size={14} color={theme.colors.textLight} />
              <Text allowFontScaling={false} style={styles.quarterText}>{currentGame.currentQuarter}Q</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quarterButton}
              onPress={nextQuarter}
              disabled={currentGame.currentQuarter === 9}
            >
              <Ionicons name="chevron-forward" size={16} color={currentGame.currentQuarter === 9 ? theme.colors.textDark : theme.colors.textLight} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.resetZone}>
            <TouchableOpacity style={styles.resetButton} onPress={resetCurrentQuarter}>
              <Ionicons name="refresh-outline" size={16} color={theme.colors.textLight} />
              <Text allowFontScaling={false} style={styles.resetText}>{currentGame.currentQuarter}Q Reset</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeZone}>
            <TouchableOpacity
              style={[
                styles.timerInfo,
                currentGame.timerSeconds <= 5 && currentGame.timerSeconds > 0 && currentGame.isTimerRunning && {
                  backgroundColor: theme.colors.error,
                }
              ]}
              onPress={() => navigation.navigate('Timer')}
            >
              <Ionicons 
                name="time-outline" 
                size={16} 
                color={currentGame.timerSeconds <= 5 && currentGame.timerSeconds > 0 && currentGame.isTimerRunning ? '#FFFFFF' : theme.colors.textLight} 
              />
              <Text allowFontScaling={false} style={[
                styles.timerText,
                currentGame.timerSeconds <= 5 && currentGame.timerSeconds > 0 && currentGame.isTimerRunning && {
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                }
              ]}>{formatTime(currentGame.timerSeconds)}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </View>
        </View>
      </TouchableWithoutFeedback>
      
      {/* Color Picker - Outside of container to cover full screen */}
      <MinimalColorPicker
        visible={colorPickerVisible}
        currentColor={selectedTeamId ? currentGame.teams.find(t => t.id === selectedTeamId)?.color || '#3B82F6' : '#3B82F6'}
        onColorSelect={handleColorSelect}
        onClose={handleColorPickerClose}
      />
      
      {/* Quarter Records Overlay - Outside of SafeAreaView to cover full screen */}
      {quarterRecordsVisible && currentGame && currentGame.teams && currentGame.teams.length >= 2 && (
        <QuarterRecordsView
          game={currentGame}
          onClose={() => setQuarterRecordsVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  digitalClockLayout: {
    flex: 1,
    padding: scaleSize(10),
  },
  
  // Center area (80% height - scoreboard area expanded)
  centerZone: {
    flex: 1,
    marginBottom: 5,
    justifyContent: 'center',
  },
  scoreZone: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  
  // Bottom area (10% height - quarter, reset, time)
  bottomZone: {
    height: '10%',
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quarterZone: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  resetZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  quarterButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quarterDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    minWidth: 80,
    opacity: 0.9,
    ...theme.shadows.sm,
  },
  quarterText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    marginLeft: 6,
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timerGestureArea: {
    // GestureHandlerRootView 스타일
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 80,
    justifyContent: 'center',
    opacity: 0.9,
    ...theme.shadows.sm,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 1,
    color: theme.colors.textLight,
    marginLeft: 6,
  },
  teamContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBoard: {
    backgroundColor: theme.colors.surface,
    borderRadius: scaleSize(20),
    flex: 1,
    width: '100%',
    minHeight: scaleSize(100),
    maxHeight: scaleSize(300),
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 8 : 4,
    justifyContent: 'space-between',
    ...(Platform.OS === 'android' && {
      borderWidth: 1,
      borderColor: theme.colors.border,
    }),
  },
  scoreTouchArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(12),
    minHeight: scaleSize(50),
  },
  teamNameButton: {
    flex: 1,
    marginRight: 12,
    paddingVertical: 8,
  },
  teamNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginRight: 8,
  },
  teamNameInputContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  teamNameInput: {
    ...theme.typography.h3,
    color: theme.colors.text,
    minWidth: 100,
  },
  teamIndicator: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: scaleSize(18),
    ...theme.shadows.sm,
  },
  scoreDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  score: {
    ...theme.typography.score,
    color: theme.colors.text,
    textAlign: 'center',
    includeFontPadding: false,
    ...(Platform.OS === 'android' && {
      textAlignVertical: 'center',
      lineHeight: undefined,
    }),
  },
  scoreThreeDigits: {
    fontSize: scaleFont(180),
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 80,
    opacity: 0.9,
    ...theme.shadows.sm,
  },
  resetText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    marginLeft: 6,
  },
  bottomSpacer: {
    height: scaleSize(30),
  },
  androidSafeArea: {
    paddingTop: Platform.OS === 'android' ? scaleSize(25) : 0,
  },
  androidContainer: {
    backgroundColor: theme.colors.background,
  },
  scoreSmallDevice: {
    fontSize: scaleFont(200),
  },
});