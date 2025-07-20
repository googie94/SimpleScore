import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '../store/gameStore';
import { theme } from '../constants/theme';

export default function TimerScreen({ navigation }: any) {
  const { currentGame, startTimer, stopTimer, setTimer } = useGameStore();
  const [minutesInput, setMinutesInput] = useState('');
  const [secondsInput, setSecondsInput] = useState('');
  const [isEditingMinutes, setIsEditingMinutes] = useState(false);
  const [isEditingSeconds, setIsEditingSeconds] = useState(false);

  const handleMinutesSubmit = () => {
    if (!currentGame) return;
    const minutes = parseInt(minutesInput) || 0;
    const currentSeconds = currentGame.timerSeconds % 60;
    const newTime = Math.min(Math.max(minutes, 0), 59) * 60 + currentSeconds;
    setTimer(newTime);
    setIsEditingMinutes(false);
    setMinutesInput('');
  };

  const handleSecondsSubmit = () => {
    if (!currentGame) return;
    const seconds = parseInt(secondsInput) || 0;
    const currentMinutes = Math.floor(currentGame.timerSeconds / 60);
    const newTime = currentMinutes * 60 + Math.min(Math.max(seconds, 0), 59);
    setTimer(newTime);
    setIsEditingSeconds(false);
    setSecondsInput('');
  };

  const handleOutsidePress = () => {
    if (isEditingMinutes) {
      handleMinutesSubmit();
    }
    if (isEditingSeconds) {
      handleSecondsSubmit();
    }
    Keyboard.dismiss();
  };

  const handleMinutesPress = () => {
    if (currentGame?.isTimerRunning) {
      Alert.alert('Timer Running', 'Stop the timer before adjusting time.');
      return;
    }
    setIsEditingMinutes(true);
    setMinutesInput(Math.floor(currentGame!.timerSeconds / 60).toString());
  };

  const handleSecondsPress = () => {
    if (currentGame?.isTimerRunning) {
      Alert.alert('Timer Running', 'Stop the timer before adjusting time.');
      return;
    }
    setIsEditingSeconds(true);
    setSecondsInput((currentGame!.timerSeconds % 60).toString());
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return { mins: mins.toString().padStart(2, '0'), secs: secs.toString().padStart(2, '0') };
  };

  if (!currentGame) return null;

  const time = formatTime(currentGame.timerSeconds);

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.timerContainer}>
        <View style={styles.timeDisplay}>
          <TouchableOpacity 
            style={styles.timeUnit} 
            onPress={handleMinutesPress}
            disabled={currentGame.isTimerRunning}
          >
            {isEditingMinutes ? (
              <TextInput
                style={styles.timeInput}
                value={minutesInput}
                onChangeText={setMinutesInput}
                onSubmitEditing={handleMinutesSubmit}
                onBlur={handleMinutesSubmit}
                keyboardType="numeric"
                maxLength={2}
                autoFocus
                selectTextOnFocus
              />
            ) : (
              <Text style={styles.timeText}>{time.mins}</Text>
            )}
            <Text style={styles.timeLabel}>min</Text>
          </TouchableOpacity>
          
          <Text style={styles.timeSeparator}>:</Text>
          
          <TouchableOpacity 
            style={styles.timeUnit} 
            onPress={handleSecondsPress}
            disabled={currentGame.isTimerRunning}
          >
            {isEditingSeconds ? (
              <TextInput
                style={styles.timeInput}
                value={secondsInput}
                onChangeText={setSecondsInput}
                onSubmitEditing={handleSecondsSubmit}
                onBlur={handleSecondsSubmit}
                keyboardType="numeric"
                maxLength={2}
                autoFocus
                selectTextOnFocus
              />
            ) : (
              <Text style={styles.timeText}>{time.secs}</Text>
            )}
            <Text style={styles.timeLabel}>sec</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {currentGame.isTimerRunning ? 'Running' : 'Stopped'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View />
        
        <TouchableOpacity
          style={[styles.playButton, currentGame.isTimerRunning && styles.pauseButton]}
          onPress={() => currentGame.isTimerRunning ? stopTimer() : startTimer()}
        >
          <Ionicons 
            name={currentGame.isTimerRunning ? 'pause' : 'play'} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.resetButton}
          onPress={resetTimer}
        >
          <Ionicons name="refresh" size={20} color={theme.colors.textLight} />
        </TouchableOpacity> */}
      </View>
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-end',
    padding: theme.spacing.md,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  timeUnit: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    minWidth: 120,
  },
  timeText: {
    ...theme.typography.timer,
    color: theme.colors.text,
  },
  timeLabel: {
    ...theme.typography.label,
    color: theme.colors.textDark,
    marginTop: theme.spacing.xs,
  },
  timeSeparator: {
    ...theme.typography.timer,
    color: theme.colors.textDark,
    marginHorizontal: theme.spacing.lg,
  },
  timeInput: {
    ...theme.typography.timer,
    color: theme.colors.primary,
    textAlign: 'center',
    minWidth: 80,
    backgroundColor: 'transparent',
  },
  statusContainer: {
    marginBottom: theme.spacing.xl,
  },
  statusText: {
    ...theme.typography.body,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  controlButton: {
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    minWidth: 80,
  },
  controlText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  playButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.full,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: theme.colors.warning,
  },
});