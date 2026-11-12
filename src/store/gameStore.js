import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

const STORAGE_KEY = '@schetochka_games_history';

const globalStore = {
  user: { id: 'u_1', name: 'Разработчик', avatar: '👑' },
  games: [], 
  isLoading: false,
  isInitialized: false,
  
  activePlayers: [
    { id: '1', name: 'Игрок 1', avatar: '🏃', score: 0 },
    { id: '2', name: 'Игрок 2', avatar: '🎯', score: 0 },
    { id: '3', name: 'Игрок 3', avatar: '🎲', score: 0 },
    { id: '4', name: 'Игрок 4', avatar: '🐷', score: 0 },
  ],

  initStore: async () => {
    if (globalStore.isInitialized) return;
    try {
      const savedGames = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedGames !== null) {
        globalStore.games = JSON.parse(savedGames);
      }
    } catch (e) {} finally {
      globalStore.isInitialized = true;
    }
  },

  setPlayersCount: (count) => {
    const avatars = ['🏃', '🎯', '🎲', '🐷', '🦄', '🦁', '🦊', '🐱'];
    globalStore.activePlayers = Array.from({ length: count }, (_, i) => ({
      id: (i + 1).toString(),
      name: `Игрок ${i + 1}`,
      avatar: avatars[i % avatars.length],
      score: 0
    }));
  },

  resetActiveScores: () => {
    globalStore.activePlayers = globalStore.activePlayers.map(p => ({ ...p, score: 0 }));
  },

  addGame: async (newGame) => {
    const freshGame = {
      id: Date.now().toString(),
      title: newGame.title || `Партия #${globalStore.games.length + 1}`,
      date: new Date().toLocaleDateString('ru-RU'),
      winner: newGame.winner || 'Не определен',
      status: 'Finished'
    };
    
    const updatedList = [freshGame, ...globalStore.games];
    globalStore.games = updatedList;
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {}

    // Отправка партии в облако через apiService
    try {
      await apiService.createGame(freshGame.title, freshGame.winner);
    } catch (e) {
      console.log('Нет интернета для отправки в облако');
    }
  },

  removeGame: async (id) => {
    const updatedList = globalStore.games.filter((game) => game.id !== id);
    globalStore.games = updatedList;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      await apiService.deleteGame(id);
    } catch (e) {}
  }
};

export const useGameStore = (selector) => {
  return selector ? selector(globalStore) : globalStore;
};
