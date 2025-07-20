import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer } from 'expo-audio';

class SoundManager {
  private isEnabled: boolean = true;
  
  async initialize() {
    try {
      // Sound initialization - just mark as enabled
      this.isEnabled = true;

    } catch (error) {
      console.error('Error initializing sounds:', error);
      this.isEnabled = false;
    }
  }

  async playCountdownBeep() {
    try {
      // Create a new player instance for each beep to avoid conflicts
      if (this.isEnabled) {
        try {
          const beepPlayer = createAudioPlayer(require('../../assets/sounds/countdown-beep.wav'));
          beepPlayer.play();
          
          // Clean up after a short delay
          setTimeout(() => {
            try {
              beepPlayer.release();
            } catch (e) {
            }
          }, 1000);
        } catch (audioError) {
          console.error('Audio playback failed:', audioError);
        }
      }
      
      // Also play haptic feedback
      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error playing countdown beep:', error);
      // Fallback to haptic only
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (hapticError) {
        console.error('Haptic fallback failed:', hapticError);
      }
    }
  }

  async playFinalAlarm() {
    try {
      // Create a new player instance for final alarm
      if (this.isEnabled) {
        try {
          const alarmPlayer = createAudioPlayer(require('../../assets/sounds/final-alarm.wav'));
          alarmPlayer.play();
          
          // Clean up after the sound finishes
          setTimeout(() => {
            try {
              alarmPlayer.release();
            } catch (e) {
            }
          }, 1500);
        } catch (audioError) {
          console.error('Final alarm playback failed:', audioError);
        }
      }
      
      // Strong haptic feedback pattern
      if (Platform.OS === 'ios') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        // Additional strong haptic pattern
        setTimeout(async () => {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } catch (e) {
          }
        }, 100);
        
        setTimeout(async () => {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          } catch (e) {
          }
        }, 300);
        
      } else {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    } catch (error) {
      console.error('Error playing final alarm:', error);
      // Fallback to haptic only
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (hapticError) {
        console.error('Haptic fallback failed:', hapticError);
      }
    }
  }

  async cleanup() {
    // No persistent players to clean up
  }
}

export default new SoundManager();