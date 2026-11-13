import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, useWindowDimensions, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { roomService } from '../services/api';
import SurrenderButton from '../components/SurrenderButton';

const WINNING_LINES = ['0,1,2', '3,4,5', '6,7,8', '0,3,6', '1,4,7', '2,5,8', '0,4,8', '2,4,6'];
const ROWS = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];

export default function TicTacToeScreen({ route, navigation }) {
  const store = useGameStore();
  const { width, height } = useWindowDimensions();
  const { mode = 'local', roomId, roomCode, myRole, player1 = 'Крестики', player2 = 'Нолики' } = route.params || {};

  const boardSize = Math.floor(Math.min(width - 50, height * 0.45, 340));
  const cellSize = Math.floor((boardSize - 24) / 3);
  const symbolSize = Math.floor(cellSize * 0.48);

  const [cells, setCells] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('white');
  const [p2Name, setP2Name] = useState(player2);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (mode !== 'online' || !roomId || isFinished) return;

    const timer = setInterval(async () => {
      try {
        const room = await roomService.getRoom(roomId);
        if (!room) return;
        if (room.player2) setP2Name(room.player2);
        if (room.board_state) setCells(JSON.parse(room.board_state));
        if (room.turn) setTurn(room.turn);

        if (room.winner && !isFinished) {
          setIsFinished(true);
          Alert.alert(
            room.winner === 'Ничья' ? 'Ничья! 🤝' : 'Победа! 🏆',
            room.winner === 'Ничья' ? 'Поле заполнено.' : `Победитель: ${room.winner}`,
            [{ text: 'ОК', onPress: () => navigation.goBack() }]
          );
        }
      } catch (e) {}
    }, 2000);

    return () => clearInterval(timer);
  }, [mode, roomId, isFinished]);

  const finishAndSave = async (winnerName, isDraw = false, finalCells = cells) => {
    setIsFinished(true);
    try {
      if (mode === 'online' && roomId) {
        await roomService.updateMove(roomId, finalCells, turn, isDraw ? 'Ничья' : winnerName);
      }
      if (!isDraw && store?.addGame) {
        await store.addGame({ title: 'Крестики-нолики', winner: winnerName });
      }
      Alert.alert(
        isDraw ? 'Ничья! 🤝' : 'Победа! 🏆',
        isDraw ? 'Поле заполнено, победитель не выявлен.' : `Победитель: ${winnerName}`,
        [{ text: 'ОК', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить партию.');
    }
  };

  const checkWinner = (currentCells) => {
    for (let i = 0; i < WINNING_LINES.length; i++) {
      const parts = WINNING_LINES.at(i).split(',').map(Number);
      const valA = currentCells.at(parts.at(0));
      if (valA && valA === currentCells.at(parts.at(1)) && valA === currentCells.at(parts.at(2))) {
        return valA;
      }
    }
    return null;
  };

  const handleCellPress = async (index) => {
    if (isFinished || cells.at(index) !== null) return;
    if (mode === 'online' && turn !== myRole) return;

    const newCells = [...cells];
    newCells.splice(index, 1, turn === 'white' ? 'X' : 'O');
    const nextTurn = turn === 'white' ? 'black' : 'white';

    setCells(newCells);
    setTurn(nextTurn);

    const winnerSymbol = checkWinner(newCells);
    if (winnerSymbol) {
      return finishAndSave(winnerSymbol === 'X' ? player1 : p2Name, false, newCells);
    }

    if (!newCells.includes(null)) {
      return finishAndSave('Ничья', true, newCells);
    }

    if (mode === 'online' && roomId) {
      await roomService.updateMove(roomId, newCells, nextTurn);
    }
  };

  const isMyTurnOnline = mode === 'local' || turn === myRole;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.innerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>❮</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>❌ Крестики-нолики</Text>
          {mode === 'online' && (
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>Код: {roomCode}</Text>
            </View>
          )}
        </View>

        <View style={[styles.turnBanner, !isMyTurnOnline && { borderColor: '#F59E0B' }]}>
          <Text style={styles.turnText}>
            {mode === 'online' && !isMyTurnOnline
              ? `⏳ Ожидание хода (${turn === 'white' ? player1 : p2Name})...`
              : `Ход: ${turn === 'white' ? `❌ ${player1}` : `⭕ ${p2Name}`}`}
          </Text>
        </View>

        <View style={styles.board}>
          {ROWS.map((rowIndices, rIdx) => (
            <View key={rIdx} style={styles.row}>
              {rowIndices.map((idx) => {
                const value = cells.at(idx);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.cell, { width: cellSize, height: cellSize }]}
                    onPress={() => handleCellPress(idx)}
                    activeOpacity={0.7}
                  >
                    <Text style={[{ fontSize: symbolSize, fontWeight: 'bold' }, value === 'X' ? styles.xColor : styles.oColor]}>
                      {value === 'X' ? '❌' : value === 'O' ? '⭕' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {mode === 'local' && (
          <TouchableOpacity style={styles.resetBtn} onPress={() => { setCells(Array(9).fill(null)); setTurn('white'); setIsFinished(false); }}>
            <Text style={styles.resetBtnText}>🔄 Начать заново</Text>
          </TouchableOpacity>
        )}

        <SurrenderButton
          mode={mode}
          myRole={myRole}
          player1={player1}
          p2Name={p2Name}
          onSurrender={(winnerName) => finishAndSave(winnerName, false)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22' },
  scrollContent: { paddingTop: 45, paddingBottom: 30, paddingHorizontal: 20, alignItems: 'center' },
  innerWrapper: { width: '100%', maxWidth: 500 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginLeft: 16, flex: 1 },
  codeBadge: { backgroundColor: '#6C47FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  codeText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  turnBanner: { backgroundColor: '#262930', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 25, borderWidth: 1.5, borderColor: '#6C47FF' },
  turnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  board: { alignSelf: 'center', gap: 10, marginBottom: 25 },
  row: { flexDirection: 'row', gap: 10 },
  cell: {
    backgroundColor: '#262930',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#374151',
    elevation: 6,
  },
  xColor: { color: '#F43F5E' },
  oColor: { color: '#10B981' },
  resetBtn: { backgroundColor: '#6C47FF', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  resetBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
