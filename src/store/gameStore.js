const MOCK_GAMES = Array.from({ length: 35 }, (_, index) => {
  const id = (index + 1).toString();
  const date = new Date(2026, 10, Math.floor(Math.random() * 28) + 1).toLocaleDateString('ru-RU');
  const players = [
    { id: '1', name: 'Игрок 1', avatar: '🏃', score: Math.floor(Math.random() * 50) + 10 },
    { id: '2', name: 'Игрок 2', avatar: '🎯', score: Math.floor(Math.random() * 50) + 10 },
    { id: '3', name: 'Игрок 3', avatar: '🎲', score: Math.floor(Math.random() * 50) + 10 },
    { id: '4', name: 'Игрок 4', avatar: '🐷', score: Math.floor(Math.random() * 50) + 10 },
  ];
  return {
    id,
    title: `Партия #${id}`,
    date,
    duration: '00:20:00',
    winner: [...players].sort((a, b) => b.score - a.score)[0].name,
    status: 'Finished',
    priority: 'Normal',
    location: { address: 'Москва, ул. Игровая', latitude: 55.75, longitude: 37.62 },
    players,
    history: [{ status: 'Created', timestamp: `${date} 18:00` }],
    photos: []
  };
});

const globalStore = {
  user: { id: 'u_1', name: 'Разработчик', avatar: '👑' },
  games: MOCK_GAMES,
  isLoading: false,
  isInitialized: true,
  activePlayers: [
    { id: '1', name: 'Игрок 1', avatar: '🏃', score: 0 },
    { id: '2', name: 'Игрок 2', avatar: '🎯', score: 0 },
    { id: '3', name: 'Игрок 3', avatar: '🎲', score: 0 },
    { id: '4', name: 'Игрок 4', avatar: '🐷', score: 0 },
    { id: '5', name: 'Игрок 5', avatar: '🦄', score: 0},
    { id: '6', name: 'Игрок 6', avatar: '🦁', score: 0},
    { id: '7', name: 'Игрок 7', avatar: '🦊', score: 0},
    { id: '8', name: 'Игрок 8', avatar: '🐱', score: 0},
  ],

  setPlayersCount: (count) => {
    const avatars = ['🏃', '🎯', '🎲', '🐷', '🦄', '🦁', '🦊', '🐱'];
    globalStore.activePlayers = Array.from({ length: count }, (_, i) => ({
      id: (i + 1).toString(),
      name: `Игрок ${i + 1}`,
      avatar: avatars[i % avatars.length],
      score: 0
    }));
  },
  addActivePlayer: (name) => {
    const avatars = ['🏃', '🎯', '🎲', '🐷', '👤'];
    
    const newPlayer = {
      id: Date.now().toString(),
      name: name,
      avatar: avatars[globalStore.activePlayers.length % avatars.length],
      score: 0
    };
    globalStore.activePlayers = [...globalStore.activePlayers, newPlayer];
  },
  removeActivePlayer: (id) => {
    globalStore.activePlayers = globalStore.activePlayers.filter(p => p.id !== id);
  },

  changeActiveScore: (id, amount) => {
    globalStore.activePlayers = globalStore.activePlayers.map(p => 
      p.id === id ? { ...p, score: Math.max(0, p.score + amount) } : p
    );
  },

  resetActiveScores: () => {
    globalStore.activePlayers = globalStore.activePlayers.map(p => ({ ...p, score: 0 }));
  },

  fetchGames: async () => {
    return new Promise((resolve) => setTimeout(resolve, 100));
  },
  addGame: (newGame) => {
    const freshGame = {
      id: Date.now().toString(),
      title: newGame.title || `Партия #${globalStore.games.length + 1}`,
      date: new Date().toLocaleDateString('ru-RU'),
      duration: '00:15:00',
      winner: newGame.winner || 'Не определен',
      status: 'Finished',
      priority: 'Normal',
      location: { address: 'Локальная игра', latitude: 55.75, longitude: 37.62 },
      players: globalStore.activePlayers,
      history: [],
      photos: []
    };
    globalStore.games = [freshGame, ...globalStore.games];
  },

  removeGame: (id) => {
    globalStore.games = globalStore.games.filter((game) => game.id !== id);
  }
};

export const useGameStore = (selector) => {
  return selector ? selector(globalStore) : globalStore;
};
