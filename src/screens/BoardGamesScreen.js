import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function BoardGamesScreen({ navigation }) {
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');

  const gamesList = [
    { name: 'Шахматы', icon: '♟️' },
    { name: 'Шашки', icon: '⚪' },
    { name: 'Нарды', icon: '🎲' },
    { name: 'Крестики-нолики', icon: '❌' }
  ];

  const handleSelectGame = (gameName) => {
    const p1 = player1.trim();
    const p2 = player2.trim();

    if (!p1 || !p2) {
      Alert.alert('Заполните имена', 'Пожалуйста, обязательно введите имена обоих соперников перед началом игры.');
      return;
    }

    const params = {
      player1: p1,
      player2: p2
    };

    if (gameName === 'Шахматы') return navigation.navigate('ChessGame', params);
    if (gameName === 'Шашки') return navigation.navigate('CheckersGame', params);
    if (gameName === 'Нарды') return navigation.navigate('BackgammonGame', params);
    if (gameName === 'Крестики-нолики') return navigation.navigate('TicTacToe', params);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>♟️ Настольные игры</Text>
      <Text style={styles.subTitle}>Введите имена соперников и выберите игру для старта</Text>

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
      </View>

      <Text style={styles.sectionLabel}>Выберите игру:</Text>

      <View style={styles.gamesGrid}>
        {gamesList.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.gameCard}
            onPress={() => handleSelectGame(item.name)}
            activeOpacity={0.8}
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
  subTitle: { color: '#A0A5B0', fontSize: 13, marginBottom: 20 },
  sectionLabel: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  playerBox: { backgroundColor: '#262930', borderRadius: 14, padding: 14, marginBottom: 14 },
  playerTag: { color: '#A0A5B0', fontSize: 13, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#1C1E22', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, color: '#ffffff', fontSize: 15, borderWidth: 1, borderColor: '#374151' },
  gamesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  gameCard: { width: '48%', backgroundColor: '#262930', borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  gameIcon: { fontSize: 32, marginBottom: 8 },
  gameName: { color: '#ffffff', fontSize: 15, fontWeight: 'bold' }
});
