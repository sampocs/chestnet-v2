import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '../constants/theme';
import { formatShortDate } from '../utils/dates';
import { formatDollars } from '../utils/currency';
import type { WeekSummary } from '../types';

interface WeekHistoryRowProps {
  summary: WeekSummary;
  isCurrent: boolean;
}

export function WeekHistoryRow({ summary, isCurrent }: WeekHistoryRowProps) {
  const statusColor = summary.isOverBudget ? colors.danger : colors.success;
  const statusBg = summary.isOverBudget
    ? colors.dangerMuted
    : colors.successMuted;

  return (
    <View style={[styles.container, { borderLeftColor: statusColor }]}>
      <View style={styles.leftSection}>
        <Text style={styles.weekLabel}>
          Week of {formatShortDate(summary.startDate)}
          {isCurrent ? ' (current)' : ''}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {summary.isOverBudget ? 'Over budget' : 'On track'}
          </Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.spent, { color: statusColor }]}>
          {formatDollars(summary.totalSpent)}
        </Text>
        <Text style={styles.budget}>/ {formatDollars(summary.budget)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  leftSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  weekLabel: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  statusText: {
    ...typography.footnote,
    fontWeight: '500',
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
