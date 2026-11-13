import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { roomService } from '../services/api';
import { useResponsive } from '../utils/responsive';

const INITIAL_CHESS = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
];

const createInitialCheckers = () => {
  const b = Array.from({ length: 8 }, () => Array(8).fill(null));
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) b.at(r).splice(c, 1, { color: 'black', king: false });
        if (r > 4) b.at(r).splice(c, 1, { color: 'white', king: false });
      }
    }
  }
  return b;
};

const createInitialBackgammon = () => {
  const pts = Array.from({ length: 24 }, () => ({ color: null, count: 0 }));
  pts.splice(0, 1, { color: 'white', count: 2 });
  pts.splice(11, 1, { color: 'white', count: 5 });
  pts.splice(16, 1, { color: 'white', count: 3 });
  pts.splice(18, 1, { color: 'white', count: 5 });

  pts.splice(23, 1, { color: 'black', count: 2 });
  pts.splice(12, 1, { color: 'black', count: 5 });
  pts.splice(7, 1, { color: 'black', count: 3 });
  pts.splice(5, 1, { color: 'black', count: 5 });
  return { points: pts, borneOff: { white: 0, black: 0 } };
};

export default function BoardGamesScreen({ navigation }) {
  const store = useGameStore();
  const { paddingTop, paddingHorizontal, maxWidth, titleSize } = useResponsive();
  
  const [mode, setMode] = useState('local');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [myNick, setMyNick] = useState(store?.user?.email?.split('@').at(0) || '');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const gamesList = [
    { name: 'Шахматы', icon: '♟️', route: 'ChessGame' },
    { name: 'Шашки', icon: '⚪', route: 'CheckersGame' },
    { name: 'Нарды', icon: '🎲', route: 'BackgammonGame' },
    { name: 'Крестики-нолики', icon: '❌', route: 'TicTacToe' }
  ];

  const getInitialState = (gameName) => {
    if (gameName === 'Шахматы') return INITIAL_CHESS;
    if (gameName === 'Шашки') return createInitialCheckers();
    if (gameName === 'Нарды') return createInitialBackgammon();
    if (gameName === 'Крестики-нолики') return Array(9).fill(null);
    return null;
  };

  const handleLocalStart = (item) => {
    const p1 = player1.trim();
    const p2 = player2.trim();
    if (!p1 || !p2) {
      Alert.alert('Заполните имена', 'Введите имена обоих соперников.');
      return;
    }
    navigation.navigate(item.route, { mode: 'local', player1: p1, player2: p2 });
  };

  const handleCreateOnline = async (item) => {
    if (!myNick.trim()) {
      Alert.alert('Введите ник', 'Укажите ваш никнейм для сетевой игры.');
      return;
    }

    setLoading(true);
    try {
      const room = await roomService.createRoom(item.name, myNick.trim(), getInitialState(item.name));
      navigation.navigate(item.route, {
        mode: 'online',
        roomId: room.id,
        roomCode: room.code,
        myRole: 'white',
        player1: myNick.trim(),
        player2: 'Ожидание соперника...'
      });
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOnline = async () => {
    if (!myNick.trim() || !roomCode.trim()) {
      Alert.alert('Заполните поля', 'Введите ваш ник и 4-значный код комнаты.');
      return;
    }
    setLoading(true);
    try {
      const room = await roomService.joinRoom(roomCode.trim(), myNick.trim());
      const targetGame = gamesList.find((g) => g.name === room.game_type);
      if (!targetGame) throw new Error('Неизвестный тип игры');

      navigation.navigate(targetGame.route, {
        mode: 'online',
        roomId: room.id,
        roomCode: room.code,
        myRole: 'black',
        player1: room.player1,
        player2: myNick.trim()
      });
    } catch (e) {
      Alert.alert('Ошибка входа', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.scrollContent, { paddingTop, paddingHorizontal }]} keyboardShouldPersistTaps="handled">
      <View style={[styles.innerWrapper, { maxWidth }]}>
        <Text style={[styles.headerTitle, { fontSize: titleSize }]}>♟️ Настольные игры</Text>

        <View style={styles.modeSwitch}>
          <TouchableOpacity style={[styles.modeBtn, mode === 'local' && styles.modeBtnActive]} onPress={() => setMode('local')}>
            <Text style={[styles.modeText, mode === 'local' && styles.modeTextActive]}>📱 На 1 устройстве</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeBtn, mode === 'online' && styles.modeBtnActive]} onPress={() => setMode('online')}>
            <Text style={[styles.modeText, mode === 'online' && styles.modeTextActive]}>🌐 По сети (2 тел.)</Text>
          </TouchableOpacity>
        </View>

        {mode === 'local' ? (
          <>
            <View style={styles.playerBox}>
              <Text style={styles.playerTag}>Соперник 1 (Белые)</Text>
              <TextInput style={styles.input} value={player1} onChangeText={setPlayer1} placeholder="Имя первого игрока..." placeholderTextColor="#6B7280" />
            </View>

            <View style={styles.playerBox}>
              <Text style={styles.playerTag}>Соперник 2 (Чёрные)</Text>
              <TextInput style={styles.input} value={player2} onChangeText={setPlayer2} placeholder="Имя второго игрока..." placeholderTextColor="#6B7280" />
            </View>

            <Text style={styles.sectionLabel}>Выберите игру:</Text>
            <View style={styles.gamesGrid}>
              {gamesList.map((item) => (
                <TouchableOpacity key={item.name} style={styles.gameCard} onPress={() => handleLocalStart(item)}>
                  <Text style={styles.gameIcon}>{item.icon}</Text>
                  <Text style={styles.gameName}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={styles.playerBox}>
              <Text style={styles.playerTag}>Ваш никнейм в матче:</Text>
              <TextInput style={styles.input} value={myNick} onChangeText={setMyNick} placeholder="Введите ваш ник..." placeholderTextColor="#6B7280" />
            </View>

            <View style={styles.playerBox}>
              <Text style={styles.playerTag}>Присоединиться к другу по коду:</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  style={[styles.input, { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }]}
                  value={roomCode}
                  onChangeText={setRoomCode}
                  placeholder="Код (4 цифры)"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  maxLength={4}
                />
                <TouchableOpacity style={styles.joinBtn} onPress={handleJoinOnline} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.joinBtnText}>Войти</Text>}
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Или создайте новую комнату:</Text>
            <View style={styles.gamesGrid}>
              {gamesList.map((item) => (
                <TouchableOpacity key={item.name} style={styles.gameCard} onPress={() => handleCreateOnline(item)} disabled={loading}>
                  <Text style={styles.gameIcon}>{item.icon}</Text>
                  <Text style={styles.gameName}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22' },
  scrollContent: { flexGrow: 1, paddingBottom: 30, alignItems: 'center' },
  innerWrapper: { width: '100%' },
  headerTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 14 },
  modeSwitch: { flexDirection: 'row', backgroundColor: '#262930', borderRadius: 12, padding: 4, marginBottom: 16 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modeBtnActive: { backgroundColor: '#6C47FF' },
  modeText: { color: '#A0A5B0', fontSize: 13, fontWeight: '600' },
  modeTextActive: { color: '#fff', fontWeight: 'bold' },
  sectionLabel: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 12, marginTop: 4 },
  playerBox: { backgroundColor: '#262930', borderRadius: 14, padding: 14, marginBottom: 12 },
  playerTag: { color: '#A0A5B0', fontSize: 13, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#1C1E22', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, color: '#fff', fontSize: 15, borderWidth: 1, borderColor: '#374151' },
  joinBtn: { backgroundColor: '#10B981', paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  joinBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  gamesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  gameCard: { width: '48%', backgroundColor: '#262930', borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  gameIcon: { fontSize: 30, marginBottom: 8 },
gameName: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }
});