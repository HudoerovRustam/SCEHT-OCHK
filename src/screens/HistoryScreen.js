import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { API_CONFIG } from '../services/api';

export default function HistoryScreen() {
  const [networkGames, setNetworkGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [httpStatus, setHttpStatus] = useState(null);
  useEffect(() => {
    const loadDataFromServer = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GAMES_LIST}`);
        setHttpStatus(response.status);
        console.log(`[Metro/Expo Terminal] HTTP Status: ${response.status} OK`);

        if (response.ok) {
          const json = await response.json();
          const mappedGames = json.map(item => ({
            id: item.id.toString(),
            title: `Партия #${item.id}`,
            date: 'Сегодня',
            winner: item.completed ? 'Игрок 1 (Победа)' : 'Ничья',
            status: item.completed ? 'Finished' : 'In Progress'
          }));

          setNetworkGames(mappedGames);
        }
      } catch (error) {
        console.error("Сетевая ошибка при запросе к API:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDataFromServer();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Запрос к REST API...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Сетевая история</Text>
      {httpStatus === 200 && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>🟢 Server Status: 200 OK (Данные из сети)</Text>
        </View>
      )}

      <FlatList
        data={networkGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gameCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.gameTitle}>{item.title}</Text>
              <Text style={styles.gameInfo}>{item.date} • {item.winner}</Text>
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
  headerTitle: { color: '#ffffff', fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  statusBadge: { backgroundColor: '#14532D', padding: 8, borderRadius: 8, marginBottom: 15 },
  statusText: { color: '#22C55E', fontWeight: 'bold', fontSize: 13, textAlign: 'center' },
  center: { flex: 1, backgroundColor: '#1C1E22', justifyContent: 'center', alignItems: 'center' },
  gameCard: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 16, marginBottom: 12 },
  gameTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  gameInfo: { color: '#A0A5B0', fontSize: 14, marginTop: 4 },
  gameStatus: { color: '#6C47FF', fontSize: 12, fontWeight: '600', marginTop: 4 }
});
