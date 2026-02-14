import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import {
  getWeekStart,
  shiftWeek,
  getWeekDates,
  getDayName,
  formatShortDate,
  isCurrentOrFutureWeek,
} from '../utils/dates';
import { formatDollars, parseDollarInput } from '../utils/currency';
import { WeekHeader } from '../components/WeekHeader';
import { PurchaseForm } from '../components/PurchaseForm';
import { useHaptics } from '../hooks/useHaptics';
import * as Crypto from 'expo-crypto';
import type { Purchase } from '../types';

type ListItem =
  | { type: 'day-header'; dateStr: string; key: string }
  | { type: 'purchase'; purchase: Purchase; dateStr: string; key: string }
  | { type: 'empty-day'; dateStr: string; key: string };

export default function PurchasesScreen() {
  const insets = useSafeAreaInsets();
  const { data, dispatch } = useAppContext();
  const haptics = useHaptics();

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(new Date()),
  );
  const [isAdding, setIsAdding] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);
  const [movingPurchase, setMovingPurchase] = useState<Purchase | null>(null);

  React.useEffect(() => {
    dispatch({ type: 'ENSURE_WEEK_EXISTS', weekStart: currentWeekStart });
  }, [currentWeekStart, dispatch]);

  const week = data.weeks[currentWeekStart];
  const purchases = week?.purchases ?? [];
  const budget = week?.budget ?? data.defaultBudget;

  const totalSpent = useMemo(
    () => purchases.reduce((sum, p) => sum + p.amount, 0),
    [purchases],
  );

  const weekDates = useMemo(
    () => getWeekDates(currentWeekStart),
    [currentWeekStart],
  );

  const isEditable = true;

  // Build flat list: day headers + purchases interleaved, all 7 days shown
  const listData: ListItem[] = useMemo(() => {
    const purchasesByDate: Record<string, Purchase[]> = {};
    for (const p of purchases) {
      if (!purchasesByDate[p.date]) purchasesByDate[p.date] = [];
      purchasesByDate[p.date].push(p);
    }

    const items: ListItem[] = [];
    for (const dateStr of weekDates) {
      items.push({ type: 'day-header', dateStr, key: `header-${dateStr}` });
      const dayPurchases = purchasesByDate[dateStr];
      if (dayPurchases && dayPurchases.length > 0) {
        for (const p of dayPurchases) {
          items.push({ type: 'purchase', purchase: p, dateStr, key: p.id });
        }
      } else {
        items.push({ type: 'empty-day', dateStr, key: `empty-${dateStr}` });
      }
    }
    return items;
  }, [purchases, weekDates]);

  const handlePrevWeek = useCallback(() => {
    haptics.light();
    setCurrentWeekStart((prev) => shiftWeek(prev, -1));
    setIsAdding(false);
    setEditingPurchaseId(null);
  }, [haptics]);

  const handleNextWeek = useCallback(() => {
    haptics.light();
    setCurrentWeekStart((prev) => shiftWeek(prev, 1));
    setIsAdding(false);
    setEditingPurchaseId(null);
  }, [haptics]);

  const handleBudgetChange = useCallback(
    (newBudget: number) => {
      dispatch({
        type: 'SET_BUDGET',
        weekStart: currentWeekStart,
        budget: newBudget,
      });
    },
    [dispatch, currentWeekStart],
  );

  const handleAddPurchase = useCallback(
    (name: string, amount: number) => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const weekDatesArr = getWeekDates(currentWeekStart);
      const purchaseDate = weekDatesArr.includes(todayStr)
        ? todayStr
        : currentWeekStart;

      const purchase: Purchase = {
        id: Crypto.randomUUID(),
        name,
        amount,
        date: purchaseDate,
      };

      dispatch({
        type: 'ADD_PURCHASE',
        weekStart: currentWeekStart,
        purchase,
      });
      haptics.success();
      setIsAdding(false);
    },
    [dispatch, currentWeekStart, haptics],
  );

  const handleEditPurchase = useCallback(
    (id: string, name: string, amount: number) => {
      const existing = purchases.find((p) => p.id === id);
      if (!existing) return;
      dispatch({
        type: 'EDIT_PURCHASE',
        weekStart: currentWeekStart,
        purchase: { ...existing, name, amount },
      });
      setEditingPurchaseId(null);
    },
    [dispatch, currentWeekStart, purchases],
  );

  const handleDeletePurchase = useCallback(
    (purchaseId: string) => {
      dispatch({
        type: 'DELETE_PURCHASE',
        weekStart: currentWeekStart,
        purchaseId,
      });
      haptics.impact();
    },
    [dispatch, currentWeekStart, haptics],
  );

  const handleMovePurchase = useCallback(
    (newDate: string) => {
      if (!movingPurchase) return;
      dispatch({
        type: 'EDIT_PURCHASE',
        weekStart: currentWeekStart,
        purchase: { ...movingPurchase, date: newDate },
      });
      haptics.light();
      setMovingPurchase(null);
    },
    [dispatch, currentWeekStart, movingPurchase, haptics],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'day-header') {
        return (
          <View style={styles.dayHeader}>
            <Text style={styles.dayName}>{getDayName(item.dateStr)}</Text>
            <Text style={styles.dayDate}>{formatShortDate(item.dateStr)}</Text>
          </View>
        );
      }

      if (item.type === 'empty-day') {
        return (
          <View style={styles.emptyDay}>
            <Text style={styles.emptyDayText}>No purchases</Text>
          </View>
        );
      }

      const { purchase } = item;
      const isEditingThis = editingPurchaseId === purchase.id;

      if (isEditingThis) {
        return (
          <EditRow
            purchase={purchase}
            onSubmit={(name, amount) => handleEditPurchase(purchase.id, name, amount)}
            onCancel={() => setEditingPurchaseId(null)}
            onDelete={() => {
              handleDeletePurchase(purchase.id);
              setEditingPurchaseId(null);
            }}
          />
        );
      }

      return (
        <Pressable
          onPress={isEditable ? () => setEditingPurchaseId(purchase.id) : undefined}
          onLongPress={isEditable ? () => {
            haptics.light();
            setMovingPurchase(purchase);
          } : undefined}
          delayLongPress={300}
          style={({ pressed }) => [
            styles.row,
            pressed && styles.rowPressed,
          ]}
        >
          <Text style={styles.rowName} numberOfLines={1}>
            {purchase.name}
          </Text>
          <Text style={styles.rowAmount}>{formatDollars(purchase.amount)}</Text>
        </Pressable>
      );
    },
    [editingPurchaseId, isEditable, handleEditPurchase, handleDeletePurchase, haptics],
  );

  const keyExtractor = useCallback((item: ListItem) => item.key, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WeekHeader
        weekStart={currentWeekStart}
        onPrevious={handlePrevWeek}
        onNext={handleNextWeek}
        spent={totalSpent}
        budget={budget}
        isBudgetEditable={isEditable}
        isCurrentWeek={currentWeekStart === getWeekStart(new Date())}
        onBudgetChange={handleBudgetChange}
      />

      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      {/* Move to day modal */}
      <Modal
        visible={movingPurchase !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMovingPurchase(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setMovingPurchase(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Move to</Text>
            {weekDates.map((dateStr) => {
              const isCurrent = movingPurchase?.date === dateStr;
              return (
                <Pressable
                  key={dateStr}
                  style={({ pressed }) => [
                    styles.modalOption,
                    isCurrent && styles.modalOptionCurrent,
                    pressed && styles.modalOptionPressed,
                  ]}
                  onPress={() => handleMovePurchase(dateStr)}
                  disabled={isCurrent}
                >
                  <Text style={[
                    styles.modalOptionDay,
                    isCurrent && styles.modalOptionTextCurrent,
                  ]}>
                    {getDayName(dateStr)}
                  </Text>
                  <Text style={[
                    styles.modalOptionDate,
                    isCurrent && styles.modalOptionTextCurrent,
                  ]}>
                    {formatShortDate(dateStr)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      {isAdding && (
        <PurchaseForm
          onSubmit={handleAddPurchase}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {isEditable && !isAdding && !editingPurchaseId && (
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
            { bottom: insets.bottom + 16 },
          ]}
          onPress={() => setIsAdding(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      )}
    </View>
  );
}

function EditRow({
  purchase,
  onSubmit,
  onCancel,
  onDelete,
}: {
  purchase: Purchase;
  onSubmit: (name: string, amount: number) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [editName, setEditName] = React.useState(purchase.name);
  const [editAmount, setEditAmount] = React.useState(String(purchase.amount));

  const handleSubmit = () => {
    const amount = parseDollarInput(editAmount);
    if (editName.trim() && amount > 0) {
      onSubmit(editName.trim(), amount);
    } else {
      onCancel();
    }
  };

  return (
    <View style={styles.editContainer}>
      <TextInput
        style={styles.editInputField}
        placeholderTextColor={colors.textTertiary}
        value={editName}
        onChangeText={setEditName}
        placeholder="Item name"
        autoFocus
        returnKeyType="next"
      />
      <TextInput
        style={styles.editInputField}
        placeholderTextColor={colors.textTertiary}
        value={editAmount}
        onChangeText={setEditAmount}
        placeholder="$0"
        keyboardType="number-pad"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />
      <View style={styles.editActions}>
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  dayName: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  dayDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  emptyDay: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  emptyDayText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    marginBottom: spacing.xs,
  },
  rowPressed: {
    backgroundColor: colors.surfaceHover,
  },
  rowName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  rowAmount: {
    ...typography.bodyMono,
    color: colors.textSecondary,
  },
  editContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editInputField: {
    marginBottom: spacing.sm,
    backgroundColor: colors.inputBg,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    color: colors.textPrimary,
    ...typography.body,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  saveButtonText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  cancelButtonText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  deleteButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  deleteButtonText: {
    ...typography.caption,
    color: colors.danger,
    fontWeight: '600',
  },
  // Move-to modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    width: 280,
  },
  modalTitle: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
  },
  modalOptionCurrent: {
    backgroundColor: colors.primaryMuted,
  },
  modalOptionPressed: {
    backgroundColor: colors.surfaceHover,
  },
  modalOptionDay: {
    ...typography.body,
    color: colors.textPrimary,
  },
  modalOptionDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  modalOptionTextCurrent: {
    color: colors.primary,
  },
  addButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  addButtonPressed: {
    transform: [{ scale: 0.93 }],
    opacity: 0.9,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#FFFFFF',
    marginTop: -1,
  },
});
