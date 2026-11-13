import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './src/navigation/MainTabNavigator';
import NewGameScreen from './src/screens/NewGameScreen';
import PlayersScreen from './src/screens/PlayersScreen';
import GameScreen from './src/screens/GameScreen';
import FinishScreen from './src/screens/FinishScreen';
import RollDiceScreen from './src/screens/RollDiceScreen';
import TimerScreen from './src/screens/TimerScreen';
import TicTacToeScreen from './src/screens/TicTacToeScreen';
import ChessGameScreen from './src/screens/ChessGameScreen';
import CheckersGameScreen from './src/screens/CheckersGameScreen';
import BackgammonGameScreen from './src/screens/BackgammonGameScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="NewGame" component={NewGameScreen} />
        <Stack.Screen name="Players" component={PlayersScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="TicTacToe" component={TicTacToeScreen} />
        <Stack.Screen name="Finish" component={FinishScreen} />
        <Stack.Screen name="RollDice" component={RollDiceScreen} />
        <Stack.Screen name="Timer" component={TimerScreen} />
        <Stack.Screen name="ChessGame" component={ChessGameScreen} />
        <Stack.Screen name="CheckersGame" component={CheckersGameScreen} />
        <Stack.Screen name="BackgammonGame" component={BackgammonGameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
