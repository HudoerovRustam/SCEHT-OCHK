export const API_CONFIG = {
  BASE_URL: 'https://bedztctblcntzxnofiqs.supabase.co/rest/v1/',
  API_KEY: 'sb_publishable_vKcPgCSwcyK0MCZZKXNmqg_EGmIVouo',
  ENDPOINTS: {
    GAMES_LIST: '/games',
    USERS_LIST: '/users'
  }
};

const getHeaders = () => ({
  'apikey': API_CONFIG.API_KEY,
  'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
  'Content-Type': 'application/json'
});

export const authService = {
  signUp: async (email, password) => {
    const checkUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS_LIST}?email=eq.${encodeURIComponent(email)}&select=*`;
    const checkRes = await fetch(checkUrl, { method: 'GET', headers: getHeaders() });
    
    if (!checkRes.ok) {
      throw new Error(`Ошибка проверки базы: ${checkRes.status}`);
    }
    
    const existingUsers = await checkRes.json();
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      throw new Error('Пользователь с такой почтой уже зарегистрирован');
    }

    const createUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS_LIST}`;
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ email, password })
    });

    if (!createRes.ok) {
      throw new Error(`Ошибка регистрации: ${createRes.status}`);
    }

    const created = await createRes.json();
    return Array.isArray(created) ? created.at(0) : { email };
  },

  signIn: async (email, password) => {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS_LIST}?email=eq.${encodeURIComponent(email)}&select=*`;
    const response = await fetch(url, { method: 'GET', headers: getHeaders() });

    if (!response.ok) {
      throw new Error(`Ошибка связи с базой: ${response.status}`);
    }

    const users = await response.json();
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('Аккаунт с такой почтой не найден');
    }

    const user = users.at(0);
    if (user.password !== password) {
      throw new Error('Неверный пароль');
    }

    return user;
  }
};

export const apiService = {
  getGames: async () => {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GAMES_LIST}?select=*&order=created_at.desc`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Ошибка сети Supabase: ${response.status}`);
    }

    const json = await response.json();
    if (!Array.isArray(json)) return [];

    return json.map((item, index) => ({
      id: item.id ? item.id.toString() : `raw-${index}`,
      title: item.title || 'Партия',
      winner: item.winner || 'Не определен',
      user_email: item.user_email || '',
      date: item.created_at ? new Date(item.created_at).toLocaleDateString('ru-RU') : 'Сегодня',
      status: 'Finished'
    }));
  },

  createGame: async (title, winner, userEmail) => {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GAMES_LIST}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ 
        title, 
        winner, 
        user_email: userEmail 
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка сохранения: ${response.status}`);
    }
  },

  deleteGame: async (id, userEmail) => {
    if (!userEmail) return;
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GAMES_LIST}?id=eq.${id}&user_email=eq.${encodeURIComponent(userEmail)}`;
    await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    });
  }
};
export const roomService = {
  cleanupOldRooms: async () => {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const url = `${API_CONFIG.BASE_URL}/rooms?created_at=lt.${twoHoursAgo}`;
      await fetch(url, { method: 'DELETE', headers: getHeaders() });
    } catch (e) {}
  },

  createRoom: async (gameType, player1, initialBoard) => {
    await roomService.cleanupOldRooms();
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const url = `${API_CONFIG.BASE_URL}/rooms`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...getHeaders(), 'Prefer': 'return=representation' },
      body: JSON.stringify({
        code,
        game_type: gameType,
        player1,
        player2: '',
        board_state: JSON.stringify(initialBoard),
        turn: 'white',
        winner: ''
      })
    });
    if (!response.ok) throw new Error('Не удалось создать онлайн-комнату');
    const data = await response.json();
    return Array.isArray(data) ? data.at(0) : data;
  },

  joinRoom: async (code, player2) => {
    await roomService.cleanupOldRooms();
    const findUrl = `${API_CONFIG.BASE_URL}/rooms?code=eq.${code.trim()}&select=*`;
    const findRes = await fetch(findUrl, { method: 'GET', headers: getHeaders() });
    const rooms = await findRes.json();
    
    if (!Array.isArray(rooms) || rooms.length === 0) {
      throw new Error('Комната не найдена или прошло более 2 часов');
    }
    
    const room = rooms.at(0);
    const updateUrl = `${API_CONFIG.BASE_URL}/rooms?id=eq.${room.id}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: { ...getHeaders(), 'Prefer': 'return=representation' },
      body: JSON.stringify({ player2 })
    });
    const updated = await updateRes.json();
    return Array.isArray(updated) ? updated.at(0) : room;
  },

  getRoom: async (id) => {
    const url = `${API_CONFIG.BASE_URL}/rooms?id=eq.${id}&select=*`;
    const res = await fetch(url, { method: 'GET', headers: getHeaders() });
    const data = await res.json();
    return Array.isArray(data) ? data.at(0) : null;
  },

  updateMove: async (id, boardState, nextTurn, winner = '') => {
    const url = `${API_CONFIG.BASE_URL}/rooms?id=eq.${id}`;
    await fetch(url, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({
        board_state: JSON.stringify(boardState),
        turn: nextTurn,
        winner
      })
    });
  }
};
