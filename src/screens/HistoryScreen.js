import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/gameStore'; // Импортируем наше хранилище

export default function HistoryScreen() {
  const store = useGameStore();
  
  // Создаем локальный стейт экрана для синхронизации и возможности ручного удаления
  const [localGames, setLocalGames] = useState([]);

  // Слушаем изменения в глобальном сторе. Как только игра добавляется, обновляем экран
  useEffect(() => {
    if (store && store.games) {
      setLocalGames(store.games);
    }
  }, [store?.games]);

  const handleDelete = (id) => {
    // 1. Удаляем из глобальной памяти
    if (store && typeof store.removeGame === 'function') {
      store.removeGame(id);
    } else if (store && store.games) {
      store.games = store.games.filter((game) => game.id !== id);
    }
    
    // 2. Обновляем локальный стейт, чтобы карточка исчезла на глазах
    setLocalGames(prev => prev.filter(game => game.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>История игр</Text>
      
      <FlatList
        data={localGames}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.gameCard}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.gameTitle}>{item.title}</Text>
              <Text style={styles.gameInfo}>{item.date} • Победитель: {item.winner}</Text>
              <Text style={styles.gameStatus}>Статус: {item.status || 'Finished'}</Text>
            </View>
            
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
  gameCard: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 16, marginBottom: 12, justifyContent: 'space-between', alignItems: 'center' },
  gameTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  gameInfo: { color: '#A0A5B0', fontSize: 14, marginTop: 4 },
  gameStatus: { color: '#6C47FF', fontSize: 12, fontWeight: '600', marginTop: 4 },
  deleteBtn: { backgroundColor: '#EF4444', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }
});
