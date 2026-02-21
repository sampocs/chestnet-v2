import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, typography, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { formatWeekRange } from '../utils/dates';
import { BudgetDisplay } from './BudgetDisplay';

interface WeekHeaderProps {
  weekStart: string;
  onPrevious: () => void;
  onNext: () => void;
  onJumpToCurrentWeek: () => void;
  spent: number;
  budget: number;
  isBudgetEditable: boolean;
  isCurrentWeek: boolean;
  onBudgetChange: (newBudget: number) => void;
}

export function WeekHeader({
  weekStart,
  onPrevious,
  onNext,
  onJumpToCurrentWeek,
  spent,
  budget,
  isBudgetEditable,
  isCurrentWeek,
  onBudgetChange,
}: WeekHeaderProps) {
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
          <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
        </Pressable>

        <Pressable onPress={onJumpToCurrentWeek} hitSlop={8}>
          <Text style={styles.weekLabel}>{formatWeekRange(weekStart)}</Text>
        </Pressable>

        <View style={styles.rightControls}>
          <Pressable
            onPress={toggleTheme}
            hitSlop={8}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={colors.textTertiary}
            />
          </Pressable>

          <Pressable
            onPress={onNext}
            style={({ pressed }) => [
              styles.arrowButton,
              pressed && styles.arrowPressed,
            ]}
            hitSlop={12}
          >
            <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <BudgetDisplay
        spent={spent}
        budget={budget}
        isEditable={isBudgetEditable}
        isCurrentWeek={isCurrentWeek}
        onBudgetChange={onBudgetChange}
      />
    </View>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
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
    rightControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
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
}
