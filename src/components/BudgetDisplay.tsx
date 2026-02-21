import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Colors, typography, spacing, radii } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { formatDollars, parseDollarInput } from '../utils/currency';

interface BudgetDisplayProps {
  spent: number;
  budget: number;
  isEditable: boolean;
  isCurrentWeek: boolean;
  onBudgetChange: (newBudget: number) => void;
}

export function BudgetDisplay({
  spent,
  budget,
  isEditable,
  isCurrentWeek,
  onBudgetChange,
}: BudgetDisplayProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  const isOverBudget = spent > budget;
  const isUnderBudget = !isCurrentWeek && spent > 0 && !isOverBudget;
  const spentColor = isOverBudget
    ? colors.danger
    : isUnderBudget
      ? colors.success
      : colors.textPrimary;

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

  const progress = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const barColor = isOverBudget ? colors.danger : colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
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
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    textRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
    },
    progressTrack: {
      width: '80%',
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      marginTop: spacing.md,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 3,
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
}
