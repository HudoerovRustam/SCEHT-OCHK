import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { apiService } from '../services/api';
import { useGameStore } from '../store/gameStore';
import { useResponsive } from '../utils/responsive';

export default function HistoryScreen({ navigation }) {
  const store = useGameStore();
  const { isWatch, paddingTop, paddingHorizontal, maxWidth, titleSize } = useResponsive();
  const currentUserEmail = store?.user?.email || '';

  const [cloudGames, setCloudGames] = useState([]);
  const [filterMode, setFilterMode] = useState('mine');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const loadCloudHistory = async (fromRefresh = false) => {
    if (fromRefresh) setIsRefreshing(true);
    else if (cloudGames.length === 0) setIsLoading(true);

    try {
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        setIsOnline(false);
        return;
      }
      setIsOnline(true);
      const allGames = await apiService.getGames();
      setCloudGames(allGames);
    } catch (error) {
      setIsOnline(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadCloudHistory(false); }, []));

  const handleDeleteGame = async (item) => {
    if (item.user_email !== currentUserEmail) return;
    setCloudGames(prev => prev.filter(g => g.id !== item.id));
    if (store?.removeGame) await store.removeGame(item.id);
  };

  const handleLogout = async () => {
    await store.setUser(null);
    navigation.replace('Login');
  };

  const displayedGames = filterMode === 'mine' 
    ? cloudGames.filter(g => g.user_email === currentUserEmail) 
    : cloudGames;

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
        <TouchableOpacity style={styles.retryButton} onPress={() => loadCloudHistory(false)}>
          <Text style={styles.retryButtonText}>🔄 Повторить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop, paddingHorizontal }]}>
      <View style={[styles.innerWrapper, { maxWidth }]}>
        {!isWatch && (
          <View style={styles.accountBar}>
            <Text style={styles.accountEmail} numberOfLines={1}>👤 {currentUserEmail || 'Гость'}</Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Выйти</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.headerTitle, { fontSize: titleSize }]}>История игр</Text>

        <View style={[styles.filterRow, isWatch && { marginBottom: 8, gap: 6 }]}>
          <TouchableOpacity style={[styles.filterBtn, filterMode === 'mine' && styles.filterBtnActive, isWatch && { paddingVertical: 6 }]} onPress={() => setFilterMode('mine')}>
            <Text style={[styles.filterText, filterMode === 'mine' && styles.filterTextActive, isWatch && { fontSize: 11 }]}>Мои</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, filterMode === 'all' && styles.filterBtnActive, isWatch && { paddingVertical: 6 }]} onPress={() => setFilterMode('all')}>
            <Text style={[styles.filterText, filterMode === 'all' && styles.filterTextActive, isWatch && { fontSize: 11 }]}>Все</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={displayedGames}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => {
            const isMyGame = item.user_email === currentUserEmail;
            return (
              <View style={[styles.gameCard, isWatch && { padding: 10, marginBottom: 8, borderRadius: 10 }]}>
                <View style={{ flex: 1, paddingRight: 6 }}>
                  <Text style={[styles.gameTitle, isWatch && { fontSize: 13 }]}>{item.title}</Text>
                  <Text style={[styles.gameInfo, isWatch && { fontSize: 11 }]}>🏆 {item.winner}</Text>
                  {!isWatch && (
                    <Text style={styles.ownerText}>
                      {isMyGame ? '✅ Ваша партия' : `🔒 ${item.user_email || 'Аноним'}`}
                    </Text>
                  )}
                </View>

                {isMyGame && (
                  <TouchableOpacity style={[styles.deleteBtn, isWatch && { width: 26, height: 26 }]} onPress={() => handleDeleteGame(item)}>
                    <Text style={{ color: '#fff', fontSize: isWatch ? 10 : 12 }}>❌</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadCloudHistory(true)} tintColor="#6C47FF" />}
          ListEmptyComponent={<Text style={styles.emptyText}>Партий пока нет.</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', alignItems: 'center' },
  innerWrapper: { flex: 1, width: '100%' },
  accountBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#262930', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginBottom: 15 },
  accountEmail: { color: '#E5E7EB', fontSize: 14, fontWeight: '600', flex: 1, marginRight: 10 },
  logoutBtn: { backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#EF4444', fontSize: 13, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  filterBtn: { flex: 1, backgroundColor: '#262930', paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  filterBtnActive: { backgroundColor: '#6C47FF', borderColor: '#6C47FF' },
  filterText: { color: '#A0A5B0', fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  gameCard: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 16, marginBottom: 12, justifyContent: 'space-between', alignItems: 'center' },
  gameTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  gameInfo: { color: '#A0A5B0', fontSize: 14, marginTop: 3 },
  ownerText: { color: '#10B981', fontSize: 12, fontWeight: '600', marginTop: 4 },
  deleteBtn: { backgroundColor: '#EF4444', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, backgroundColor: '#1C1E22', justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorIcon: { fontSize: 48, marginBottom: 10 },
  errorText: { color: '#EF4444', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  retryButton: { backgroundColor: '#6C47FF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  retryButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  emptyText: { color: '#A0A5B0', fontSize: 15, textAlign: 'center', marginTop: 40 }
});
