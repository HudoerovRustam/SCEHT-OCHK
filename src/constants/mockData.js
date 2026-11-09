export const MOCK_GAMES = Array.from({ length: 35 }, (_, index) => {
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
      address: 'Москва, ул. Игровая, д. ' + (index + 1),
      latitude: 55.7558 + (Math.random() - 0.5) * 0.1,
      longitude: 37.6173 + (Math.random() - 0.5) * 0.1,
    },
    players,
    history: [
      { status: 'Created', timestamp: `${date} 18:00` },
      { status: 'Dice Rolled', timestamp: `${date} 18:15` },
      { status: index === 0 ? 'Playing' : 'Finished', timestamp: `${date} 18:45` },
    ],
    photos: [
      'https://unsplash.com',
    ]
  };
});

export const MOCK_USER = {
  id: 'u_1',
  name: 'Разработчик Счётчик',
  email: 'student327@expo.io',
  avatar: '👑',
  isAuthorized: true,
};
