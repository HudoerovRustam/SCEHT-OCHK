import React, { useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function HistoryScreen() {
  const { games, isLoading, fetchGames, removeGame } = useGameStore();

  useEffect(() => {
    fetchGames();
  }, []);

  if (isLoading) {
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
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gameCard}>
            <View>
              <Text style={styles.gameTitle}>{item.title}</Text>
              <Text style={styles.gameInfo}>{item.date} • Победитель: {item.winner}</Text>
              <Text style={styles.gameStatus}>Статус: {item.status}</Text>
            </View>
            
            <TouchableOpacity style={styles.deleteBtn} onPress={() => removeGame(item.id)}>
              <Text style={{ color: '#fff', fontSize: 12 }}>❌</Text>
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
  deleteBtn: { backgroundColor: '#EF4444', width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }
});
