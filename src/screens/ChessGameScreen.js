import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, useWindowDimensions, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { roomService } from '../services/api';

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

const FILLED_GLYPHS = {
  '♙': '♟\uFE0E', '♖': '♜\uFE0E', '♘': '♞\uFE0E', '♗': '♝\uFE0E', '♕': '♛\uFE0E', '♔': '♚\uFE0E',
  '♟': '♟\uFE0E', '♜': '♜\uFE0E', '♞': '♞\uFE0E', '♝': '♝\uFE0E', '♛': '♛\uFE0E', '♚': '♚\uFE0E',
};

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
  const { width, height } = useWindowDimensions();
  const { mode = 'local', roomId, roomCode, myRole, player1 = 'Белые', player2 = 'Чёрные' } = route.params || {};

  const boardSize = Math.min(width - 36, height * 0.52, 460);
  const squareSize = boardSize / 8;

  const [board, setBoard] = useState(INITIAL_BOARD);
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
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
        if (room.board_state) setBoard(JSON.parse(room.board_state));
        if (room.turn) setTurn(room.turn);

        if (room.winner && !isFinished) {
          setIsFinished(true);
          Alert.alert('Партия завершена! 🏆', `Победитель: ${room.winner}`, [
            { text: 'ОК', onPress: () => navigation.goBack() }
          ]);
        }
      } catch (e) {}
    }, 2000);

    return () => clearInterval(timer);
  }, [mode, roomId, isFinished]);

  const finishAndSave = async (winnerName, finalBoard = board) => {
    setIsFinished(true);
    try {
      if (mode === 'online' && roomId) {
        await roomService.updateMove(roomId, finalBoard, turn, winnerName);
      }
      if (store?.addGame) {
        await store.addGame({ title: 'Шахматы', winner: winnerName });
      }
      Alert.alert('Партия завершена! 🏆', `Победитель: ${winnerName}`, [
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
        if (isValidChessMove(board, row, col, r, c)) moves.push(`${r}-${c}`);
      }
    }
    setValidMoves(moves);
  };

  const handleSquarePress = async (row, col) => {
    if (isFinished) return;
    if (mode === 'online' && turn !== myRole) return;

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

      const nextTurn = turn === 'white' ? 'black' : 'white';
      setBoard(newBoard);
      setSelected(null);
      setValidMoves([]);
      setTurn(nextTurn);

      if (targetPiece === '♚') return finishAndSave(player1, newBoard);
      if (targetPiece === '♔') return finishAndSave(p2Name, newBoard);

      if (mode === 'online' && roomId) {
        await roomService.updateMove(roomId, newBoard, nextTurn);
      }
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
          <Text style={styles.headerTitle}>♟️ Шахматы</Text>
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
              : `Ход: ${turn === 'white' ? `⚪ ${player1}` : `⚫ ${p2Name}`}`}
          </Text>
        </View>

        <View style={styles.boardFrame}>
          <View style={[styles.board, { width: boardSize, height: boardSize }]}>
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
                        { width: squareSize, height: squareSize, alignItems: 'center', justifyContent: 'center' },
                        isDark ? styles.darkSquare : styles.lightSquare,
                        isSel && styles.selectedSquare
                      ]}
                      onPress={() => handleSquarePress(r, c)}
                      activeOpacity={0.85}
                    >
                      {isHint && !piece && <View style={styles.hintDot} />}
                      {isHint && piece && (
                        <View style={[styles.captureRing, { width: squareSize - 4, height: squareSize - 4, borderRadius: squareSize / 2 }]} />
                      )}
                      {piece && (
                        <Text style={[{ fontSize: squareSize * 0.74, includeFontPadding: false }, white ? styles.whitePieceText : styles.blackPieceText]}>
                          {FILLED_GLYPHS[piece]}
                        </Text>
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
          <TouchableOpacity style={styles.winBtn2} onPress={() => finishAndSave(p2Name)}>
            <Text style={styles.btnText}>🏆 Мат: {p2Name}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22' },
  scrollContent: { paddingTop: 45, paddingBottom: 30, paddingHorizontal: 18, alignItems: 'center' },
  innerWrapper: { width: '100%', maxWidth: 540 },
header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000' },
headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginLeft: 16, flex: 1 },
codeBadge: { backgroundColor: '#6C47FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
codeText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
turnBanner: { backgroundColor: '#262930', paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginBottom: 16, borderWidth: 1.5, borderColor: '#6C47FF' },
turnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
boardFrame: { padding: 4, backgroundColor: '#2D3139', borderRadius: 12, alignSelf: 'center', marginBottom: 20, elevation: 8 },
board: { borderRadius: 8, overflow: 'hidden' },
row: { flexDirection: 'row' },
lightSquare: { backgroundColor: '#CBD5E1' },
darkSquare: { backgroundColor: '#475569' },
selectedSquare: { backgroundColor: '#7C3AED' },
hintDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(16, 185, 129, 0.9)', position: 'absolute', zIndex: 5 },
captureRing: { borderWidth: 3, borderColor: '#EF4444', position: 'absolute', zIndex: 5 },
whitePieceText: { color: '#FFFFFF', textShadowColor: '#0F172A', textShadowOffset: { width: 0, height: 1.5 }, textShadowRadius: 3 },
blackPieceText: { color: '#0F172A', textShadowColor: 'rgba(255, 255, 255, 0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 1.5 },
controls: { gap: 10 },
winBtn1: { backgroundColor: '#6C47FF', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
winBtn2: { backgroundColor: '#10B981', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});