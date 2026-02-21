import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useRoute } from '@react-navigation/native';
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
  getTodayString,
} from '../utils/dates';
import { Ionicons } from '@expo/vector-icons';
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
  const route = useRoute<any>();
  const { data, dispatch } = useAppContext();
  const haptics = useHaptics();

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(new Date()),
  );
  const [isAdding, setIsAdding] = useState(false);
  const [addingForDate, setAddingForDate] = useState<string | null>(null);
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<ListItem>>(null);

  // Navigate to a specific week when coming from History
  useEffect(() => {
    if (route.params?.weekStart) {
      setCurrentWeekStart(route.params.weekStart);
    }
  }, [route.params?.weekStart]);

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
    setAddingForDate(null);
    setEditingPurchaseId(null);
    setEditingDate(null);
  }, [haptics]);

  const handleNextWeek = useCallback(() => {
    haptics.light();
    setCurrentWeekStart((prev) => shiftWeek(prev, 1));
    setIsAdding(false);
    setAddingForDate(null);
    setEditingPurchaseId(null);
    setEditingDate(null);
  }, [haptics]);

  const handleJumpToCurrentWeek = useCallback(() => {
    haptics.light();
    setCurrentWeekStart(getWeekStart(new Date()));
    setIsAdding(false);
    setAddingForDate(null);
    setEditingPurchaseId(null);
    setEditingDate(null);
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
      const purchaseDate = (() => {
        if (addingForDate) return addingForDate;
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const weekDatesArr = getWeekDates(currentWeekStart);
        return weekDatesArr.includes(todayStr) ? todayStr : currentWeekStart;
      })();

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
      setAddingForDate(null);
    },
    [dispatch, currentWeekStart, haptics, addingForDate],
  );

  const handleEditPurchase = useCallback(
    (id: string, name: string, amount: number, date: string) => {
      const existing = purchases.find((p) => p.id === id);
      if (!existing) return;
      dispatch({
        type: 'EDIT_PURCHASE',
        weekStart: currentWeekStart,
        purchase: { ...existing, name, amount, date },
      });
      setEditingPurchaseId(null);
      setEditingDate(null);
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

  const scrollToEditingItem = useCallback(() => {
    if (!editingPurchaseId) return;
    const index = listData.findIndex(
      (item) => item.type === 'purchase' && item.purchase.id === editingPurchaseId,
    );
    if (index < 0) return;
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      sub.remove();
      flatListRef.current?.scrollToIndex({ index, viewPosition: 1.0, animated: true });
    });
    setTimeout(() => sub.remove(), 500);
  }, [editingPurchaseId, listData]);

  const today = getTodayString();

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'day-header') {
        // Check if this header is above the currently-editing purchase
        const editingPurchase = editingPurchaseId
          ? purchases.find((p) => p.id === editingPurchaseId)
          : null;
        const isEditHeader = editingPurchase && item.dateStr === editingPurchase.date;
        // When editing, display the selected date (which may differ from the original)
        const displayDate = isEditHeader && editingDate ? editingDate : item.dateStr;
        const isToday = displayDate === today;
        const dateIndex = isEditHeader && editingDate ? weekDates.indexOf(editingDate) : -1;
        const showPrev = isEditHeader && dateIndex > 0;
        const showNext = isEditHeader && dateIndex < weekDates.length - 1;

        if (isEditHeader) {
          return (
            <View style={[styles.dayHeader, isToday && styles.dayHeaderToday]}>
              <Pressable
                onPress={showPrev ? () => {
                  haptics.light();
                  setEditingDate(weekDates[dateIndex - 1]);
                } : undefined}
                style={({ pressed }) => [
                  styles.dayHeaderArrow,
                  pressed && showPrev && { opacity: 0.5 },
                ]}
              >
                <Ionicons name="chevron-back" size={18} color={showPrev ? colors.primary : colors.textTertiary} />
              </Pressable>
              <Text style={[styles.dayName, styles.dayNameEditing]}>
                {getDayName(displayDate)}
              </Text>
              <Text style={[styles.dayDate, styles.dayDateEditing]}>
                {formatShortDate(displayDate)}
              </Text>
              <Pressable
                onPress={showNext ? () => {
                  haptics.light();
                  setEditingDate(weekDates[dateIndex + 1]);
                } : undefined}
                style={({ pressed }) => [
                  styles.dayHeaderArrow,
                  pressed && showNext && { opacity: 0.5 },
                ]}
              >
                <Ionicons name="chevron-forward" size={18} color={showNext ? colors.primary : colors.textTertiary} />
              </Pressable>
            </View>
          );
        }

        return (
          <Pressable
            onLongPress={() => {
              haptics.impact();
              setIsAdding(true);
              setAddingForDate(item.dateStr);
            }}
            delayLongPress={400}
          >
            <View style={[styles.dayHeader, isToday && styles.dayHeaderToday]}>
              <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                {getDayName(item.dateStr)}
              </Text>
              <Text style={[styles.dayDate, isToday && styles.dayDateToday]}>
                {isToday ? 'Today' : formatShortDate(item.dateStr)}
              </Text>
            </View>
          </Pressable>
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
            onSubmit={(name, amount) => handleEditPurchase(purchase.id, name, amount, editingDate ?? purchase.date)}
            onCancel={() => { setEditingPurchaseId(null); setEditingDate(null); }}
            onDelete={() => {
              handleDeletePurchase(purchase.id);
              setEditingPurchaseId(null);
              setEditingDate(null);
            }}
            onLayout={scrollToEditingItem}
          />
        );
      }

      return (
        <Pressable
          onPress={isEditable ? () => {
            setEditingPurchaseId(purchase.id);
            setEditingDate(purchase.date);
          } : undefined}
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
    [editingPurchaseId, editingDate, isEditable, handleEditPurchase, handleDeletePurchase, haptics, today, scrollToEditingItem, weekDates, purchases],
  );

  const keyExtractor = useCallback((item: ListItem) => item.key, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WeekHeader
        weekStart={currentWeekStart}
        onPrevious={handlePrevWeek}
        onNext={handleNextWeek}
        onJumpToCurrentWeek={handleJumpToCurrentWeek}
        spent={totalSpent}
        budget={budget}
        isBudgetEditable={isEditable}
        isCurrentWeek={currentWeekStart === getWeekStart(new Date())}
        onBudgetChange={handleBudgetChange}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <FlatList
          ref={flatListRef}
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, viewPosition: 1.0, animated: true });
            }, 200);
          }}
        />
      </KeyboardAvoidingView>

      {isAdding && (
        <PurchaseForm
          onSubmit={handleAddPurchase}
          onCancel={() => { setIsAdding(false); setAddingForDate(null); }}
        />
      )}

      {isEditable && !isAdding && !editingPurchaseId && (
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
            { bottom: insets.bottom + 16 },
          ]}
          onPress={() => { setIsAdding(true); setAddingForDate(null); }}
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
  onLayout,
}: {
  purchase: Purchase;
  onSubmit: (name: string, amount: number) => void;
  onCancel: () => void;
  onDelete: () => void;
  onLayout?: () => void;
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
    <View style={styles.editContainer} onLayout={onLayout}>
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
  dayHeaderToday: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: spacing.sm,
  },
  dayName: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  dayNameToday: {
    color: colors.primary,
  },
  dayDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  dayDateToday: {
    color: colors.primary,
  },
  dayNameEditing: {
    color: colors.textPrimary,
  },
  dayDateEditing: {
    color: colors.textSecondary,
  },
  dayHeaderArrow: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
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
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
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
