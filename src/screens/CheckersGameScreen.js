import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';

const BOARD_SIZE = Dimensions.get('window').width - 36;
const SQUARE_SIZE = BOARD_SIZE / 8;

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

const ALL_DIRS = ['-1,-1', '-1,1', '1,-1', '1,1'];
const WHITE_DIRS = ['-1,-1', '-1,1'];
const BLACK_DIRS = ['1,-1', '1,1'];

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
    const piece = b.at(r).at(c);
    if (!piece) return [];
    const moves = [];
    const dirs = piece.king ? ALL_DIRS : piece.color === 'white' ? WHITE_DIRS : BLACK_DIRS;

    ALL_DIRS.forEach((dirStr) => {
      const [dr, dc] = dirStr.split(',').map(Number);
      const midR = r + dr;
      const midC = c + dc;
      const endR = r + dr * 2;
      const endC = c + dc * 2;
      if (endR >= 0 && endR < 8 && endC >= 0 && endC < 8) {
        const midPiece = b.at(midR).at(midC);
        if (midPiece && midPiece.color !== piece.color && !b.at(endR).at(endC)) {
          moves.push({ r: endR, c: endC, capture: { r: midR, c: midC } });
        }
      }
    });

    if (moves.length === 0) {
      dirs.forEach((dirStr) => {
        const [dr, dc] = dirStr.split(',').map(Number);
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && !b.at(nr).at(nc)) {
          moves.push({ r: nr, c: nc, capture: null });
        }
      });
    }
    return moves;
  };

  const handlePress = (r, c) => {
    if (isFinished) return;
    const piece = board.at(r).at(c);

    if (piece && piece.color === turn) {
      setSelected({ r, c });
      setValidMoves(getMovesForPiece(board, r, c));
      return;
    }

    const move = validMoves.find((m) => m.r === r && m.c === c);
    if (selected && move) {
      const newBoard = board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
      const movingPiece = newBoard.at(selected.r).at(selected.c);

      if ((movingPiece.color === 'white' && r === 0) || (movingPiece.color === 'black' && r === 7)) {
        movingPiece.king = true;
      }

      newBoard.at(r).splice(c, 1, movingPiece);
      newBoard.at(selected.r).splice(selected.c, 1, null);
      if (move.capture) {
        newBoard.at(move.capture.r).splice(move.capture.c, 1, null);
      }

      setBoard(newBoard);
      setSelected(null);
      setValidMoves([]);

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

      <View style={styles.boardFrame}>
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
                    activeOpacity={0.85}
                  >
                    {isHint && <View style={styles.hintDot} />}
                    {cell && (
                      <View style={[styles.checkerOuter, cell.color === 'white' ? styles.whiteCheckerOuter : styles.blackCheckerOuter]}>
                        <View style={[styles.checkerInner, cell.color === 'white' ? styles.whiteCheckerInner : styles.blackCheckerInner]}>
                          {cell.king && <Text style={styles.kingCrown}>👑</Text>}
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
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
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 18 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginLeft: 16 },
  turnBanner: { backgroundColor: '#262930', paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#6C47FF' },
  turnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  boardFrame: { padding: 4, backgroundColor: '#2D3139', borderRadius: 12, alignSelf: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10 },
  board: { width: BOARD_SIZE, height: BOARD_SIZE, borderRadius: 8, overflow: 'hidden' },
  row: { flexDirection: 'row' },
  square: { width: SQUARE_SIZE, height: SQUARE_SIZE, alignItems: 'center', justifyContent: 'center' },
  lightSquare: { backgroundColor: '#CBD5E1' },
  darkSquare: { backgroundColor: '#475569' },
  selectedSquare: { backgroundColor: '#7C3AED' },
  hintDot: { width: 15, height: 15, borderRadius: 8, backgroundColor: '#10B981' },
  
  checkerOuter: {
    width: SQUARE_SIZE * 0.8,
    height: SQUARE_SIZE * 0.8,
    borderRadius: SQUARE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  whiteCheckerOuter: { backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: '#94A3B8' },
  blackCheckerOuter: { backgroundColor: '#0F172A', borderWidth: 2, borderColor: '#6366F1' },
  
  checkerInner: {
    width: SQUARE_SIZE * 0.56,
    height: SQUARE_SIZE * 0.56,
    borderRadius: SQUARE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  whiteCheckerInner: { borderColor: '#CBD5E1', backgroundColor: '#F1F5F9' },
  blackCheckerInner: { borderColor: '#334155', backgroundColor: '#1E293B' },
  kingCrown: { fontSize: 14 },

  controls: { gap: 10 },
  winBtn1: { backgroundColor: '#6C47FF', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  winBtn2: { backgroundColor: '#10B981', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});
