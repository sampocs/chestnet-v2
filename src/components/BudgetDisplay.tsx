import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing, radii } from '../constants/theme';
import { formatDollars, parseDollarInput } from '../utils/currency';

interface BudgetDisplayProps {
  spent: number;
  budget: number;
  isEditable: boolean;
  onBudgetChange: (newBudget: number) => void;
}

export function BudgetDisplay({
  spent,
  budget,
  isEditable,
  onBudgetChange,
}: BudgetDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  const isOverBudget = spent > budget;
  const spentColor = isOverBudget ? colors.danger : colors.textPrimary;

  const handleStartEdit = () => {
    if (!isEditable) return;
    setEditValue(String(budget));
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSubmit = () => {
    const newBudget = parseDollarInput(editValue);
    if (newBudget > 0) {
      onBudgetChange(newBudget);
    }
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.spent, { color: spentColor }]}>
        {formatDollars(spent)}
      </Text>
      <Text style={styles.separator}> / </Text>
      {isEditing ? (
        <TextInput
          ref={inputRef}
          style={styles.budgetInput}
          value={editValue}
          onChangeText={setEditValue}
          onBlur={handleSubmit}
          onSubmitEditing={handleSubmit}
          keyboardType="number-pad"
          returnKeyType="done"
          selectTextOnFocus
        />
      ) : (
        <Pressable onPress={handleStartEdit} hitSlop={8}>
          <Text
            style={[
              styles.budget,
              isEditable && styles.budgetEditable,
            ]}
          >
            {formatDollars(budget)}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  spent: {
    ...typography.displayLarge,
  },
  separator: {
    ...typography.heading,
    color: colors.textTertiary,
  },
  budget: {
    ...typography.heading,
    color: colors.textSecondary,
  },
  budgetEditable: {},
  budgetInput: {
    ...typography.heading,
    color: colors.textPrimary,
    backgroundColor: colors.inputBg,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 80,
    textAlign: 'center',
  },
});
