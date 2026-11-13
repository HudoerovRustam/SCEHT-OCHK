import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function BoardGamesScreen({ navigation }) {
  const store = useGameStore();
  
  const [selectedGame, setSelectedGame] = useState('Шашки');
  const [player1, setPlayer1] = useState('Белые (Игрок 1)');
  const [player2, setPlayer2] = useState('Чёрные (Игрок 2)');
  const [isSaving, setIsSaving] = useState(false);

  const gamesList = [
    { name: 'Шахматы', icon: '♟️' },
    { name: 'Шашки', icon: '⚪' },
    { name: 'Нарды', icon: '🎲' },
    { name: 'Крестики-нолики', icon: '❌' }
  ];

  // Обработка нажатия на карточку игры
     const handleSelectGame = (gameName) => {
    const params = {
      player1: player1.trim() || 'Игрок 1',
      player2: player2.trim() || 'Игрок 2'
    };

    if (gameName === 'Шахматы') return navigation.navigate('ChessGame', params);
    if (gameName === 'Шашки') return navigation.navigate('CheckersGame', params);
    if (gameName === 'Нарды') return navigation.navigate('BackgammonGame', params);
    if (gameName === 'Крестики-нолики') return navigation.navigate('TicTacToe', params);

    setSelectedGame(gameName);
  };


  const handleRecordWin = async (winnerName) => {
    const cleanWinner = winnerName.trim();
    if (!cleanWinner) {
      Alert.alert('Внимание', 'Введите имя игрока перед записью победы.');
      return;
    }

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
      <Text style={styles.subTitle}>Нажмите на Шахматы для игры на доске или выберите игру для записи счёта</Text>

      <View style={styles.gamesGrid}>
        {gamesList.map((item) => {
          const isActive = selectedGame === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.gameCard, isActive && styles.gameCardActive]}
              onPress={() => handleSelectGame(item.name)}
            >
              <Text style={styles.gameIcon}>{item.icon}</Text>
              <Text style={[styles.gameName, isActive && styles.gameNameActive]}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>Участники партии:</Text>
      
      <View style={styles.playerBox}>
        <Text style={styles.playerTag}>Соперник 1</Text>
        <TextInput
          style={styles.input}
          value={player1}
          onChangeText={setPlayer1}
          placeholder="Имя первого игрока..."
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
            <Text style={styles.winButtonText}>🏆 Победил {player1 || 'Игрок 1'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.playerBox}>
        <Text style={styles.playerTag}>Соперник 2</Text>
        <TextInput
          style={styles.input}
          value={player2}
          onChangeText={setPlayer2}
          placeholder="Имя второго игрока..."
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
            <Text style={styles.winButtonText}>🏆 Победил {player2 || 'Игрок 2'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  headerTitle: { color: '#ffffff', fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
  subTitle: { color: '#A0A5B0', fontSize: 13, marginBottom: 20 },
  gamesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20, gap: 10 },
  gameCard: { width: '48%', backgroundColor: '#262930', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  gameCardActive: { borderColor: '#6C47FF', backgroundColor: '#28253A' },
  gameIcon: { fontSize: 28, marginBottom: 6 },
  gameName: { color: '#A0A5B0', fontSize: 15, fontWeight: '600' },
  gameNameActive: { color: '#ffffff', fontWeight: 'bold' },
  sectionLabel: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  playerBox: { backgroundColor: '#262930', borderRadius: 16, padding: 15, marginBottom: 15 },
  playerTag: { color: '#A0A5B0', fontSize: 13, marginBottom: 6, fontWeight: '600' },
  input: { backgroundColor: '#1C1E22', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, color: '#ffffff', fontSize: 16, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  winButton: { backgroundColor: '#6C47FF', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  winButtonSecond: { backgroundColor: '#10B981' },
  winButtonText: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' }
});
