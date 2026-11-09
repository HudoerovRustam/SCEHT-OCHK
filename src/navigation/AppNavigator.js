import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Zagruzka from '../screens/Zagruzka';

import MainTabNavigator from './MainTabNavigator';
import NewGameScreen from '../screens/NewGameScreen';
import PlayersScreen from '../screens/PlayersScreen';
import GameScreen from '../screens/GameScreen';
import RollDiceScreen from '../screens/RollDiceScreen';
import TimerScreen from '../screens/TimerScreen';
import FinishScreen from '../screens/FinishScreen';

const Stack = createNativeStackNavigator()
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#1C1E22', 
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >

        <Stack.Screen name="Login" component={Zagruzka} />

        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="NewGame" component={NewGameScreen} />
        <Stack.Screen name="Players" component={PlayersScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="RollDice" component={RollDiceScreen} />
        <Stack.Screen name="Timer" component={TimerScreen} />
        <Stack.Screen name="Finish" component={FinishScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
