import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { colors } from '../constants/constant';

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  icon,
  isPassword = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  style = {},
  ...restProps
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);

  const getBorderColor = () => {
    if (error) return colors.ERROR;
    if (isFocused) return colors.PRIMARY;
    return colors.BORDER;
  };

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      
      <View style={[styles.inputWrapper, { borderColor: getBorderColor() }, multiline && styles.multilineWrapper]}>
        {icon ? <View style={styles.leftIconWrapper}>{icon}</View> : null}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.TEXT_MUTED}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.textInput, multiline && { textAlignVertical: 'top' }]}
          {...restProps}
        />

        {isPassword ? (
          <TouchableOpacity 
            onPress={() => setSecureTextEntry(!secureTextEntry)}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeIcon}>{secureTextEntry ? '👁️' : '🙈'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: colors.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    width: '100%',
    height: 50,
    backgroundColor: colors.SURFACE,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  multilineWrapper: {
    height: 'auto',
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    color: colors.TEXT_PRIMARY,
    fontSize: 16,
    height: '100%',
    padding: 0,
  },
  leftIconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 10,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: colors.ERROR,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
