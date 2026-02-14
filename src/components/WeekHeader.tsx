import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../constants/theme';
import { formatWeekRange } from '../utils/dates';
import { BudgetDisplay } from './BudgetDisplay';

interface WeekHeaderProps {
  weekStart: string;
  onPrevious: () => void;
  onNext: () => void;
  spent: number;
  budget: number;
  isBudgetEditable: boolean;
  onBudgetChange: (newBudget: number) => void;
}

export function WeekHeader({
  weekStart,
  onPrevious,
  onNext,
  spent,
  budget,
  isBudgetEditable,
  onBudgetChange,
}: WeekHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <Pressable
          onPress={onPrevious}
          style={({ pressed }) => [
            styles.arrowButton,
            pressed && styles.arrowPressed,
          ]}
          hitSlop={12}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={colors.textSecondary}
          />
        </Pressable>

        <Text style={styles.weekLabel}>{formatWeekRange(weekStart)}</Text>

        <Pressable
          onPress={onNext}
          style={({ pressed }) => [
            styles.arrowButton,
            pressed && styles.arrowPressed,
          ]}
          hitSlop={12}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      <BudgetDisplay
        spent={spent}
        budget={budget}
        isEditable={isBudgetEditable}
        onBudgetChange={onBudgetChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  arrowPressed: {
    backgroundColor: colors.surfaceHover,
    transform: [{ scale: 0.92 }],
  },
  weekLabel: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
});
