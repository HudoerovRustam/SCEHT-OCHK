import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { apiService } from '../services/api';
import { useResponsive } from '../utils/responsive';

const CATEGORIES = [
  { id: 'all', label: '🏆 Все' },
  { id: 'regular', label: '🎮 Игры' },
  { id: 'Шахматы', label: '♟️ Шахматы' },
  { id: 'Шашки', label: '⚪ Шашки' },
  { id: 'Нарды', label: '🎲 Нарды' },
  { id: 'Крестики-нолики', label: '❌ Крестики' },
];

const BOARD_GAMES_NAMES = ['Шахматы', 'Шашки', 'Нарды', 'Крестики-нолики'];
const GAME_ICONS = { 'Шахматы': '♟️', 'Шашки': '⚪', 'Нарды': '🎲', 'Крестики-нолики': '❌' };

export default function RatingScreen() {
  const { isWatch, paddingTop, paddingHorizontal, maxWidth, titleSize } = useResponsive();
  const [allGames, setAllGames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const loadRating = async (fromRefresh = false) => {
    if (fromRefresh) setIsRefreshing(true);
    else if (allGames.length === 0) setIsLoading(true);

    try {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        setIsOnline(false);
        return;
      }
      setIsOnline(true);
      const gamesFromCloud = await apiService.getGames();
      setAllGames(gamesFromCloud);
    } catch (e) {
      setIsOnline(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadRating(false); }, []));

  const { leaderboard, filteredCount } = useMemo(() => {
    const filtered = allGames.filter((game) => {
      const title = (game.title || '').trim();
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'regular') return !BOARD_GAMES_NAMES.includes(title);
      return title === selectedCategory;
    });

    const statsMap = {};
    filtered.forEach((game) => {
      const name = game.winner ? game.winner.trim() : '';
      const gameTitle = game.title ? game.title.trim() : 'Игра';
      if (name && name !== 'Не определен' && name !== 'Ничья') {
        if (!statsMap[name]) statsMap[name] = { wins: 0, gamesSet: new Set() };
        statsMap[name].wins += 1;
        statsMap[name].gamesSet.add(gameTitle);
      }
    });

    const sortedRating = Object.keys(statsMap)
      .map((name) => {
        const { wins, gamesSet } = statsMap[name];
        const gamesFormatted = Array.from(gamesSet).map((t) => `${GAME_ICONS[t] || '🎮'} ${t}`).join(' • ');
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
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>🌐</Text>
        <Text style={styles.errorText}>Нет интернета</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadRating(false)}>
          <Text style={styles.retryButtonText}>🔄 Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop, paddingHorizontal }]}>
      <View style={[styles.innerWrapper, { maxWidth }]}>
        <View style={[styles.headerRow, isWatch && { marginBottom: 8 }]}>
          <Text style={[styles.headerTitle, { fontSize: titleSize }]}>🏆 Рейтинг</Text>
          {!isWatch && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Партий: {filteredCount}</Text>
            </View>
          )}
        </View>

        <View style={[styles.tabsWrapper, isWatch && { marginBottom: 10 }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.tabButton, isActive && styles.tabButtonActive, isWatch && { paddingHorizontal: 10, paddingVertical: 6 }]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive, isWatch && { fontSize: 11 }]}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <FlatList
          data={leaderboard}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item, index }) => {
            const isFirst = index === 0;
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

            return (
              <View style={[styles.playerCard, isFirst && styles.firstPlaceCard, isWatch && { padding: 10, marginBottom: 8, borderRadius: 12 }]}>
                <View style={styles.leftInfo}>
                  <Text style={[styles.rankText, isWatch && { fontSize: 16, marginRight: 8 }]}>{medal}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.playerName, isWatch && { fontSize: 14 }]}>{item.name}</Text>
                    {!isWatch && <Text style={styles.gamesPlayedText} numberOfLines={2}>{item.gamesLabel}</Text>}
                  </View>
                </View>
                
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.winsText, isWatch && { fontSize: 14 }]}>{item.wins} поб.</Text>
                  {!isWatch && <Text style={styles.winRateText}>{item.winRate}%</Text>}
                </View>
              </View>
            );
          }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadRating(true)} tintColor="#6C47FF" />}
          ListEmptyComponent={<Text style={styles.emptyText}>В этой категории пока нет игр.</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', alignItems: 'center' },
  innerWrapper: { flex: 1, width: '100%' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { color: '#fff', fontWeight: 'bold' },
  badge: { backgroundColor: '#262930', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#6C47FF' },
  badgeText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  tabsWrapper: { marginBottom: 16 },
  tabButton: { backgroundColor: '#262930', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#374151' },
  tabButtonActive: { backgroundColor: '#6C47FF', borderColor: '#6C47FF' },
  tabText: { color: '#A0A5B0', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },
  playerCard: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 16, padding: 16, marginBottom: 12, justifyContent: 'space-between', alignItems: 'center' },
  firstPlaceCard: { borderWidth: 1.5, borderColor: '#EAB308', backgroundColor: '#2A2823' },
  leftInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 },
  rankText: { fontSize: 22, marginRight: 12, color: '#A0A5B0', fontWeight: 'bold' },
  playerName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  gamesPlayedText: { color: '#A0A5B0', fontSize: 13, marginTop: 4 },
  winsText: { color: '#22C55E', fontSize: 18, fontWeight: 'bold' },
  winRateText: { color: '#A0A5B0', fontSize: 13, marginTop: 2 },
  center: { flex: 1, backgroundColor: '#1C1E22', justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorIcon: { fontSize: 48, marginBottom: 10 },
  errorText: { color: '#EF4444', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  retryButton: { backgroundColor: '#6C47FF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  retryButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  emptyText: { color: '#A0A5B0', fontSize: 15, textAlign: 'center', marginTop: 50 }
});
