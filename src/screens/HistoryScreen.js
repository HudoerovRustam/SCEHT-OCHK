import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { API_CONFIG } from '../services/api';

export default function HistoryScreen() {
  const [networkGames, setNetworkGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null); // Стейт для хранения текста ошибки

  // Функция асинхронного запроса к REST API с полной индикацией и отказоустойчивостью
  const loadDataFromServer = async () => {
    setIsLoading(true);
    setErrorMessage(null); // Сбрасываем старые ошибки перед новой попыткой

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GAMES_LIST}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера! Статус: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Сервер вернул некорректный формат данных (HTML/Текст)");
      }

      const json = await response.json();
      
      // Трансформируем данные под интерфейс приложения "Игро Счёт"
      const mappedGames = json.map(item => ({
        id: item.id.toString(),
        title: `Партия #${item.id}`,
        date: '11.11.2026',
        winner: item.completed ? 'Игрок 1 (Победа)' : 'Ничья',
        status: item.completed ? 'Finished' : 'In Progress'
      }));

      setNetworkGames(mappedGames);
    } catch (error) {
      console.log('[Спринт 2] Перехвачена ошибка сети:', error.message);
      // Записываем понятный текст ошибки для вывода пользователю на экран
      setErrorMessage('Не удалось загрузить историю игр.\nПроверьте подключение к серверу.');
    } finally {
      setIsLoading(false); // В любом случае выключаем крутилку загрузки
    }
  };

  useEffect(() => {
    loadDataFromServer();
  }, []);

  // 1. ИНДИКАЦИЯ ПРОЦЕССОВ: Если данные загружаются — показываем индикатор
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={styles.loadingText}>Загрузка данных из API...</Text>
      </View>
    );
  }

  // 2. ОТКАЗОУСТОЙЧИВОСТЬ: Если поймали ошибку — рендерим красивый экран сбоя и кнопку повтора
  if (errorMessage) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        
        {/* Кнопка "Повторить запрос" */}
        <TouchableOpacity style={styles.retryButton} onPress={loadDataFromServer}>
          <Text style={styles.retryButtonText}>🔄 Повторить запрос</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 3. БАЗОВЫЙ ТРЕНДЕР: Если всё хорошо — выводим список
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>История игр (API)</Text>
      
      <FlatList
        data={networkGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gameCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.gameTitle}>{item.title}</Text>
              <Text style={styles.gameInfo}>{item.date} • Победитель: {item.winner}</Text>
              <Text style={styles.gameStatus}>Статус: {item.status}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  headerTitle: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  center: { flex: 1, backgroundColor: '#1C1E22', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  loadingText: { color: '#ffffff', marginTop: 15, fontSize: 16, fontWeight: '500' },
  errorIcon: { fontSize: 50, marginBottom: 15 },
  errorText: { color: '#EF4444', fontSize: 16, textAlign: 'center', marginBottom: 25, lineHeight: 22, fontWeight: '500' },
  retryButton: { backgroundColor: '#6C47FF', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center' },
  retryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  gameCard: { backgroundColor: '#262930', borderRadius: 14, padding: 16, marginBottom: 12 },
  gameTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  gameInfo: { color: '#A0A5B0', fontSize: 14, marginTop: 4 },
  gameStatus: { color: '#6C47FF', fontSize: 12, fontWeight: '600', marginTop: 4 }
});
