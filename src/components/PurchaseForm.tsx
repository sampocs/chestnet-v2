import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../constants/theme';
import { parseDollarInput } from '../utils/currency';

interface PurchaseFormProps {
  onSubmit: (name: string, amount: number) => void;
  onCancel: () => void;
}

export function PurchaseForm({ onSubmit, onCancel }: PurchaseFormProps) {
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const amountRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    const amount = parseDollarInput(amountStr);
    if (name.trim() && amount > 0) {
      onSubmit(name.trim(), amount);
    }
  };

  const isValid = name.trim().length > 0 && parseDollarInput(amountStr) > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
      style={styles.wrapper}
    >
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
