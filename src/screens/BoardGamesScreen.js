import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function BoardGamesScreen({ navigation }) {
  const store = useGameStore();
  
  const [selectedGame, setSelectedGame] = useState('Шашки');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const gamesList = [
    { name: 'Шахматы', icon: '♟️' },
    { name: 'Шашки', icon: '⚪' },
    { name: 'Нарды', icon: '🎲' },
    { name: 'Крестики-нолики', icon: '❌' }
  ];

  const validatePlayers = () => {
    const p1 = player1.trim();
    const p2 = player2.trim();

    if (!p1 || !p2) {
      Alert.alert('Заполните имена', 'Пожалуйста, обязательно введите имена обоих соперников перед началом игры.');
      return false;
    }
    return true;
  };

  const handleSelectGame = (gameName) => {
    if (!validatePlayers()) return;

    const params = {
      player1: player1.trim(),
      player2: player2.trim()
    };

    if (gameName === 'Шахматы') return navigation.navigate('ChessGame', params);
    if (gameName === 'Шашки') return navigation.navigate('CheckersGame', params);
    if (gameName === 'Нарды') return navigation.navigate('BackgammonGame', params);
    if (gameName === 'Крестики-нолики') return navigation.navigate('TicTacToe', params);

    setSelectedGame(gameName);
  };

  const handleRecordWin = async (winnerName) => {
    if (!validatePlayers()) return;

    const cleanWinner = winnerName.trim();
    setIsSaving(true);
    try {
      if (store && typeof store.addGame === 'function') {
        await store.addGame({
          title: selectedGame,
          winner: cleanWinner
        });
      }
      Alert.alert(
        'Победа записана! 🏆', 
        `Игра: ${selectedGame}\nПобедитель: ${cleanWinner}\n\nРезультат сохранен в Supabase и учтен в рейтинге.`
      );
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить партию в облако.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>♟️ Настольные игры</Text>
      <Text style={styles.subTitle}>Введите имена соперников и выберите игру</Text>

      <Text style={styles.sectionLabel}>Участники партии:</Text>
      
      <View style={styles.playerBox}>
        <Text style={styles.playerTag}>Соперник 1 (Белые / Крестики)</Text>
        <TextInput
          style={styles.input}
          value={player1}
          onChangeText={setPlayer1}
          placeholder="Введите имя первого игрока..."
          placeholderTextColor="#6B7280"
        />
        <TouchableOpacity 
          style={styles.winButton} 
          onPress={() => handleRecordWin(player1)}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.winButtonText}>
              {player1.trim() ? `🏆 Победил ${player1.trim()}` : '🏆 Записать победу Соперника 1'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.playerBox}>
        <Text style={styles.playerTag}>Соперник 2 (Чёрные / Нолики)</Text>
        <TextInput
          style={styles.input}
          value={player2}
          onChangeText={setPlayer2}
          placeholder="Введите имя второго игрока..."
          placeholderTextColor="#6B7280"
        />
        <TouchableOpacity 
          style={[styles.winButton, styles.winButtonSecond]} 
          onPress={() => handleRecordWin(player2)}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.winButtonText}>
              {player2.trim() ? `🏆 Победил ${player2.trim()}` : '🏆 Записать победу Соперника 2'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Выберите игру на доске:</Text>

      <View style={styles.gamesGrid}>
        {gamesList.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.gameCard}
            onPress={() => handleSelectGame(item.name)}
          >
            <Text style={styles.gameIcon}>{item.icon}</Text>
            <Text style={styles.gameName}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  headerTitle: { color: '#ffffff', fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
  subTitle: { color: '#A0A5B0', fontSize: 13, marginBottom: 16 },
  sectionLabel: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  playerBox: { backgroundColor: '#262930', borderRadius: 14, padding: 14, marginBottom: 12 },
  playerTag: { color: '#A0A5B0', fontSize: 12, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#1C1E22', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, color: '#ffffff', fontSize: 15, marginBottom: 10, borderWidth: 1, borderColor: '#374151' },
  winButton: { backgroundColor: '#6C47FF', paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  winButtonSecond: { backgroundColor: '#10B981' },
  winButtonText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  gamesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  gameCard: { width: '48%', backgroundColor: '#262930', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  gameIcon: { fontSize: 24, marginBottom: 4 },
  gameName: { color: '#ffffff', fontSize: 14, fontWeight: '600' }
});
