import React from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';

export default function SurrenderButton({ mode, myRole, player1, p2Name, onSurrender }) {
  if (mode !== 'online' || p2Name === 'Ожидание соперника...') {
    return null;
  }

  const loserName = myRole === 'white' ? player1 : p2Name;
  const winnerName = myRole === 'white' ? p2Name : player1;

  const handlePress = () => {
    Alert.alert(
      'Сдаться? 🏳️',
      `Вы (${loserName}) признаёте поражение.\nПобеда достанется игроку ${winnerName}.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сдаться',
          style: 'destructive',
          onPress: () => onSurrender(winnerName),
        },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.btn} onPress={handlePress} activeOpacity={0.85}>
      <Text style={styles.text}>🏳️ Сдаться (Победа: {winnerName})</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
