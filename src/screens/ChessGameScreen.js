import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';

const BOARD_SIZE = Dimensions.get('window').width - 36;
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
    if (board.at(r).at(c) !== null) return false;
    r += dr;
    c += dc;
  }
  return true;
};

const isValidChessMove = (board, r1, c1, r2, c2) => {
  if (r1 === r2 && c1 === c2) return false;
  const piece = board.at(r1).at(c1);
  const target = board.at(r2).at(c2);
  if (!piece) return false;
  if (target && ((isWhite(piece) && isWhite(target)) || (isBlack(piece) && isBlack(target)))) return false;

  const dr = r2 - r1;
  const dc = c2 - c1;
  const absR = Math.abs(dr);
  const absC = Math.abs(dc);

  switch (piece) {
    case '♙':
      if (dc === 0 && dr === -1 && !target) return true;
      if (dc === 0 && dr === -2 && r1 === 6 && !target && !board.at(5).at(c1)) return true;
      if (absC === 1 && dr === -1 && target && isBlack(target)) return true;
      return false;
    case '♟':
      if (dc === 0 && dr === 1 && !target) return true;
      if (dc === 0 && dr === 2 && r1 === 1 && !target && !board.at(2).at(c1)) return true;
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
    const clickedPiece = board.at(row).at(col);

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
      let movingPiece = board.at(selected.row).at(selected.col);
      const targetPiece = board.at(row).at(col);

      if (movingPiece === '♙' && row === 0) movingPiece = '♕';
      if (movingPiece === '♟' && row === 7) movingPiece = '♛';

      const newBoard = board.map((r) => [...r]);
      newBoard.at(row).splice(col, 1, movingPiece);
      newBoard.at(selected.row).splice(selected.col, 1, null);

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

      <View style={styles.boardFrame}>
        <View style={styles.board}>
          {board.map((rowArr, r) => (
            <View key={r} style={styles.row}>
              {rowArr.map((piece, c) => {
                const isDark = (r + c) % 2 === 1;
                const isSel = selected?.row === r && selected?.col === c;
                const isHint = validMoves.includes(`${r}-${c}`);
                const white = isWhite(piece);

                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.square,
                      isDark ? styles.darkSquare : styles.lightSquare,
                      isSel && styles.selectedSquare
                    ]}
                    onPress={() => handleSquarePress(r, c)}
                    activeOpacity={0.85}
                  >
                    {isHint && !piece && <View style={styles.hintDot} />}
                    {isHint && piece && <View style={styles.captureRing} />}
                    
                    {piece && (
                      <View style={[styles.piecePedestal, white ? styles.whitePedestal : styles.blackPedestal]}>
                        <Text style={[styles.pieceText, white ? styles.whitePieceText : styles.blackPieceText]}>
                          {piece}
                        </Text>
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
  
  hintDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(16, 185, 129, 0.9)', position: 'absolute', zIndex: 5 },
  captureRing: { width: SQUARE_SIZE - 4, height: SQUARE_SIZE - 4, borderRadius: SQUARE_SIZE / 2, borderWidth: 3, borderColor: '#EF4444', position: 'absolute', zIndex: 5 },
  
  piecePedestal: {
    width: SQUARE_SIZE * 0.82,
    height: SQUARE_SIZE * 0.82,
    borderRadius: SQUARE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 3,
    elevation: 5,
  },
  whitePedestal: { backgroundColor: '#F8FAFC', borderColor: '#94A3B8' },
  blackPedestal: { backgroundColor: '#0F172A', borderColor: '#6366F1' },
  pieceText: { fontSize: SQUARE_SIZE * 0.56, includeFontPadding: false },
  whitePieceText: { color: '#1E293B' },
  blackPieceText: { color: '#F8FAFC' },

  controls: { gap: 10 },
  winBtn1: { backgroundColor: '#6C47FF', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  winBtn2: { backgroundColor: '#10B981', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});
