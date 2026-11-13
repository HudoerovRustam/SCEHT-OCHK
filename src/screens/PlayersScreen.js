import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Keyboard, Alert } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { useResponsive } from '../utils/responsive';

export default function PlayersScreen({ route, navigation }) {
  const store = useGameStore();
  const { isWatch, paddingTop, paddingHorizontal, maxWidth, titleSize } = useResponsive();
  const { gameName, isTimerMode } = route.params || { gameName: 'Игра', isTimerMode: false };
  
  const [playerName, setPlayerName] = useState('');
  const [localPlayers, setLocalPlayers] = useState([]);

  useEffect(() => {
    if (store?.activePlayers) setLocalPlayers(store.activePlayers);
  }, [store?.activePlayers]);

  const handleAddPlayer = () => {
    if (playerName.trim() === '') return;
    const avatars = ['🏃', '🎯', '🎲', '🐷', '🦄', '🦁', '🦊', '🐱'];
    const newPlayer = {
      id: Date.now().toString(),
      name: playerName.trim(),
      avatar: avatars.at(localPlayers.length % avatars.length),
      score: 0
    };
    const updated = [...localPlayers, newPlayer];
    setLocalPlayers(updated);
    if (store) store.activePlayers = updated;
    setPlayerName('');
    Keyboard.dismiss();
  };

  const handleUpdatePlayerName = (id, newText) => {
    const updated = localPlayers.map(player => player.id === id ? { ...player, name: newText } : player);
    setLocalPlayers(updated);
    if (store) store.activePlayers = updated;
  };

  const handleRemovePlayer = (id) => {
    const updated = localPlayers.filter(p => p.id !== id);
    setLocalPlayers(updated);
    if (store) store.activePlayers = updated;
  };

  const handleStartGame = () => {
    if (localPlayers.length < 2) {
      Alert.alert('Мало игроков', 'Минимум 2 участника.');
      return;
    }
    if (localPlayers.some(player => !player.name || player.name.trim() === '')) {
      Alert.alert('Заполните имена', 'Введите имена всех игроков.');
      return;
    }
    const cleanedPlayers = localPlayers.map(p => ({ ...p, name: p.name.trim(), score: 0 }));
    if (store) store.activePlayers = cleanedPlayers;
    navigation.navigate('Game', { gameName, isTimerMode });
  };

  return (
    <View style={[styles.container, { paddingTop, paddingHorizontal }]}>
      <View style={[styles.innerWrapper, { maxWidth }]}>
        <View style={[styles.header, isWatch && { marginBottom: 10 }]}>
          <TouchableOpacity style={[styles.backButton, isWatch && styles.backBtnWatch]} onPress={() => navigation.goBack()}>
            <Text style={[styles.backArrow, isWatch && { fontSize: 14 }]}>❮</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontSize: titleSize, marginLeft: isWatch ? 10 : 20 }]}>Игроки</Text>
        </View>

        <View style={[styles.inputContainer, isWatch && { height: 38, marginBottom: 10 }]}>
          <TextInput
            style={[styles.input, isWatch && { paddingVertical: 6, fontSize: 12 }]}
            placeholder="Добавить..."
            placeholderTextColor="#6B7280"
            value={playerName}
            onChangeText={setPlayerName}
          />
          <TouchableOpacity style={[styles.addButton, isWatch && { width: 38, height: 38 }]} onPress={handleAddPlayer}>
            <Text style={[styles.addButtonText, isWatch && { fontSize: 18 }]}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={localPlayers}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 10 }}
          renderItem={({ item, index }) => (
            <View style={[styles.playerRow, isWatch && { padding: 8, marginBottom: 6, borderRadius: 10 }]}>
              <View style={styles.playerInfo}>
                {!isWatch && <Text style={styles.avatar}>{item.avatar}</Text>}
                <TextInput
                  style={[styles.playerInputName, isWatch && { fontSize: 13 }]}
                  value={item.name}
                  onChangeText={(text) => handleUpdatePlayerName(item.id, text)}
                  placeholder={`Игрок ${index + 1}...`}
                  placeholderTextColor="#6B7280"
                />
              </View>
              <TouchableOpacity style={[styles.deleteButton, isWatch && { width: 26, height: 26 }]} onPress={() => handleRemovePlayer(item.id)}>
                <Text style={{ color: '#fff', fontSize: isWatch ? 10 : 12 }}>❌</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <TouchableOpacity style={[styles.startButton, isWatch && { paddingVertical: 10, borderRadius: 10, marginBottom: 10 }]} onPress={handleStartGame}>
          <Text style={[styles.startButtonText, isWatch && { fontSize: 14 }]}>Начать</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', alignItems: 'center' },
  innerWrapper: { flex: 1, width: '100%' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backBtnWatch: { width: 30, height: 30, borderRadius: 8 },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerTitle: { color: '#fff', fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', marginBottom: 16, alignItems: 'center', width: '100%', height: 50 },
  input: { flex: 1, backgroundColor: '#D1D5DB', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, color: '#000', fontSize: 16, marginRight: 8, height: '100%' },
  addButton: { backgroundColor: '#6C47FF', width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  playerRow: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 14, padding: 14, alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  playerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  avatar: { fontSize: 24, marginRight: 12 },
  playerInputName: { color: '#fff', fontSize: 16, fontWeight: '500', flex: 1, paddingVertical: 2 },
  deleteButton: { backgroundColor: '#EF4444', width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  startButton: { backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 25, marginTop: 8 },
  startButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
