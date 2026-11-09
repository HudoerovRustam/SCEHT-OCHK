import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function PlayersScreen({ navigation }) {
  const store = useGameStore();

  // Локальный стейт для инпута
  const [playerName, setPlayerName] = useState('');
  
  // Локальный стейт списка игроков
  const [localPlayers, setLocalPlayers] = useState([
    { id: '1', name: 'Игрок 1', avatar: '🏃' },
    { id: '2', name: 'Игрок 2', avatar: '🎯' },
    { id: '3', name: 'Игрок 3', avatar: '🎲' },
    { id: '4', name: 'Игрок 4', avatar: '🐷' },
  ]);

  // Функция добавления игрока (работает напрямую с локальным стейтом)
  const handleAddPlayer = () => {
    if (!playerName || playerName.trim() === '') return;

    const avatars = ['🏃', '🎯', '🎲', '🐷', '🦄', '🦁', '🦊', '🐱', '👤'];
    const newPlayer = {
      id: Date.now().toString(),
      name: playerName.trim(),
      avatar: avatars[localPlayers.length % avatars.length]
    };

    setLocalPlayers([...localPlayers, newPlayer]);
    setPlayerName(''); // Очищаем поле ввода
    Keyboard.dismiss(); // Прячем клавиатуру
  };

  // Функция удаления игрока
  const handleRemovePlayer = (id) => {
    setLocalPlayers(prev => prev.filter(p => p.id !== id));
  };

  // Переход к игре с сохранением финального списка в глобальный стор
  const handleStartGame = () => {
    if (store) {
      store.activePlayers = [...localPlayers];
      if (typeof store.resetActiveScores === 'function') {
        store.resetActiveScores();
      }
    }
    navigation.navigate('Game');
  };

  return (
    <View style={styles.container}>
      
      {/* Шапка — ТЕПЕРЬ ТУТ ЧИСТО, НЕТ НИКАКИХ ШЕСТЕРЁНОК */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Игроки</Text>
      </View>

      {/* Поле ввода и кнопка плюс */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Введите имя..."
          placeholderTextColor="#6B7280"
          value={playerName}
          onChangeText={(text) => setPlayerName(text)}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer} activeOpacity={0.7}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Список участников */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {localPlayers.map((item) => (
          <View key={item.id} style={styles.playerRow}>
            <View style={styles.playerInfo}>
              <Text style={styles.avatar}>{item.avatar}</Text>
              <Text style={styles.playerName}>{item.name}</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemovePlayer(item.id)}>
              <Text style={styles.deleteButtonText}>❌</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Кнопка Старт */}
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
  inputContainer: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#D1D5DB', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, color: '#000000', fontSize: 16, marginRight: 10 },
  addButton: { backgroundColor: '#6C47FF', width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  list: { paddingBottom: 20 },
  playerRow: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  playerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { fontSize: 24, marginRight: 15 },
  playerName: { color: '#ffffff', fontSize: 18, fontWeight: '500' },
  deleteButton: { backgroundColor: '#EF4444', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  deleteButtonText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  startButton: { backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 30 },
  startButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' }
});
