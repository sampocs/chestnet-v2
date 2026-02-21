import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors, typography, spacing, radii } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { formatShortDate } from '../utils/dates';
import { formatDollars } from '../utils/currency';
import type { WeekSummary } from '../types';

interface WeekHistoryRowProps {
  summary: WeekSummary;
  isCurrent: boolean;
  onPress?: () => void;
}

export function WeekHistoryRow({ summary, isCurrent, onPress }: WeekHistoryRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const statusColor = summary.isOverBudget ? colors.danger : colors.success;
  const statusBg = summary.isOverBudget ? colors.dangerMuted : colors.successMuted;

  const delta = summary.totalSpent - summary.budget;
  const deltaLabel = delta > 0
    ? `Over by ${formatDollars(delta)}`
    : `Under by ${formatDollars(Math.abs(delta))}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { borderLeftColor: statusColor },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.leftSection}>
        <View style={styles.weekLabelRow}>
          {isCurrent && <View style={styles.currentDot} />}
          <Text style={styles.weekLabel}>
            Week of {formatShortDate(summary.startDate)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {deltaLabel}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.spent, { color: statusColor }]}>
          {formatDollars(summary.totalSpent)}
        </Text>
        <Text style={styles.budget}>/ {formatDollars(summary.budget)}</Text>
      </View>
    </Pressable>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: radii.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderLeftWidth: 3,
    },
    pressed: {
      opacity: 0.7,
    },
    leftSection: {
      flex: 1,
      marginRight: spacing.md,
    },
    weekLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    currentDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.textPrimary,
    },
    weekLabel: {
      ...typography.body,
      color: colors.textPrimary,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radii.sm,
    },
    statusText: {
      ...typography.caption,
      fontWeight: '600',
    },
    rightSection: {
      alignItems: 'flex-end',
    },
    spent: {
      ...typography.subheading,
      fontVariant: ['tabular-nums'],
    },
    budget: {
      ...typography.caption,
      color: colors.textTertiary,
      fontVariant: ['tabular-nums'],
    },
  });
}
