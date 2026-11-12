import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { apiService } from '../services/api';

export default function RatingScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [totalGames, setTotalGames] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [serverError, setServerError] = useState(null);

  const loadRating = async (fromRefresh = false) => {
    if (fromRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setServerError(null);

    try {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        setIsOnline(false);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      setIsOnline(true);

      if (!apiService || typeof apiService.getGames !== 'function') {
        throw new Error('Сервис apiService не загружен. Проверьте файл api.js');
      }

      // Забираем все партии из Supabase
      const allGames = await apiService.getGames();
      setTotalGames(allGames.length);

      // Подсчитываем победы каждого игрока
      const winsMap = {};
      allGames.forEach(game => {
        const name = game.winner ? game.winner.trim() : '';
        if (name && name !== 'Не определен' && name !== 'Ничья') {
          winsMap[name] = (winsMap[name] || 0) + 1;
        }
      });

      // Сортируем игроков по убыванию побед
      const sortedRating = Object.keys(winsMap)
        .map(name => ({
          name,
          wins: winsMap[name],
          winRate: allGames.length > 0 ? Math.round((winsMap[name] / allGames.length) * 100) : 0
        }))
        .sort((a, b) => b.wins - a.wins);

      setLeaderboard(sortedRating);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
      if (state.isConnected) {
        loadRating(false);
      }
    });

    loadRating(false);
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C47FF" />
        <Text style={styles.loadingText}>Расчет глобального рейтинга...</Text>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>🌐</Text>
        <Text style={styles.errorText}>Нет интернета</Text>
        <Text style={styles.errorSubText}>Проверьте подключение к сети или отключите Режим полета.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadRating(false)}>
          <Text style={styles.retryButtonText}>🔄 Повторить попытку</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (serverError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Ошибка загрузки рейтинга</Text>
        <Text style={styles.errorSubText}>{serverError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadRating(false)}>
          <Text style={styles.retryButtonText}>🔄 Повторить попытку</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>🏆 Рейтинг игроков</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Игр: {totalGames}</Text>
        </View>
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.name}
        renderItem={({ item, index }) => {
          const isFirst = index === 0;
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

          return (
            <View style={[styles.playerCard, isFirst && styles.firstPlaceCard]}>
              <View style={styles.leftInfo}>
                <Text style={styles.rankText}>{medal}</Text>
                <Text style={styles.playerName}>{item.name}</Text>
              </View>
              
              <View style={styles.rightStats}>
                <Text style={styles.winsText}>{item.wins} поб.</Text>
                <Text style={styles.winRateText}>Винрейт: {item.winRate}%</Text>
              </View>
            </View>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadRating(true)}
            tintColor="#6C47FF"
            colors={['#6C47FF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏅</Text>
            <Text style={styles.emptyText}>Рейтинг пока пуст.\nСыграйте первую партию, чтобы определить лидера!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { color: '#ffffff', fontSize: 26, fontWeight: 'bold' },
  badge: { backgroundColor: '#262930', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#6C47FF' },
  badgeText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  
  playerCard: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 16, padding: 18, marginBottom: 12, justifyContent: 'space-between', alignItems: 'center' },
  firstPlaceCard: { borderWidth: 1.5, borderColor: '#EAB308', backgroundColor: '#2A2823' },
  leftInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  rankText: { fontSize: 24, marginRight: 14, color: '#A0A5B0', fontWeight: 'bold' },
  playerName: { color: '#ffffff', fontSize: 19, fontWeight: 'bold' },
  rightStats: { alignItems: 'flex-end' },
  winsText: { color: '#22C55E', fontSize: 18, fontWeight: 'bold' },
  winRateText: { color: '#A0A5B0', fontSize: 13, marginTop: 2 },

  center: { flex: 1, backgroundColor: '#1C1E22', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  loadingText: { color: '#ffffff', marginTop: 10, fontSize: 16 },
  errorIcon: { fontSize: 60, marginBottom: 15 },
  errorText: { color: '#EF4444', fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  errorSubText: { color: '#A0A5B0', fontSize: 15, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  retryButton: { backgroundColor: '#6C47FF', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  retryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 60, marginBottom: 15 },
  emptyText: { color: '#A0A5B0', fontSize: 16, textAlign: 'center', lineHeight: 24 }
});
