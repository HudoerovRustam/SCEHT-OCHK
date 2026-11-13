import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useGameStore } from './src/store/gameStore';
import LoginScreen from './src/screens/LoginScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import NewGameScreen from './src/screens/NewGameScreen';
import PlayersScreen from './src/screens/PlayersScreen';
import GameScreen from './src/screens/GameScreen';
import FinishScreen from './src/screens/FinishScreen';
import RollDiceScreen from './src/screens/RollDiceScreen';
import TimerScreen from './src/screens/TimerScreen';
import ChessGameScreen from './src/screens/ChessGameScreen';
import CheckersGameScreen from './src/screens/CheckersGameScreen';
import BackgammonGameScreen from './src/screens/BackgammonGameScreen';
import TicTacToeScreen from './src/screens/TicTacToeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const store = useGameStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      await store.initStore();
      setReady(true);
    };
    checkSession();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#1C1E22', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6C47FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={store.user ? 'MainTabs' : 'Login'} 
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
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
        <Stack.Screen name="TicTacToe" component={TicTacToeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
