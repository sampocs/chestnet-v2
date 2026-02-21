import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, typography, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { getDayName, formatShortDate } from '../utils/dates';
import { PurchaseRow } from './PurchaseRow';
import type { Purchase } from '../types';

interface DaySectionProps {
  dateStr: string;
  purchases: Purchase[];
  onEdit?: (purchase: Purchase) => void;
  onDelete?: (purchaseId: string) => void;
  editingPurchaseId: string | null;
  onEditSubmit: (name: string, amount: number) => void;
  onEditCancel: () => void;
}

export function DaySection({
  dateStr,
  purchases,
  onEdit,
  onDelete,
  editingPurchaseId,
  onEditSubmit,
  onEditCancel,
}: DaySectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  if (purchases.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dayName}>{getDayName(dateStr)}</Text>
        <Text style={styles.date}>{formatShortDate(dateStr)}</Text>
      </View>
      {purchases.map((purchase) => (
        <PurchaseRow
          key={purchase.id}
          purchase={purchase}
          isEditing={editingPurchaseId === purchase.id}
          onEdit={onEdit ? () => onEdit(purchase) : undefined}
          onDelete={onDelete ? () => onDelete(purchase.id) : undefined}
          onEditSubmit={onEditSubmit}
          onEditCancel={onEditCancel}
        />
      ))}
    </View>
  );
}

function makeStyles(colors: Colors) {
  return StyleSheet.create({
    container: {
      marginBottom: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.sm,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    dayName: {
      ...typography.subheading,
      color: colors.textPrimary,
    },
    date: {
      ...typography.caption,
      color: colors.textTertiary,
    },
  });
}
