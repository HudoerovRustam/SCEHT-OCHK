import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. ИМПОРТИРУЕМ экран авторизации из файла Zagruzka.js
import Zagruzka from '../screens/Zagruzka';

// Импортируем навигатор вкладок и внутренние экраны
import MainTabNavigator from './MainTabNavigator';
import NewGameScreen from '../screens/NewGameScreen';
import PlayersScreen from '../screens/PlayersScreen';
import GameScreen from '../screens/GameScreen';
import RollDiceScreen from '../screens/RollDiceScreen';
import TimerScreen from '../screens/TimerScreen';
import FinishScreen from '../screens/FinishScreen';

const Stack = createNativeStackNavigator();

// Кастомная тема для задания фонового цвета из colors.BACKGROUND (Шаг 3.1)
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#1C1E22', // Системный темный фон из Figma
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        // 2. ИЗМЕНЯЕМ стартовый экран на "Login"
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {/* 3. РЕГИСТРИРУЕМ экран логина в самом верху стека */}
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
