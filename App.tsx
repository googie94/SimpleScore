import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, TextInput, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { useGameStore } from './src/store/gameStore';
import { useFonts } from '@expo-google-fonts/vt323';
import { Orbitron_400Regular, Orbitron_700Bold } from '@expo-google-fonts/orbitron';

export default function App() {
  const createGame = useGameStore((state) => state.createGame);
  
  let [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_700Bold,
    'G7Segment7': require('./assets/fonts/G7_Segment_7a.ttf'),
  });

  useEffect(() => {
    // Create a default game when app starts
    createGame();
    
    // Disable font scaling globally for Android
    if (Platform.OS === 'android') {
      (Text as any).defaultProps = (Text as any).defaultProps || {};
      (Text as any).defaultProps.allowFontScaling = false;
      
      (TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
      (TextInput as any).defaultProps.allowFontScaling = false;
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}
