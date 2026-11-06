import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { colors } from '../constants/constant';

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon = null,
  style = {},
}) {
  const isInteractionDisabled = disabled || loading;

  const buttonStyles = [
    styles.baseButton,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`text_variant_${variant}`],
    styles[`text_size_${size}`],
  ];

  const getLoaderColor = () => {
    if (variant === 'outline') return colors.PRIMARY;
    return colors.TEXT_PRIMARY;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isInteractionDisabled}
      activeOpacity={0.7}
      style={buttonStyles}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoaderColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon ? <View style={styles.iconWrapper}>{leftIcon}</View> : null}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  baseText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  variant_primary: { backgroundColor: colors.PRIMARY },
  variant_secondary: { backgroundColor: colors.SECONDARY },
  variant_outline: { backgroundColor: 'transparent', borderColor: colors.PRIMARY, borderWidth: 1 },
  variant_danger: { backgroundColor: colors.DANGER },
  size_sm: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  size_md: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14 },
  size_lg: { paddingVertical: 18, paddingHorizontal: 32, borderRadius: 16 },
  text_variant_primary: { color: colors.TEXT_PRIMARY },
  text_variant_secondary: { color: colors.TEXT_PRIMARY },
  text_variant_outline: { color: colors.PRIMARY },
  text_variant_danger: { color: colors.TEXT_PRIMARY },
  text_size_sm: { fontSize: 14 },
  text_size_md: { fontSize: 16 },
  text_size_lg: { fontSize: 18 },
});
