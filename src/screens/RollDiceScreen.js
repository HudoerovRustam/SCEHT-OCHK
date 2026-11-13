import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Easing } from 'react-native';
export default function RollDiceScreen({ navigation }) {
  const [diceResult, setDiceResult] = useState(5);
  const spinValue = useRef(new Animated.Value(0)).current;
  const bounceValue = useRef(new Animated.Value(0)).current;
  const renderDots = (number) => {
    const dots = [];
    const dotStyle = { width: 12, height: 12, backgroundColor: '#1C1E22', borderRadius: 6, margin: 4 };
    
    switch (number) {
      case 1:
        return <View style={dotStyle} />;
      case 2:
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 8 }}>
            <View style={dotStyle} />
            <View style={[dotStyle, { alignSelf: 'flex-end' }]} />
          </View>
        );
      case 3:
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 8 }}>
            <View style={dotStyle} />
            <View style={[dotStyle, { alignSelf: 'center' }]} />
            <View style={[dotStyle, { alignSelf: 'flex-end' }]} />
          </View>
        );
      case 4:
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 8 }}>
            <View>
              <View style={dotStyle} />
              <View style={[dotStyle, { marginTop: 20 }]} />
            </View>
            <View>
              <View style={dotStyle} />
              <View style={[dotStyle, { marginTop: 20 }]} />
            </View>
          </View>
        );
      case 5:
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 8 }}>
            <View>
              <View style={dotStyle} />
              <View style={[dotStyle, { marginTop: 20 }]} />
            </View>
            <View style={{ justifyContent: 'center' }}>
              <View style={dotStyle} />
            </View>
            <View>
              <View style={dotStyle} />
              <View style={[dotStyle, { marginTop: 20 }]} />
            </View>
          </View>
        );
      case 6:
        return (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 8 }}>
            <View>
              <View style={dotStyle} />
              <View style={[dotStyle, { marginTop: 10 }]} />
              <View style={[dotStyle, { marginTop: 10 }]} />
            </View>
            <View>
              <View style={dotStyle} />
              <View style={[dotStyle, { marginTop: 10 }]} />
              <View style={[dotStyle, { marginTop: 10 }]} />
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  const rollDice = () => {
    const result = Math.floor(Math.random() * 6) + 1;

    spinValue.setValue(0);
    bounceValue.setValue(0);

    Animated.parallel([
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: -60,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 700,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setDiceResult(result);
    });
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1080deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>❮</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Бросок кубика</Text>
      </View>

      <View style={styles.diceContainer}>
        <Animated.View
          style={[
            styles.diceWrapper,
            {
              transform: [
                { translateY: bounceValue },
                { rotate: spin },
              ],
            },
          ]}
        >
          {/* Визуальный кубик (без 3D-слоев, чтобы не было теней) */}
          <View style={styles.diceFace}>
             {renderDots(diceResult)}
          </View>
        </Animated.View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={rollDice}>
        <Text style={styles.buttonText}>Бросить кубик</Text>
      </TouchableOpacity>

      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Результат</Text>
        <Text style={styles.resultValue}>{diceResult}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.outlineButton} onPress={rollDice}>
          <Text style={styles.outlineButtonText}>🔄  Еще раз</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.goBack()}>
          <Text style={styles.outlineButtonText}>↩️  Назад к игре</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1E22', paddingTop: 50, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  backButton: { backgroundColor: '#E5E7EB', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  headerTitle: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginLeft: 20 },

  diceContainer: { alignItems: 'center', marginBottom: 30, height: 150, justifyContent: 'center' },
  diceWrapper: { width: 100, height: 100, alignItems: 'center', justifyContent: 'center' },
  
  // Упрощенная грань кубика (без 3D)
  diceFace: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },

  primaryButton: { backgroundColor: '#6C47FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 30 },
  buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  resultContainer: { backgroundColor: '#262930', borderRadius: 14, padding: 20, alignItems: 'center', marginBottom: 40 },
  resultLabel: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  resultValue: { color: '#6C47FF', fontSize: 36, fontWeight: 'bold' },
  footer: { gap: 12, marginBottom: 30 },
  outlineButton: { borderWidth: 2, borderColor: '#374151', backgroundColor: '#262930', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  outlineButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' }
});