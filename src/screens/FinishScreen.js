import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function FinishScreen({ route, navigation }) {
  const store = useGameStore();
  const players = store?.activePlayers || [];
  const { gameName } = route.params || { gameName: 'Игра' };

  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winnerName = sortedPlayers.length > 0 ? sortedPlayers[0].name : 'Участник';
  const maxScore = sortedPlayers.length > 0 ? sortedPlayers[0].score : 0;

  const handleGoHome = () => {
    if (store && typeof store.addGame === 'function') {
      store.addGame({
        title: gameName,
        winner: winnerName
      });
    }
    if (store && typeof store.resetActiveScores === 'function') {
      store.resetActiveScores();
    }
    navigation.navigate('MainTabs');
  };

  const handleNewGame = () => {
    if (store && typeof store.addGame === 'function') {
      store.addGame({ 
        title: gameName,
        winner: winnerName 
      });
    }
    if (store && typeof store.resetActiveScores === 'function') {
      store.resetActiveScores();
    }
    navigation.navigate('NewGame');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Игра завершена!</Text>

      <View style={styles.winnerCard}>
        <Text style={styles.winnerLabel}>ПОБЕДИТЕЛЬ</Text>
        <Text style={styles.winnerName}>{winnerName}</Text>
      </View>

      <Text style={styles.resultsLabel}>Итоговые результаты:</Text>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {sortedPlayers.map((item) => {
          const isWinner = item.score === maxScore && maxScore > 0;
          return (
            <View key={item.id} style={styles.playerRow}>
              <View style={styles.playerInfo}>
                <Text style={styles.avatar}>{item.avatar || '👤'}</Text>
                <Text style={styles.playerName}>{item.name}</Text>
              </View>
              <Text style={styles.playerScore}>
                {item.score || 0} {isWinner ? '👑' : ''}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNewGame}>
          <Text style={styles.buttonText}>Новая игра</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleGoHome}>
          <Text style={styles.buttonText}>На главную</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 60, paddingHorizontal: 20 },
  headerTitle: { color: '#ffffff', fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 },
  winnerCard: { backgroundColor: '#14532D', borderRadius: 16, paddingVertical: 20, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#166534' },
  winnerLabel: { color: '#CA8A04', fontSize: 14, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  winnerName: { color: '#22C55E', fontSize: 36, fontWeight: 'bold' },
  resultsLabel: { color: '#A0A5B0', fontSize: 16, fontWeight: '600', marginBottom: 15 },
  list: { paddingBottom: 20 },
  playerRow: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  playerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { fontSize: 24, marginRight: 15 },
  playerName: { color: '#ffffff', fontSize: 18, fontWeight: '500' },
  playerScore: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  footer: { marginBottom: 35, gap: 12 },
  primaryButton: { backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  secondaryButton: { backgroundColor: '#262930', paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
