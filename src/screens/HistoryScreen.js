import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { apiService } from '../services/api';
import { useGameStore } from '../store/gameStore';

export default function HistoryScreen() {
  const store = useGameStore();
  const [cloudGames, setCloudGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const loadCloudHistory = async (fromRefresh = false) => {
    if (fromRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const validatedGames = await apiService.getGames(20, 'desc');
      setCloudGames(validatedGames);
      if (store) store.games = validatedGames;

      // Считаем рейтинг побед
      const winsMap = {};
      validatedGames.forEach(game => {
        const name = game.winner;
        if (name && name !== 'Не определен' && name !== 'Ничья') {
          winsMap[name] = (winsMap[name] || 0) + 1;
        }
      });

      const sortedRating = Object.keys(winsMap)
        .map(name => ({ name, wins: winsMap[name] }))
        .sort((a, b) => b.wins - a.wins);

      setLeaderboard(sortedRating);
      setIsOnline(true);
    } catch (error) {
      setIsOnline(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
      if (state.isConnected) {
        loadCloudHistory(false);
      }
    });

    loadCloudHistory(false);
    return () => unsubscribe();
  }, []);

  const handleDeleteGame = async (id) => {
    setCloudGames(prev => prev.filter(g => g.id !== id));
    if (store && typeof store.removeGame === 'function') {
      await store.removeGame(id);
    }
    loadCloudHistory(true);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={styles.loadingText}>Загрузка рейтинга из Supabase...</Text>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>🌐</Text>
        <Text style={styles.errorText}>Нет интернета</Text>
        <Text style={styles.errorSubText}>Проверьте подключение к сети или отключите Режим полета.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadCloudHistory(false)}>
          <Text style={styles.retryButtonText}>🔄 Повторить попытку</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {leaderboard.length > 0 && (
        <View style={styles.ratingBox}>
          <Text style={styles.ratingHeader}>🏆 Рейтинг игроков (Supabase)</Text>
          {leaderboard.map((player, index) => (
            <View key={player.name} style={styles.ratingRow}>
              <Text style={styles.ratingName}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤'} {player.name}
              </Text>
              <Text style={styles.ratingWins}>Побед: {player.wins}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.headerTitle}>История игр </Text>
      
      <FlatList
        data={cloudGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gameCard}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.gameTitle}>{item.title}</Text>
              <Text style={styles.gameInfo}>{item.date} • Победитель: {item.winner}</Text>
              <Text style={styles.gameStatus}>Сохранено в Supabase ✅</Text>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteGame(item.id)}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>❌</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadCloudHistory(true)}
            tintColor="#6C47FF"
            colors={['#6C47FF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>В облаке пока нет партий. Сыграйте матч!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  center: { flex: 1, backgroundColor: '#1C1E22', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  loadingText: { color: '#ffffff', marginTop: 10, fontSize: 16 },
  ratingBox: { backgroundColor: '#262930', borderRadius: 16, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#6C47FF' },
  ratingHeader: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#374151' },
  ratingName: { color: '#E5E7EB', fontSize: 16, fontWeight: '600' },
  ratingWins: { color: '#22C55E', fontSize: 16, fontWeight: 'bold' },
  errorIcon: { fontSize: 60, marginBottom: 15 },
  errorText: { color: '#EF4444', fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  errorSubText: { color: '#A0A5B0', fontSize: 15, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  retryButton: { backgroundColor: '#6C47FF', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  retryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  gameCard: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 16, marginBottom: 12, justifyContent: 'space-between', alignItems: 'center' },
  gameTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  gameInfo: { color: '#A0A5B0', fontSize: 14, marginTop: 4 },
  gameStatus: { color: '#10B981', fontSize: 12, fontWeight: '600', marginTop: 4 },
  deleteBtn: { backgroundColor: '#EF4444', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#A0A5B0', fontSize: 16, textAlign: 'center' }
});
