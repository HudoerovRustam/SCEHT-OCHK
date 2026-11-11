import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { API_CONFIG } from '../services/api.js';

export default function HistoryScreen() {
  // Три обязательных состояния данных
  const [networkGames, setNetworkGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Задача 1: Состояние для паттерна Pull-to-Refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Основная функция загрузки данных (поддерживает AbortSignal для предотвращения утечек памяти)
  const loadData = async (signal = null, fromRefresh = false) => {
    if (fromRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Передаем signal в fetch, чтобы иметь возможность отменить запрос
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GAMES_LIST}`,
        { signal }
      );
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const json = await response.json();
      
      if (Array.isArray(json)) {
        const mappedGames = json.map(item => ({
          id: item.id.toString(),
          title: `Партия #${item.id}`,
          date: '11.11.2026',
          winner: item.completed ? 'Игрок 1 (Победа)' : 'Ничья',
          status: item.completed ? 'Finished' : 'In Progress'
        }));
        setNetworkGames(mappedGames);
      }
    } catch (err) {
      // Игнорируем ошибку отмены, если компонент просто размонтировался
      if (err.name !== 'AbortError') {
        setError('Не удалось загрузить данные. Проверьте интернет-соединение.');
      }
    } finally {
      // Гарантированно выключаем оба спиннера в блоке finally
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Задача 2: Предотвращение утечек памяти (Memory Leaks) через cleanup-функцию
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    loadData(signal, false);

    // Возвращаем cleanup-функцию, которая сработает при уходе с экрана
    return () => {
      controller.abort(); // Отменяем текущий fetch-запрос, спасая память
    };
  }, []);

  // Обработчик жеста Pull-to-Refresh
  const handleRefresh = () => {
    loadData(null, true);
  };

  // Условный рендеринг: Ожидание первичной загрузки
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  // Условный рендеринг: Вывод ошибки через стандартный <Text>
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>История игр</Text>
      
      <FlatList
        data={networkGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gameCard}>
            <Text style={styles.gameTitle}>{item.title}</Text>
            <Text style={styles.gameInfo}>{item.date} • Победитель: {item.winner}</Text>
            <Text style={styles.gameStatus}>Статус: {item.status}</Text>
          </View>
        )}
        // Задача 1: Интеграция компонента RefreshControl во FlatList
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#6C47FF" // Цвет крутилки на iOS
            colors={['#6C47FF']} // Цвет крутилки на Android
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>История игр пуста.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  headerTitle: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  center: { flex: 1, backgroundColor: '#1C1E22', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  loadingText: { color: '#ffffff', marginTop: 10, fontSize: 16 },
  errorIcon: { fontSize: 40, marginBottom: 10 },
  errorText: { color: '#EF4444', fontSize: 16, textAlign: 'center', fontWeight: 'bold' },
  gameCard: { backgroundColor: '#262930', borderRadius: 14, padding: 16, marginBottom: 12 },
  gameTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  gameInfo: { color: '#A0A5B0', fontSize: 14, marginTop: 4 },
  gameStatus: { color: '#6C47FF', fontSize: 12, fontWeight: '600', marginTop: 4 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#A0A5B0', fontSize: 16 }
});
