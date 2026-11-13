import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { apiService } from '../services/api';

const CATEGORIES = [
  { id: 'all', label: '🏆 Все игры' },
  { id: 'regular', label: '🎮 Просто игры' },
  { id: 'Шахматы', label: '♟️ Шахматы' },
  { id: 'Шашки', label: '⚪ Шашки' },
  { id: 'Нарды', label: '🎲 Нарды' },
  { id: 'Крестики-нолики', label: '❌ Крестики-нолики' },
];

const BOARD_GAMES_NAMES = ['Шахматы', 'Шашки', 'Нарды', 'Крестики-нолики'];

const GAME_ICONS = {
  'Шахматы': '♟️',
  'Шашки': '⚪',
  'Нарды': '🎲',
  'Крестики-нолики': '❌',
};

export default function RatingScreen() {
  const [allGames, setAllGames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [serverError, setServerError] = useState(null);

  const loadRating = async (fromRefresh = false) => {
    if (fromRefresh) setIsRefreshing(true);
    else if (allGames.length === 0) setIsLoading(true);
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

      const gamesFromCloud = await apiService.getGames();
      setAllGames(gamesFromCloud);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRating(false);
    }, [])
  );

  const { leaderboard, filteredCount } = useMemo(() => {
    const filtered = allGames.filter((game) => {
      const title = (game.title || '').trim();
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'regular') {
        return !BOARD_GAMES_NAMES.includes(title);
      }
      return title === selectedCategory;
    });

    const statsMap = {};
    filtered.forEach((game) => {
      const name = game.winner ? game.winner.trim() : '';
      const gameTitle = game.title ? game.title.trim() : 'Игра';

      if (name && name !== 'Не определен' && name !== 'Ничья') {
        if (!statsMap[name]) {
          statsMap[name] = { wins: 0, gamesSet: new Set() };
        }
        statsMap[name].wins += 1;
        statsMap[name].gamesSet.add(gameTitle);
      }
    });

    const sortedRating = Object.keys(statsMap)
      .map((name) => {
        const { wins, gamesSet } = statsMap[name];
        const gamesFormatted = Array.from(gamesSet)
          .map((title) => `${GAME_ICONS[title] || '🎮'} ${title}`)
          .join('  •  ');

        return {
          name,
          wins,
          gamesLabel: gamesFormatted,
          winRate: filtered.length > 0 ? Math.round((wins / filtered.length) * 100) : 0
        };
      })
      .sort((a, b) => b.wins - a.wins);

    return { leaderboard: sortedRating, filteredCount: filtered.length };
  }, [allGames, selectedCategory]);

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
        <Text style={styles.headerTitle}>🏆 Рейтинг</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Партий: {filteredCount}</Text>
        </View>
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabsContainer}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
                <View style={styles.nameColumn}>
                  <Text style={styles.playerName}>{item.name}</Text>
                  <Text style={styles.gamesPlayedText} numberOfLines={2}>
                    {item.gamesLabel}
                  </Text>
                </View>
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
            <Text style={styles.emptyText}>В этой категории пока нет сыгранных партий.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { color: '#ffffff', fontSize: 26, fontWeight: 'bold' },
  badge: { backgroundColor: '#262930', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#6C47FF' },
  badgeText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },

  tabsWrapper: { marginBottom: 18 },
  tabsContainer: { gap: 8, paddingRight: 10 },
  tabButton: { backgroundColor: '#262930', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#374151' },
  tabButtonActive: { backgroundColor: '#6C47FF', borderColor: '#6C47FF' },
  tabText: { color: '#A0A5B0', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#ffffff', fontWeight: 'bold' },

  playerCard: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 16, padding: 16, marginBottom: 12, justifyContent: 'space-between', alignItems: 'center' },
  firstPlaceCard: { borderWidth: 1.5, borderColor: '#EAB308', backgroundColor: '#2A2823' },
  leftInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 10 },
  rankText: { fontSize: 24, marginRight: 12, color: '#A0A5B0', fontWeight: 'bold' },
  nameColumn: { flex: 1 },
  playerName: { color: '#ffffff', fontSize: 19, fontWeight: 'bold' },
  gamesPlayedText: { color: '#A0A5B0', fontSize: 13, marginTop: 4, fontWeight: '500' },
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
  emptyContainer: { alignItems: 'center', marginTop: 70 },
  emptyIcon: { fontSize: 55, marginBottom: 12 },
  emptyText: { color: '#A0A5B0', fontSize: 16, textAlign: 'center' }
});
