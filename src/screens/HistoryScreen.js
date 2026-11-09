import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function HistoryScreen() {
  // Получаем доступ к стору напрямую
  const store = useGameStore();
  
  // Создаем локальный стейт для синхронного перерендера списка при удалении
  const [localGames, setLocalGames] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загружаем данные при открытии экрана
  useEffect(() => {
    if (store && store.games) {
      setLocalGames(store.games);
    }
    setLoading(false);
  }, [store.games]);

  const handleDelete = (id) => {
    // 1. Вызываем метод удаления из нашего глобального JS-стора
    if (typeof store.removeGame === 'function') {
      store.removeGame(id);
      // 2. Обновляем локальный стейт экрана, чтобы карточка исчезла прямо на глазах
      setLocalGames(prev => prev.filter(game => game.id !== id));
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Загрузка истории партий...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>История игр</Text>
      
      <FlatList
        data={localGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gameCard}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.gameTitle}>{item.title}</Text>
              <Text style={styles.gameInfo}>{item.date} • Победитель: {item.winner}</Text>
              <Text style={styles.gameStatus}>Статус: {item.status}</Text>
            </View>
            
            {/* Кнопка удаления */}
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>❌</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  headerTitle: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  center: { flex: 1, backgroundColor: '#1C1E22', justifyContent: 'center', alignItems: 'center' },
  gameCard: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 16, marginBottom: 12, justifyContent: 'space-between', alignItems: 'center' },
  gameTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  gameInfo: { color: '#A0A5B0', fontSize: 14, marginTop: 4 },
  gameStatus: { color: '#6C47FF', fontSize: 12, fontWeight: '600', marginTop: 4 },
  deleteBtn: { backgroundColor: '#EF4444', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }
});
