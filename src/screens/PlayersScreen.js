import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function PlayersScreen({ route, navigation }) {
  const store = useGameStore();
  const { gameName } = route.params || { gameName: 'Игра' };
  
  const [playerName, setPlayerName] = useState('');
  const [localPlayers, setLocalPlayers] = useState([]);

  useEffect(() => {
    if (store && store.activePlayers) {
      setLocalPlayers(store.activePlayers);
    }
  }, []);

  const handleAddPlayer = () => {
    if (playerName.trim() === '') return;

    const avatars = ['🏃', '🎯', '🎲', '🐷', '🦄', '🦁', '🦊', '🐱'];
    const newPlayer = {
      id: Date.now().toString(),
      name: playerName.trim(),
      avatar: avatars[localPlayers.length % avatars.length],
      score: 0
    };

    const updated = [...localPlayers, newPlayer];
    setLocalPlayers(updated);
    if (store) store.activePlayers = updated;

    setPlayerName('');
    Keyboard.dismiss();
  };

  const handleRemovePlayer = (id) => {
    const updated = localPlayers.filter(p => p.id !== id);
    setLocalPlayers(updated);
    if (store) store.activePlayers = updated;
  };

  const handleStartGame = () => {
    if (store) {
      store.activePlayers = localPlayers.map(p => ({ ...p, score: 0 }));
    }
    navigation.navigate('Game', { gameName });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Игроки</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Введите имя..."
          placeholderTextColor="#6B7280"
          value={playerName}
          onChangeText={setPlayerName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={localPlayers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.playerRow}>
            <View style={styles.playerInfo}>
              <Text style={styles.avatar}>{item.avatar}</Text>
              <Text style={styles.playerName}>{item.name}</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemovePlayer(item.id)}>
              <Text style={styles.deleteButtonText}>❌</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
        <Text style={styles.startButtonText}>Начать игру</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginLeft: 20 },
  inputContainer: { flexDirection: 'row', marginBottom: 20, alignItems: 'center', width: '100%', height: 50 },
  input: { flex: 1, backgroundColor: '#D1D5DB', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, color: '#000000', fontSize: 16, marginRight: 10, height: '100%' },
  addButton: { backgroundColor: '#6C47FF', width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  playerRow: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  playerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { fontSize: 24, marginRight: 15 },
  playerName: { color: '#ffffff', fontSize: 18, fontWeight: '500' },
  deleteButton: { backgroundColor: '#EF4444', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  deleteButtonText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  startButton: { backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 30 },
  startButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
