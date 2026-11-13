import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';

const BOARD_SIZE = Dimensions.get('window').width - 60;
const CELL_SIZE = BOARD_SIZE / 3;

// Все 8 выигрышных комбинаций (заданы строками для защиты от обрезки при копировании)
const WINNING_LINES = [
  '0,1,2', '3,4,5', '6,7,8', // Горизонтали
  '0,3,6', '1,4,7', '2,5,8', // Вертикали
  '0,4,8', '2,4,6'           // Диагонали
];

export default function TicTacToeScreen({ route, navigation }) {
  const store = useGameStore();
  const { player1 = 'Крестики (Игрок 1)', player2 = 'Нолики (Игрок 2)' } = route.params || {};

  const [cells, setCells] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const finishAndSave = async (winnerName, isDraw = false) => {
    setIsFinished(true);
    try {
      if (!isDraw && store && typeof store.addGame === 'function') {
        await store.addGame({
          title: 'Крестики-нолики',
          winner: winnerName
        });
      }
      Alert.alert(
        isDraw ? 'Ничья! 🤝' : 'Победа! 🏆',
        isDraw 
          ? 'Поле заполнено, победитель не выявлен.' 
          : `Победитель: ${winnerName}\nРезультат сохранен в Supabase и учтен в рейтинге.`,
        [{ text: 'ОК', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить партию в облако.');
    }
  };

  const checkWinner = (currentCells) => {
    for (let i = 0; i < WINNING_LINES.length; i++) {
      const lineStr = WINNING_LINES.at(i);
      const parts = lineStr.split(',').map(Number);
      const a = parts.at(0);
      const b = parts.at(1);
      const c = parts.at(2);

      const valA = currentCells.at(a);
      if (valA && valA === currentCells.at(b) && valA === currentCells.at(c)) {
        return valA;
      }
    }
    return null;
  };

  const handleCellPress = (index) => {
    if (isFinished || cells.at(index) !== null) return;

    const newCells = [...cells];
    newCells.splice(index, 1, isXTurn ? 'X' : 'O');
    setCells(newCells);

    const winnerSymbol = checkWinner(newCells);
    if (winnerSymbol) {
      const winnerName = winnerSymbol === 'X' ? player1 : player2;
      return finishAndSave(winnerName, false);
    }

    if (!newCells.includes(null)) {
      return finishAndSave('Ничья', true);
    }

    setIsXTurn(!isXTurn);
  };

  const handleReset = () => {
    setCells(Array(9).fill(null));
    setIsXTurn(true);
    setIsFinished(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>❌ Крестики-нолики</Text>
      </View>

      <View style={styles.turnBanner}>
        <Text style={styles.turnText}>
          Ход: {isXTurn ? `❌ ${player1}` : `⭕ ${player2}`}
        </Text>
      </View>

      <View style={styles.board}>
        {cells.map((value, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.cell}
            onPress={() => handleCellPress(idx)}
            activeOpacity={0.7}
          >
            <Text style={[styles.symbolText, value === 'X' ? styles.xColor : styles.oColor]}>
              {value === 'X' ? '❌' : value === 'O' ? '⭕' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetBtnText}>🔄 Начать заново</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginLeft: 16 },
  turnBanner: { backgroundColor: '#262930', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#6C47FF' },
  turnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  board: { width: BOARD_SIZE, height: BOARD_SIZE, alignSelf: 'center', flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#374151', borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#374151', marginBottom: 30 },
  cell: { width: CELL_SIZE - 1.5, height: CELL_SIZE - 1.5, backgroundColor: '#262930', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' },
  symbolText: { fontSize: CELL_SIZE * 0.48 },
  xColor: { color: '#EF4444' },
  oColor: { color: '#10B981' },
  controls: { gap: 10 },
  resetBtn: { backgroundColor: '#6C47FF', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  resetBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
