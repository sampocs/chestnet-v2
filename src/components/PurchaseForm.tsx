import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { colors, typography, spacing, radii, shadows } from '../constants/theme';
import { parseDollarInput } from '../utils/currency';

interface PurchaseFormProps {
  onSubmit: (name: string, amount: number) => void;
  onCancel: () => void;
}

export function PurchaseForm({ onSubmit, onCancel }: PurchaseFormProps) {
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const tabBarHeight = useBottomTabBarHeight();
  const amountRef = useRef<TextInput>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSubmit = () => {
    const amount = parseDollarInput(amountStr);
    if (name.trim() && amount > 0) {
      onSubmit(name.trim(), amount);
    }
  };

  const isValid = name.trim().length > 0 && parseDollarInput(amountStr) > 0;

  return (
    <View style={[styles.wrapper, { bottom: Math.max(0, keyboardHeight - tabBarHeight) }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>New Purchase</Text>
          <Pressable
            onPress={onCancel}
            hitSlop={12}
            style={({ pressed }) => pressed && { opacity: 0.5 }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>

        <View style={styles.fields}>
          <TextInput
            style={styles.input}
            placeholder="Item name"
            placeholderTextColor={colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
            onSubmitEditing={() => amountRef.current?.focus()}
          />
          <TextInput
            ref={amountRef}
            style={styles.input}
            placeholder="$0"
            placeholderTextColor={colors.textTertiary}
            value={amountStr}
            onChangeText={setAmountStr}
            keyboardType="number-pad"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={!isValid}
          style={({ pressed }) => [
            styles.submitButton,
            !isValid && styles.submitButtonDisabled,
            pressed && isValid && styles.submitButtonPressed,
          ]}
        >
          <Text
            style={[
              styles.submitText,
              !isValid && styles.submitTextDisabled,
            ]}
          >
            Add Purchase
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing.md,
    ...shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  cancelText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  fields: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.textPrimary,
    ...typography.body,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.surfaceHover,
  },
  submitButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  submitText: {
    ...typography.subheading,
    color: '#FFFFFF',
  },
  submitTextDisabled: {
    color: colors.textTertiary,
  },
});
