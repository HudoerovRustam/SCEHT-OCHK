import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './MainTabNavigator';
import NewGameScreen from '../screens/NewGameScreen';
import PlayersScreen from '../screens/PlayersScreen';
import GameScreen from '../screens/GameScreen';
import FinishScreen from '../screens/FinishScreen';
import RollDiceScreen from '../screens/RollDiceScreen';
import TimerScreen from '../screens/TimerScreen';
import ChessGameScreen from '../screens/ChessGameScreen';
import CheckersGameScreen from '../screens/CheckersGameScreen';
import BackgammonGameScreen from '../screens/BackgammonGameScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="NewGame" component={NewGameScreen} />
      <Stack.Screen name="Players" component={PlayersScreen} />
      <Stack.Screen name="Game" component={GameScreen} />
      <Stack.Screen name="Finish" component={FinishScreen} />
      <Stack.Screen name="RollDice" component={RollDiceScreen} />
      <Stack.Screen name="Timer" component={TimerScreen} />
      <Stack.Screen name="ChessGame" component={ChessGameScreen} />
      <Stack.Screen name="CheckersGame" component={CheckersGameScreen} />
      <Stack.Screen name="BackgammonGame" component={BackgammonGameScreen} />
    </Stack.Navigator>
  );
}
