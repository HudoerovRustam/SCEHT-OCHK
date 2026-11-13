import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, useWindowDimensions, ScrollView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { roomService } from '../services/api';

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
  const { width, height } = useWindowDimensions();
  const { mode = 'local', roomId, roomCode, myRole, player1 = 'Белые', player2 = 'Чёрные' } = route.params || {};

  const boardSize = Math.floor(Math.min(width - 36, height * 0.52, 460));
  const squareSize = boardSize / 8;

  const [board, setBoard] = useState(createInitialCheckers);
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
          Alert.alert('Победа в шашках! 🏆', `Победитель: ${room.winner}`, [
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
        await store.addGame({ title: 'Шашки', winner: winnerName });
      }
      Alert.alert('Победа в шашках! 🏆', `Победитель: ${winnerName}`, [
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

  const handlePress = async (r, c) => {
    if (isFinished) return;
    if (mode === 'online' && turn !== myRole) return;

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

      const nextTurn = turn === 'white' ? 'black' : 'white';
      setBoard(newBoard);
      setSelected(null);
      setValidMoves([]);
      setTurn(nextTurn);

      let whiteCount = 0;
      let blackCount = 0;
      newBoard.forEach((row) => row.forEach((cell) => {
        if (cell?.color === 'white') whiteCount++;
        if (cell?.color === 'black') blackCount++;
      }));

      if (blackCount === 0) return finishAndSave(player1, newBoard);
      if (whiteCount === 0) return finishAndSave(p2Name, newBoard);

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
          <Text style={styles.headerTitle}>⚪ Шашки</Text>
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
                {rowArr.map((cell, c) => {
                  const isDark = (r + c) % 2 === 1;
                  const isSel = selected?.r === r && selected?.c === c;
                  const isHint = validMoves.some((m) => m.r === r && m.c === c);

                  return (
                    <TouchableOpacity
                      key={c}
                      style={[
                        { width: squareSize, height: squareSize, alignItems: 'center', justifyContent: 'center' },
                        isDark ? styles.darkSquare : styles.lightSquare,
                        isSel && styles.selectedSquare
                      ]}
                      onPress={() => handlePress(r, c)}
                      activeOpacity={0.85}
                    >
                      {isHint && <View style={styles.hintDot} />}
                      {cell && (
                        <View style={[
                          styles.checkerOuter,
                          { width: squareSize * 0.8, height: squareSize * 0.8, borderRadius: squareSize },
                          cell.color === 'white' ? styles.whiteCheckerOuter : styles.blackCheckerOuter
                        ]}>
                          <View style={[
                            styles.checkerInner,
                            { width: squareSize * 0.56, height: squareSize * 0.56, borderRadius: squareSize },
                            cell.color === 'white' ? styles.whiteCheckerInner : styles.blackCheckerInner
                          ]}>
                            {cell.king && <Text style={{ fontSize: squareSize * 0.28 }}>👑</Text>}
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
          <TouchableOpacity style={styles.winBtn2} onPress={() => finishAndSave(p2Name)}>
            <Text style={styles.btnText}>🏆 Победа: {p2Name}</Text>
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
hintDot: { width: 15, height: 15, borderRadius: 8, backgroundColor: '#10B981' },
checkerOuter: { alignItems: 'center', justifyContent: 'center', elevation: 5 },
whiteCheckerOuter: { backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: '#94A3B8' },
blackCheckerOuter: { backgroundColor: '#0F172A', borderWidth: 2, borderColor: '#6366F1' },
checkerInner: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
whiteCheckerInner: { borderColor: '#CBD5E1', backgroundColor: '#F1F5F9' },
blackCheckerInner: { borderColor: '#334155', backgroundColor: '#1E293B' },
controls: { gap: 10 },
winBtn1: { backgroundColor: '#6C47FF', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
winBtn2: { backgroundColor: '#10B981', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
btnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' }
});