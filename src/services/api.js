export const API_CONFIG = {
  BASE_URL: 'https://bedztctblcntzxnofiqs.supabase.co/rest/v1/',
  API_KEY: 'sb_publishable_vKcPgCSwcyK0MCZZKXNmqg_EGmIVouo',
  ENDPOINTS: {
    GAMES_LIST: '/games'
  }
};

const getHeaders = () => ({
  'apikey': API_CONFIG.API_KEY,
  'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
  'Content-Type': 'application/json'
});

export const apiService = {
  // Получение ВСЕХ игр из Supabase без ограничения лимита
  getGames: async () => {
    const queryParams = `?select=*&order=created_at.desc`;
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GAMES_LIST}${queryParams}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('ОШИБКА ЧТЕНИЯ SUPABASE:', response.status, errorText);
      throw new Error(`Ошибка сети Supabase! Статус: ${response.status}`);
    }

    const json = await response.json();

    if (!Array.isArray(json)) {
      throw new Error("Неверная структура данных: ожидался массив");
    }

    return json.map((item, index) => {
      const validId = item.id ? item.id.toString() : `raw-${index}`;
      const validTitle = item.title && typeof item.title === 'string' 
        ? item.title 
        : `Партия #${validId}`;
      const validWinner = item.winner && typeof item.winner === 'string'
        ? item.winner
        : 'Не определен';
      const validDate = item.created_at 
        ? new Date(item.created_at).toLocaleDateString('ru-RU') 
        : new Date().toLocaleDateString('ru-RU');

      return {
        id: validId,
        title: validTitle.length > 25 ? `${validTitle.slice(0, 22)}...` : validTitle,
        date: validDate,
        winner: validWinner,
        status: 'Finished'
      };
    });
  },

  // Сохранение новой сыгранной партии в таблицу Supabase (POST)
  createGame: async (title, winner) => {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GAMES_LIST}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ title, winner })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('ОШИБКА ЗАПИСИ В SUPABASE:', response.status, errorText);
      throw new Error(`Ошибка сохранения в Supabase: ${response.status}`);
    } else {
      console.log('УСПЕШНО ОТПРАВЛЕНО В SUPABASE!');
    }
  },

  // Удаление партии из Supabase по ID (DELETE)
  deleteGame: async (id) => {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GAMES_LIST}?id=eq.${id}`;
    await fetch(url, {
      method: 'DELETE',
      headers: getHeaders()
    });
  }
};
