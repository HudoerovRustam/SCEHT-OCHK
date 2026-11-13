import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';

const BOARD_SIZE = Dimensions.get('window').width - 40;
const SQUARE_SIZE = BOARD_SIZE / 8;

const createInitialCheckers = () => {
  const b = Array(8).fill(null).map(() => Array(8).fill(null));
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) b[r][c] = { color: 'black', king: false };
        if (r > 4) b[r][c] = { color: 'white', king: false };
      }
    }
  }
  return b;
};

export default function CheckersGameScreen({ route, navigation }) {
  const store = useGameStore();
  const { player1 = 'Белые', player2 = 'Чёрные' } = route.params || {};

  const [board, setBoard] = useState(createInitialCheckers);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState('white');
  const [isFinished, setIsFinished] = useState(false);

  const finishAndSave = async (winnerName) => {
    setIsFinished(true);
    try {
      if (store?.addGame) {
        await store.addGame({ title: 'Шашки', winner: winnerName });
      }
      Alert.alert('Победа в шашках! 🏆', `Победитель: ${winnerName}\nСохранено в Supabase.`, [
        { text: 'ОК', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить партию.');
    }
  };

  const getMovesForPiece = (b, r, c) => {
    const piece = b[r][c];
    if (!piece) return [];
    const moves = [];
    const dirs = piece.king ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] : piece.color === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
    const captureDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Рубить можно вперед и назад

    // Проверяем взятие (прыжок через шашку соперника)
    captureDirs.forEach(([dr, dc]) => {
      const midR = r + dr;
      const midC = c + dc;
      const endR = r + dr * 2;
      const endC = c + dc * 2;
      if (endR >= 0 && endR < 8 && endC >= 0 && endC < 8) {
        const midPiece = b[midR][midC];
        if (midPiece && midPiece.color !== piece.color && !b[endR][endC]) {
          moves.push({ r: endR, c: endC, capture: { r: midR, c: midC } });
        }
      }
    });

    // Обычные тихие ходы (если нет обязательного взятия)
    if (moves.length === 0) {
      dirs.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !b[nr][nc]) {
          moves.push({ r: nr, c: nc, capture: null });
        }
      });
    }
    return moves;
  };

  const handlePress = (r, c) => {
    if (isFinished) return;
    const piece = board[r][c];

    if (piece && piece.color === turn) {
      setSelected({ r, c });
      setValidMoves(getMovesForPiece(board, r, c));
      return;
    }

    const move = validMoves.find((m) => m.r === r && m.c === c);
    if (selected && move) {
      const newBoard = board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
      const movingPiece = newBoard[selected.r][selected.c];

      if ((movingPiece.color === 'white' && r === 0) || (movingPiece.color === 'black' && r === 7)) {
        movingPiece.king = true;
      }

      newBoard[r][c] = movingPiece;
      newBoard[selected.r][selected.c] = null;
      if (move.capture) {
        newBoard[move.capture.r][move.capture.c] = null;
      }

      setBoard(newBoard);
      setSelected(null);
      setValidMoves([]);

      // Подсчет оставшихся шашек для проверки победы
      let whiteCount = 0;
      let blackCount = 0;
      newBoard.forEach((row) => row.forEach((cell) => {
        if (cell?.color === 'white') whiteCount++;
        if (cell?.color === 'black') blackCount++;
      }));

      if (blackCount === 0) return finishAndSave(player1);
      if (whiteCount === 0) return finishAndSave(player2);

      setTurn(turn === 'white' ? 'black' : 'white');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚪ Шашки</Text>
      </View>

      <View style={styles.turnBanner}>
        <Text style={styles.turnText}>Ход: {turn === 'white' ? `⚪ ${player1}` : `⚫ ${player2}`}</Text>
      </View>

      <View style={styles.board}>
        {board.map((rowArr, r) => (
          <View key={r} style={styles.row}>
            {rowArr.map((cell, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSel = selected?.r === r && selected?.c === c;
              const isHint = validMoves.some((m) => m.r === r && m.c === c);

              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.square, isDark ? styles.darkSquare : styles.lightSquare, isSel && styles.selectedSquare]}
                  onPress={() => handlePress(r, c)}
                >
                  {isHint && <View style={styles.hintDot} />}
                  {cell && (
                    <View style={[styles.checker, cell.color === 'white' ? styles.whiteChecker : styles.blackChecker]}>
                      {cell.king && <Text style={styles.kingCrown}>👑</Text>}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.winBtn1} onPress={() => finishAndSave(player1)}>
          <Text style={styles.btnText}>🏆 Победа: {player1}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.winBtn2} onPress={() => finishAndSave(player2)}>
          <Text style={styles.btnText}>🏆 Победа: {player2}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginLeft: 16 },
  turnBanner: { backgroundColor: '#262930', paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#6C47FF' },
  turnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  board: { width: BOARD_SIZE, height: BOARD_SIZE, alignSelf: 'center', borderWidth: 3, borderColor: '#374151', borderRadius: 6, overflow: 'hidden', marginBottom: 20 },
  row: { flexDirection: 'row' },
  square: { width: SQUARE_SIZE, height: SQUARE_SIZE, alignItems: 'center', justifyContent: 'center' },
  lightSquare: { backgroundColor: '#D1D5DB' },
  darkSquare: { backgroundColor: '#4B5563' },
  selectedSquare: { backgroundColor: '#6C47FF' },
  hintDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981' },
  checker: { width: SQUARE_SIZE * 0.76, height: SQUARE_SIZE * 0.76, borderRadius: SQUARE_SIZE, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  whiteChecker: { backgroundColor: '#F9FAFB', borderColor: '#9CA3AF' },
  blackChecker: { backgroundColor: '#111827', borderColor: '#6B7280' },
  kingCrown: { fontSize: 14 },
  controls: { gap: 10 },
  winBtn1: { backgroundColor: '#6C47FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  winBtn2: { backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});
