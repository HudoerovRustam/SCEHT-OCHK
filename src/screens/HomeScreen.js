import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.imagePlaceholder}>
        <Text style={{ fontSize: 80 }}>🎲</Text> 
      </View>

      <Text style={styles.titleText}>Игро Счёт</Text>
      <Text style={styles.subtitleText}>Готовы сыграть?</Text>
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={() => navigation.navigate('NewGame')}
      >
        <Text style={styles.buttonText}>➕  Новая игра</Text>
      </TouchableOpacity>
<TouchableOpacity 
  style={styles.secondaryButton} 
  onPress={() => navigation.navigate('История')} 
>
  <Text style={styles.buttonText}>🕒  История игр</Text>
</TouchableOpacity>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1E22', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    marginBottom: 20,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitleText: {
    color: '#A0A5B0',
    fontSize: 18,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#6C47FF', 
    paddingVertical: 16,
    borderRadius: 14,
    width: '85%',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: '#262930',
    paddingVertical: 16,
    borderRadius: 14,
    width: '85%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
