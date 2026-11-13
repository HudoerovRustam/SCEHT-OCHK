import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';

const BOARD_SIZE = Dimensions.get('window').width - 40;
const SQUARE_SIZE = BOARD_SIZE / 8;

const INITIAL_BOARD = [
  ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
  ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
];

const isWhite = (p) => ['♙', '♖', '♘', '♗', '♕', '♔'].includes(p);
const isBlack = (p) => ['♟', '♜', '♞', '♝', '♛', '♚'].includes(p);

const isPathClear = (board, r1, c1, r2, c2) => {
  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);
  let r = r1 + dr;
  let c = c1 + dc;
  while (r !== r2 || c !== c2) {
    if (board[r][c] !== null) return false;
    r += dr;
    c += dc;
  }
  return true;
};

const isValidChessMove = (board, r1, c1, r2, c2) => {
  if (r1 === r2 && c1 === c2) return false;
  const piece = board[r1][c1];
  const target = board[r2][c2];
  if (!piece) return false;
  if (target && ((isWhite(piece) && isWhite(target)) || (isBlack(piece) && isBlack(target)))) return false;

  const dr = r2 - r1;
  const dc = c2 - c1;
  const absR = Math.abs(dr);
  const absC = Math.abs(dc);

  switch (piece) {
    case '♙':
      if (dc === 0 && dr === -1 && !target) return true;
      if (dc === 0 && dr === -2 && r1 === 6 && !target && !board[5][c1]) return true;
      if (absC === 1 && dr === -1 && target && isBlack(target)) return true;
      return false;
    case '♟':
      if (dc === 0 && dr === 1 && !target) return true;
      if (dc === 0 && dr === 2 && r1 === 1 && !target && !board[2][c1]) return true;
      if (absC === 1 && dr === 1 && target && isWhite(target)) return true;
      return false;
    case '♖':
    case '♜':
      return (dr === 0 || dc === 0) && isPathClear(board, r1, c1, r2, c2);
    case '♗':
    case '♝':
      return absR === absC && isPathClear(board, r1, c1, r2, c2);
    case '♕':
    case '♛':
      return (dr === 0 || dc === 0 || absR === absC) && isPathClear(board, r1, c1, r2, c2);
    case '♘':
    case '♞':
      return (absR === 2 && absC === 1) || (absR === 1 && absC === 2);
    case '♔':
    case '♚':
      return absR <= 1 && absC <= 1;
    default:
      return false;
  }
};

export default function ChessGameScreen({ route, navigation }) {
  const store = useGameStore();
  const { player1 = 'Белые', player2 = 'Чёрные' } = route.params || {};

  const [board, setBoard] = useState(INITIAL_BOARD);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [turn, setTurn] = useState('white');
  const [isFinished, setIsFinished] = useState(false);

  const finishAndSave = async (winnerName) => {
    setIsFinished(true);
    try {
      if (store?.addGame) {
        await store.addGame({ title: 'Шахматы', winner: winnerName });
      }
      Alert.alert('Партия завершена! 🏆', `Победитель: ${winnerName}\nСохранено в Supabase.`, [
        { text: 'ОК', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить партию.');
    }
  };

  const selectPiece = (row, col) => {
    setSelected({ row, col });
    const moves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isValidChessMove(board, row, col, r, c)) {
          moves.push(`${r}-${c}`);
        }
      }
    }
    setValidMoves(moves);
  };

  const handleSquarePress = (row, col) => {
    if (isFinished) return;
    const clickedPiece = board[row][col];

    if (clickedPiece && ((turn === 'white' && isWhite(clickedPiece)) || (turn === 'black' && isBlack(clickedPiece)))) {
      if (selected?.row === row && selected?.col === col) {
        setSelected(null);
        setValidMoves([]);
      } else {
        selectPiece(row, col);
      }
      return;
    }

    if (selected && validMoves.includes(`${row}-${col}`)) {
      let movingPiece = board[selected.row][selected.col];
      const targetPiece = board[row][col];

      // Превращение пешки в ферзя при достижении края доски
      if (movingPiece === '♙' && row === 0) movingPiece = '♕';
      if (movingPiece === '♟' && row === 7) movingPiece = '♛';

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = movingPiece;
      newBoard[selected.row][selected.col] = null;

      setBoard(newBoard);
      setSelected(null);
      setValidMoves([]);

      if (targetPiece === '♚') return finishAndSave(player1);
      if (targetPiece === '♔') return finishAndSave(player2);

      setTurn(turn === 'white' ? 'black' : 'white');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>♟️ Шахматы</Text>
      </View>

      <View style={styles.turnBanner}>
        <Text style={styles.turnText}>Ход: {turn === 'white' ? `⚪ ${player1}` : `⚫ ${player2}`}</Text>
      </View>

      <View style={styles.board}>
        {board.map((rowArr, r) => (
          <View key={r} style={styles.row}>
            {rowArr.map((piece, c) => {
              const isDark = (r + c) % 2 === 1;
              const isSel = selected?.row === r && selected?.col === c;
              const isHint = validMoves.includes(`${r}-${c}`);

              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.square, isDark ? styles.darkSquare : styles.lightSquare, isSel && styles.selectedSquare]}
                  onPress={() => handleSquarePress(r, c)}
                >
                  {isHint && !piece && <View style={styles.hintDot} />}
                  {isHint && piece && <View style={styles.captureRing} />}
                  <Text style={[styles.pieceText, isWhite(piece) ? styles.whitePiece : styles.blackPiece]}>
                    {piece || ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.winBtn1} onPress={() => finishAndSave(player1)}>
          <Text style={styles.btnText}>🏆 Мат: {player1}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.winBtn2} onPress={() => finishAndSave(player2)}>
          <Text style={styles.btnText}>🏆 Мат: {player2}</Text>
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
  hintDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(16, 185, 129, 0.85)', position: 'absolute' },
  captureRing: { width: SQUARE_SIZE - 6, height: SQUARE_SIZE - 6, borderRadius: SQUARE_SIZE / 2, borderWidth: 3, borderColor: '#EF4444', position: 'absolute' },
  pieceText: { fontSize: SQUARE_SIZE * 0.68 },
  whitePiece: { color: '#FFF', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  blackPiece: { color: '#111827' },
  controls: { gap: 10 },
  winBtn1: { backgroundColor: '#6C47FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  winBtn2: { backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});
