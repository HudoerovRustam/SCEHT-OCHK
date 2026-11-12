import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function GameScreen({ route, navigation }) {
  const store = useGameStore();
  const { gameName } = route.params || { gameName: 'Партия' };
  
  // Ловим флаг режима таймера (если не передан — по дефолту false)
  const isTimerMode = route.params?.isTimerMode || false;

  const [matchPlayers, setMatchPlayers] = useState([]);

  useEffect(() => {
    if (store && store.activePlayers) {
      setMatchPlayers(store.activePlayers);
    }
  }, [store?.activePlayers]);

  const changeScore = (id, amount) => {
    const updated = matchPlayers.map(player => {
      if (player.id === id) {
        return { ...player, score: Math.max(0, (player.score || 0) + amount) };
      }
      return player;
    });
    setMatchPlayers(updated);
    if (store) store.activePlayers = updated;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{gameName}</Text>
      </View>

      {isTimerMode && (
        <TouchableOpacity style={styles.timerBadge} onPress={() => navigation.navigate('Timer')}>
          <Text style={styles.timerText}>⏱️  00:15:00</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={matchPlayers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingTop: isTimerMode ? 0 : 15 }}
        renderItem={({ item }) => (
          <View style={styles.playerCard}>
            <View style={styles.playerInfo}>
              <Text style={styles.avatar}>{item.avatar || '🎲'}</Text>
              <View style={{ marginLeft: 15 }}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={styles.playerScore}>{item.score || 0}</Text>
              </View>
            </View>
            
            <View style={styles.controls}>
              <TouchableOpacity style={styles.plusButton} onPress={() => changeScore(item.id, 1)}>
                <Text style={styles.controlText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.minusButton} onPress={() => changeScore(item.id, -1)}>
                <Text style={styles.controlText}>−</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.diceButton} onPress={() => navigation.navigate('RollDice')}>
          <Text style={styles.buttonText}>🎲  Бросить кубик</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishButton} onPress={() => navigation.navigate('Finish', { gameName })}>
          <Text style={styles.buttonText}>🏁  Завершить игру</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginLeft: 20 },
  timerBadge: { backgroundColor: '#E5E7EB', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, alignSelf: 'center', marginBottom: 25 },
  timerText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
  playerCard: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  playerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { fontSize: 32 },
  playerName: { color: '#A0A5B0', fontSize: 16, fontWeight: '500' },
  playerScore: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  controls: { flexDirection: 'row' },
  plusButton: { backgroundColor: '#10B981', width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  minusButton: { backgroundColor: '#EF4444', width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  controlText: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  footer: { marginBottom: 30 },
  diceButton: { backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  finishButton: { backgroundColor: '#4F46E5', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
