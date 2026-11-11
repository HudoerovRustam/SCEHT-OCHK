import { API_CONFIG } from './api.js';

export const apiService = {
  /**
   * Получение списка игр с сервера с валидацией и Query параметрами
   * @param {number} limit - Ограничение количества записей
   * @param {string} sort - Направление сортировки ('asc' или 'desc')
   */
  getGames: async (limit = 15, sort = 'desc') => {
    // Формируем URL с Query-параметрами (лимиты, сортировка)
    const queryParams = `?_limit=${limit}&_sort=id&_order=${sort}`;
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GAMES_LIST}${queryParams}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка сети! Статус: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Сервер вернул данные в некорректном формате (ожидался JSON)");
    }

    const json = await response.json();

    if (!Array.isArray(json)) {
      throw new Error("Неверная структура данных: ожидался массив");
    }

    // Типизация и жесткая валидация полей ответа сервера
    return json.map((item, index) => {
      const validId = item.id ? item.id.toString() : `raw-${index}`;
      const validTitle = item.title && typeof item.title === 'string' 
        ? item.title 
        : `Партия #${validId}`;
      const validCompleted = typeof item.completed === 'boolean' ? item.completed : false;

      return {
        id: validId,
        title: validTitle.length > 25 ? `${validTitle.slice(0, 22)}...` : validTitle,
        date: new Date().toLocaleDateString('ru-RU'),
        winner: validCompleted ? 'Игрок 1 (Победа)' : 'Ничья',
        status: validCompleted ? 'Finished' : 'In Progress'
      };
    });
  }
};
