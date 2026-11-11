import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { API_CONFIG } from '../services/api.js';

export default function HistoryScreen() {
  // Задача 1: Внедряем три обязательных базовых состояния
  const [networkGames, setNetworkGames] = useState([]); // data
  const [isLoading, setIsLoading] = useState(true);     // isLoading
  const [error, setError] = useState(null);             // error

  useEffect(() => {
    // Задача 3: Оборачиваем асинхронный вызов в блок try...catch...finally
    const loadData = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GAMES_LIST}`);
        
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const json = await response.json();
        
        // Базовая валидация: проверяем, что пришел массив
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
        console.log('[Спринт 2] Перехвачена ошибка:', err.message);
        // Задача 2 (Сбой): Выводим текст ошибки вместо падения приложения
        setError('Не удалось загрузить данные. Проверьте интернет-соединение.');
      } finally {
        // Критерий 3 (DoD): Блок finally гарантированно выключает спиннер загрузки при любом исходе
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Уровень А: Если isLoading === true, рендерим спиннер по центру экрана
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  // Уровень А: При ошибке — вывод текста ошибки стандартным компонентом <Text>
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
        // Задача 2 (Пустой ответ): Плашка ListEmptyComponent во FlatList, если массив пустой []
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
