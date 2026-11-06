import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';

export default function PlayersScreen({ navigation }) {
  const [playerName, setPlayerName] = useState('');
  const [players, setPlayers] = useState([
    { id: '1', name: 'Игрок 1', avatar: '🏃' },
    { id: '2', name: 'Игрок 2', avatar: '🎯' },
    { id: '3', name: 'Игрок 3', avatar: '🎲' },
    { id: '4', name: 'Игрок 4', avatar: '🐷' },
  ]);

  // Функция добавления нового игрока
  const addPlayer = () => {
    if (playerName.trim() === '') return;
    const newPlayer = {
      id: Date.now().toString(),
      name: playerName,
      avatar: '👤' // Стандартный аватар
    };
    setPlayers([...players, newPlayer]);
    setPlayerName('');
  };

  // Функция удаления игрока
  const removePlayer = (id) => {
    setPlayers(players.filter(player => player.id !== id));
  };

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Игроки</Text>
      </View>

      {/* Поле ввода нового игрока */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Введите имя..."
          placeholderTextColor="#6B7280"
          value={playerName}
          onChangeText={setPlayerName}
        />
        <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Список игроков */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.playerRow}>
            <View style={styles.playerInfo}>
              <Text style={styles.avatar}>{item.avatar}</Text>
              <Text style={styles.playerName}>{item.name}</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => removePlayer(item.id)}>
              <Text style={styles.deleteButtonText}>❌</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Кнопка "Начать игру" */}
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => navigation.navigate('Game', { playersList: players })}
      >
        <Text style={styles.startButtonText}>Начать игру</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyCenter: 'center', display: 'flex', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000000', textAlign: 'center' },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginLeft: 20 },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: { flex: 1, backgroundColor: '#D1D5DB', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, color: '#000000', fontSize: 16, marginRight: 10 },
  addButton: { backgroundColor: '#6B7280', width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  list: { paddingBottom: 20 },
  playerRow: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  playerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { fontSize: 24, marginRight: 15 },
  playerName: { color: '#ffffff', fontSize: 18, fontWeight: '500' },
  deleteButton: { backgroundColor: '#DC2626', width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deleteButtonText: { color: '#ffffff', fontSize: 12 },
  startButton: { backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 30 } /* Фиолетовая кнопка */,
  startButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
