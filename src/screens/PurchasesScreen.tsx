import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../constants/theme';
import { useAppContext } from '../context/AppContext';
import {
  getWeekStart,
  shiftWeek,
  getWeekDates,
  isCurrentOrFutureWeek,
} from '../utils/dates';
import { WeekHeader } from '../components/WeekHeader';
import { DaySection } from '../components/DaySection';
import { PurchaseForm } from '../components/PurchaseForm';
import { useHaptics } from '../hooks/useHaptics';
import { formatDollars } from '../utils/currency';
import * as Crypto from 'expo-crypto';
import type { Purchase } from '../types';

export default function PurchasesScreen() {
  const insets = useSafeAreaInsets();
  const { data, dispatch } = useAppContext();
  const haptics = useHaptics();

  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(new Date()),
  );
  const [isAdding, setIsAdding] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);

  // Ensure the week exists in state
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

  const isEditable = isCurrentOrFutureWeek(currentWeekStart);

  const handlePrevWeek = useCallback(() => {
    haptics.light();
    setCurrentWeekStart((prev) => shiftWeek(prev, -1));
    setIsAdding(false);
    setEditingPurchase(null);
  }, [haptics]);

  const handleNextWeek = useCallback(() => {
    haptics.light();
    setCurrentWeekStart((prev) => shiftWeek(prev, 1));
    setIsAdding(false);
    setEditingPurchase(null);
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

      // If today is within this week, use today. Otherwise use the week's start date.
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
    (name: string, amount: number) => {
      if (!editingPurchase) return;
      dispatch({
        type: 'EDIT_PURCHASE',
        weekStart: currentWeekStart,
        purchase: { ...editingPurchase, name, amount },
      });
      setEditingPurchase(null);
    },
    [dispatch, currentWeekStart, editingPurchase],
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

  const handleStartEdit = useCallback((purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsAdding(false);
  }, []);

  const handleCancelForm = useCallback(() => {
    setIsAdding(false);
    setEditingPurchase(null);
  }, []);

  // Group purchases by date
  const purchasesByDate = useMemo(() => {
    const map: Record<string, Purchase[]> = {};
    for (const p of purchases) {
      if (!map[p.date]) map[p.date] = [];
      map[p.date].push(p);
    }
    return map;
  }, [purchases]);

  // Check if there are any purchases at all
  const hasPurchases = purchases.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WeekHeader
        weekStart={currentWeekStart}
        onPrevious={handlePrevWeek}
        onNext={handleNextWeek}
        spent={totalSpent}
        budget={budget}
        isBudgetEditable={isEditable}
        onBudgetChange={handleBudgetChange}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {!hasPurchases && !isAdding && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No purchases this week</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap + to log a purchase
            </Text>
          </View>
        )}

        {weekDates.map((dateStr) => {
          const dayPurchases = purchasesByDate[dateStr];
          if (!dayPurchases && !isAdding) return null;

          return (
            <DaySection
              key={dateStr}
              dateStr={dateStr}
              purchases={dayPurchases ?? []}
              onEdit={isEditable ? handleStartEdit : undefined}
              onDelete={isEditable ? handleDeletePurchase : undefined}
              editingPurchaseId={editingPurchase?.id ?? null}
              onEditSubmit={handleEditPurchase}
              onEditCancel={handleCancelForm}
            />
          );
        })}
      </ScrollView>

      {/* Add / Edit Form */}
      {isAdding && (
        <PurchaseForm
          onSubmit={handleAddPurchase}
          onCancel={handleCancelForm}
        />
      )}

      {/* Floating Add Button */}
      {isEditable && !isAdding && !editingPurchase && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
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
