import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';

const STORAGE_KEY = '@schetochka_games_history';
const USER_STORAGE_KEY = '@schetochka_current_user';

const globalStore = {
  user: null,
  games: [], 
  isLoading: false,
  isInitialized: false,
  
  activePlayers: [
    { id: '1', name: '', avatar: '🏃', score: 0 },
    { id: '2', name: '', avatar: '🎯', score: 0 },
    { id: '3', name: '', avatar: '🎲', score: 0 },
    { id: '4', name: '', avatar: '🐷', score: 0 },
  ],

  initStore: async () => {
    if (globalStore.isInitialized) return;
    try {
      const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) globalStore.user = JSON.parse(savedUser);

      const savedGames = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedGames) globalStore.games = JSON.parse(savedGames);
    } catch (e) {} finally {
      globalStore.isInitialized = true;
    }
  },

  setUser: async (userData) => {
    globalStore.user = userData;
    try {
      if (userData) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
      }
    } catch (e) {}
  },

  setPlayersCount: (count) => {
    const avatars = ['🏃', '🎯', '🎲', '🐷', '🦄', '🦁', '🦊', '🐱'];
    globalStore.activePlayers = Array.from({ length: count }, (_, i) => ({
      id: (i + 1).toString(),
      name: '',
      avatar: avatars[i % avatars.length],
      score: 0
    }));
  },

  resetActiveScores: () => {
    globalStore.activePlayers = globalStore.activePlayers.map(p => ({ ...p, score: 0 }));
  },

  addGame: async (newGame) => {
    const ownerEmail = globalStore.user?.email || 'guest@local.app';
    const freshGame = {
      id: Date.now().toString(),
      title: newGame.title || `Партия #${globalStore.games.length + 1}`,
      date: new Date().toLocaleDateString('ru-RU'),
      winner: newGame.winner || 'Не определен',
      user_email: ownerEmail,
      status: 'Finished'
    };
    
    const updatedList = [freshGame, ...globalStore.games];
    globalStore.games = updatedList;
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      await apiService.createGame(freshGame.title, freshGame.winner, ownerEmail);
    } catch (e) {}
  },

  removeGame: async (id) => {
    const ownerEmail = globalStore.user?.email;
    if (!ownerEmail) return;

    const updatedList = globalStore.games.filter((game) => game.id !== id);
    globalStore.games = updatedList;
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      await apiService.deleteGame(id, ownerEmail);
    } catch (e) {}
  }
};

export const useGameStore = (selector) => {
  return selector ? selector(globalStore) : globalStore;
};
