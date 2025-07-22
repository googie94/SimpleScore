import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ScoreboardScreen from '../screens/ScoreboardScreen';
import TimerScreen from '../screens/TimerScreen';
import { logScreenView } from '../utils/analytics';

export type RootStackParamList = {
  Scoreboard: undefined;
  Timer: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer
      onStateChange={(state) => {
        const currentScreen = state?.routes[state.index]?.name;
        if (currentScreen) {
          logScreenView(currentScreen);
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          presentation: 'modal',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen 
          name="Scoreboard" 
          component={ScoreboardScreen}
        />
        <Stack.Screen 
          name="Timer" 
          component={TimerScreen}
          options={{
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}