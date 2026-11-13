import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import BoardGamesScreen from '../screens/BoardGamesScreen'; // Импортируем новый экран
import HistoryScreen from '../screens/HistoryScreen';
import RatingScreen from '../screens/RatingScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1C1E22',
          borderTopColor: '#262930',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#6C47FF',
        tabBarInactiveTintColor: '#A0A5B0',
      }}
    >
      <Tab.Screen 
        name="Главная" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen 
        name="Настолки" 
        component={BoardGamesScreen} 
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>♟️</Text>,
        }}
      />
      <Tab.Screen 
        name="История" 
        component={HistoryScreen} 
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🕒</Text>,
        }}
      />
      <Tab.Screen 
        name="Рейтинг" 
        component={RatingScreen} 
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏆</Text>,
        }}
      />
      <Tab.Screen 
        name="Настройки" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}
