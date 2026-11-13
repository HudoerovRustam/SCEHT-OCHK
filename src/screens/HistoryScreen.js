import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { apiService } from '../services/api';
import { useGameStore } from '../store/gameStore';

export default function HistoryScreen({ navigation }) {
  const store = useGameStore();
  const currentUserEmail = store?.user?.email || '';

  const [cloudGames, setCloudGames] = useState([]);
  const [filterMode, setFilterMode] = useState('mine');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const loadCloudHistory = async (fromRefresh = false) => {
    if (fromRefresh) setIsRefreshing(true);
    else setIsLoading(true);

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

  useEffect(() => {
    loadCloudHistory(false);
  }, []);

  const handleDeleteGame = async (item) => {
    if (item.user_email !== currentUserEmail) return;

    setCloudGames(prev => prev.filter(g => g.id !== item.id));
    if (store && typeof store.removeGame === 'function') {
      await store.removeGame(item.id);
    }
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
        <Text style={styles.loadingText}>Загрузка истории...</Text>
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
      <View style={styles.accountBar}>
        <Text style={styles.accountEmail} numberOfLines={1}>👤 {currentUserEmail || 'Гость'}</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.headerTitle}>История игр</Text>

      <View style={styles.filterRow}>
        <TouchableOpacity 
          style={[styles.filterBtn, filterMode === 'mine' && styles.filterBtnActive]} 
          onPress={() => setFilterMode('mine')}
        >
          <Text style={[styles.filterText, filterMode === 'mine' && styles.filterTextActive]}>Мои партии</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, filterMode === 'all' && styles.filterBtnActive]} 
          onPress={() => setFilterMode('all')}
        >
          <Text style={[styles.filterText, filterMode === 'all' && styles.filterTextActive]}>Общая лента</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={displayedGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMyGame = item.user_email === currentUserEmail;

          return (
            <View style={styles.gameCard}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.gameTitle}>{item.title}</Text>
                <Text style={styles.gameInfo}>{item.date} • Победитель: {item.winner}</Text>
                <Text style={styles.ownerText}>
                  {isMyGame ? '✅ Ваша партия' : `🔒 Игрок: ${item.user_email || 'Аноним'}`}
                </Text>
              </View>

              {isMyGame && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteGame(item)}>
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>❌</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
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
            <Text style={styles.emptyText}>
              {filterMode === 'mine' ? 'На вашем аккаунте пока нет сыгранных партий.' : 'В облаке пока нет игр.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  accountBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#262930', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginBottom: 15 },
  accountEmail: { color: '#E5E7EB', fontSize: 14, fontWeight: '600', flex: 1, marginRight: 10 },
  logoutBtn: { backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#EF4444', fontSize: 13, fontWeight: 'bold' },
  headerTitle: { color: '#ffffff', fontSize: 26, fontWeight: 'bold', marginBottom: 15 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  filterBtn: { flex: 1, backgroundColor: '#262930', paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  filterBtnActive: { backgroundColor: '#6C47FF', borderColor: '#6C47FF' },
  filterText: { color: '#A0A5B0', fontSize: 14, fontWeight: '600' },
  filterTextActive: { color: '#ffffff', fontWeight: 'bold' },
  gameCard: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 16, marginBottom: 12, justifyContent: 'space-between', alignItems: 'center' },
  gameTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  gameInfo: { color: '#A0A5B0', fontSize: 14, marginTop: 4 },
  ownerText: { color: '#10B981', fontSize: 12, fontWeight: '600', marginTop: 4 },
  deleteBtn: { backgroundColor: '#262930', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, backgroundColor: '#1C1E22', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  loadingText: { color: '#ffffff', marginTop: 10, fontSize: 16 },
  errorIcon: { fontSize: 60, marginBottom: 15 },
  errorText: { color: '#EF4444', fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  errorSubText: { color: '#A0A5B0', fontSize: 15, textAlign: 'center', marginBottom: 25 },
  retryButton: { backgroundColor: '#6C47FF', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  retryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#A0A5B0', fontSize: 16, textAlign: 'center' }
});
