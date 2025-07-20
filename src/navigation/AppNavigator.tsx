import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ScoreboardScreen from '../screens/ScoreboardScreen';
import TimerScreen from '../screens/TimerScreen';

export type RootStackParamList = {
  Scoreboard: undefined;
  Timer: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
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