import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function HomeScreen({ navigation }) {
  const store = useGameStore();
  const userEmail = store?.user?.email || 'Гость';

  const handleLogout = () => {
    Alert.alert(
      'Выход из аккаунта',
      'Вы уверены, что хотите выйти из текущего профиля?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            if (store && typeof store.setUser === 'function') {
              await store.setUser(null);
            }
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Верхняя панель аккаунта и кнопка выхода */}
      <View style={styles.topBar}>
        <View style={styles.userBadge}>
          <Text style={styles.userText} numberOfLines={1}>👤 {userEmail}</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Выйти</Text>
        </TouchableOpacity>
      </View>

      {/* Центральный блок с кубиком и кнопками */}
      <View style={styles.centerContent}>
        <Text style={styles.diceLogo}>🎲</Text>
        <Text style={styles.title}>Игро Счёт</Text>
        <Text style={styles.subtitle}>Готовы сыграть?</Text>

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => navigation.navigate('NewGame')}
        >
          <Text style={styles.primaryButtonText}>➕ Новая игра</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => navigation.navigate('История')}
        >
          <Text style={styles.secondaryButtonText}>🕒 История игр</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1E22',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userBadge: {
    backgroundColor: '#262930',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    maxWidth: '65%',
  },
  userText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#262930',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: 'bold',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
  },
  diceLogo: {
    fontSize: 84,
    marginBottom: 15,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#A0A5B0',
    fontSize: 16,
    marginBottom: 35,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#6C47FF',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#262930',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});
