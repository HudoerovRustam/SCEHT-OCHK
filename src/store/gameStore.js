import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_GAMES = Array.from({ length: 35 }, (_, index) => {
  const id = (index + 1).toString();
  const date = new Date(2026, 10, Math.floor(Math.random() * 28) + 1).toLocaleDateString('ru-RU');
  const duration = `00:${Math.floor(Math.random() * 30) + 15}:00`;
  
  const players = [
    { id: '1', name: 'Игрок 1', avatar: '🏃', score: Math.floor(Math.random() * 50) + 10 },
    { id: '2', name: 'Игрок 2', avatar: '🎯', score: Math.floor(Math.random() * 50) + 10 },
    { id: '3', name: 'Игрок 3', avatar: '🎲', score: Math.floor(Math.random() * 50) + 10 },
    { id: '4', name: 'Игрок 4', avatar: '🐷', score: Math.floor(Math.random() * 50) + 10 },
  ];

  const winner = [...players].sort((a, b) => b.score - a.score)[0].name;

  return {
    id,
    title: `Партия #${id}`,
    date,
    duration,
    winner,
    status: index === 0 ? 'In Progress' : 'Finished',
    priority: index % 3 === 0 ? 'High' : 'Normal',
    location: {
      address: `Москва, ул. Игровая, д. ${index + 1}`,
      latitude: 55.7558 + (Math.random() - 0.5) * 0.1,
      longitude: 37.6173 + (Math.random() - 0.5) * 0.1,
    },
    players,
    history: [
      { status: 'Created', timestamp: `${date} 18:00` },
      { status: 'Dice Rolled', timestamp: `${date} 18:15` },
      { status: index === 0 ? 'Playing' : 'Finished', timestamp: `${date} 18:45` },
    ],
    photos: ['https://unsplash.com']
  };
});

const MOCK_USER = {
  id: 'u_1',
  name: 'Разработчик Счётчик',
  email: 'student327@expo.io',
  avatar: '👑',
  isAuthorized: true,
};



export const useGameStore = create(
  persist(
    (set, get) => ({

      user: MOCK_USER,
      games: [],
      isLoading: false,
      isInitialized: false,


      activePlayers: [
        { id: '1', name: 'Игрок 1', avatar: '🏃', score: 0 },
        { id: '2', name: 'Игрок 2', avatar: '🎯', score: 0 },
        { id: '3', name: 'Игрок 3', avatar: '🎲', score: 0 },
        { id: '4', name: 'Игрок 4', avatar: '🐷', score: 0 },
      ],
      setPlayersCount: (count) => {
        const avatars = ['🏃', '🎯', '🎲', '🐷', '🦄', '🦁', '🦊', '🐱'];
        const newPlayers = Array.from({ length: count }, (_, i) => ({
          id: (i + 1).toString(),
          name: `Игрок ${i + 1}`,
          avatar: avatars[i % avatars.length],
          score: 0
        }));
        set({ activePlayers: newPlayers });
      },
      addActivePlayer: (name) => {
        const avatars = ['🏃', '🎯', '🎲', '🐷', '🦄', '🦁', '🦊', '🐱', '👤'];
        const currentPlayers = get().activePlayers;
        const newPlayer = {
          id: Date.now().toString(),
          name: name,
          avatar: avatars[currentPlayers.length % avatars.length],
          score: 0
        };
        set({ activePlayers: [...currentPlayers, newPlayer] });
      },
      removeActivePlayer: (id) => {
        set((state) => ({
          activePlayers: state.activePlayers.filter(p => p.id !== id)
        }));
      },
      changeActiveScore: (id, amount) => {
        set((state) => ({
          activePlayers: state.activePlayers.map(p => 
            p.id === id ? { ...p, score: Math.max(0, p.score + amount) } : p
          )
        }));
      },
      resetActiveScores: () => {
        set((state) => ({
          activePlayers: state.activePlayers.map(p => ({ ...p, score: 0 }))
        }));
      },



      fetchGames: async () => {
        if (get().isInitialized) return;
        
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        set({ games: MOCK_GAMES, isLoading: false, isInitialized: true });
      },
      addGame: (newGame) => {
        set((state) => ({
          games: [
            {
              id: Date.now().toString(),
              title: newGame.title || `Партия #${state.games.length + 1}`,
              date: new Date().toLocaleDateString('ru-RU'),
              duration: '00:15:00',
              winner: newGame.winner || 'Не определен',
              status: 'Finished',
              priority: 'Normal',
              location: { address: 'Локальная игра', latitude: 55.75, longitude: 37.62 },
              players: state.activePlayers,
              history: [{ status: 'Finished', timestamp: new Date().toLocaleTimeString() }],
              photos: []
            },
            ...state.games
          ]
        }));
      },

      removeGame: (id) => {
        set((state) => ({
          games: state.games.filter((game) => game.id !== id)
        }));
      },
      updateUser: (updatedUser) => {
        set((state) => ({ user: { ...state.user, ...updatedUser } }));
      }
    }),
    {
      name: 'igroschet-storage', 
      storage: createJSONStorage(() => AsyncStorage), 
    }
  )
);
