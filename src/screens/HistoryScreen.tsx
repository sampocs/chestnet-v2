import React, { useMemo } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import { getWeekEnd, getWeekStart } from '../utils/dates';
import { formatDollars } from '../utils/currency';
import { WeekHistoryRow } from '../components/WeekHistoryRow';
import type { WeekSummary } from '../types';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { data } = useAppContext();

  const currentWeekStart = getWeekStart(new Date());

  const summaries: WeekSummary[] = useMemo(() => {
    return Object.values(data.weeks)
      .map((week) => ({
        startDate: week.startDate,
        endDate: getWeekEnd(week.startDate),
        totalSpent: week.purchases.reduce((sum, p) => sum + p.amount, 0),
        budget: week.budget,
        isOverBudget:
          week.purchases.reduce((sum, p) => sum + p.amount, 0) > week.budget,
      }))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [data.weeks]);

  const weeklyAverage = useMemo(() => {
    if (summaries.length === 0) return 0;
    const total = summaries.reduce((sum, s) => sum + s.totalSpent, 0);
    return Math.round(total / summaries.length);
  }, [summaries]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>History</Text>

      {summaries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No history yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Your weekly spending will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={summaries}
          keyExtractor={(item) => item.startDate}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.averageContainer}>
              <Text style={styles.averageLabel}>Weekly Average</Text>
              <Text style={styles.averageValue}>
                {formatDollars(weeklyAverage)}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <WeekHistoryRow
              summary={item}
              isCurrent={item.startDate === currentWeekStart}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  averageContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  averageLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  averageValue: {
    ...typography.displayLarge,
    color: colors.textPrimary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    ...typography.subheading,
    color: colors.textSecondary,
  },
  emptyStateSubtext: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});
