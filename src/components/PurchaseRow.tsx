import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, typography, spacing, radii } from '../constants/theme';
import { formatDollars, parseDollarInput } from '../utils/currency';
import type { Purchase } from '../types';

interface PurchaseRowProps {
  purchase: Purchase;
  isEditing: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onEditSubmit: (name: string, amount: number) => void;
  onEditCancel: () => void;
}

export function PurchaseRow({
  purchase,
  isEditing,
  onEdit,
  onDelete,
  onEditSubmit,
  onEditCancel,
}: PurchaseRowProps) {
  const [editName, setEditName] = useState(purchase.name);
  const [editAmount, setEditAmount] = useState(String(purchase.amount));
  const translateX = useRef(new Animated.Value(0)).current;
  const [showDelete, setShowDelete] = useState(false);

  // Reset edit fields when entering edit mode
  React.useEffect(() => {
    if (isEditing) {
      setEditName(purchase.name);
      setEditAmount(String(purchase.amount));
    }
  }, [isEditing, purchase.name, purchase.amount]);

  const handleEditSubmit = () => {
    const amount = parseDollarInput(editAmount);
    if (editName.trim() && amount > 0) {
      onEditSubmit(editName.trim(), amount);
    } else {
      onEditCancel();
    }
  };

  const handleSwipeStart = () => {
    if (!onDelete) return;
    setShowDelete(true);
    Animated.spring(translateX, {
      toValue: -80,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
  };

  const handleSwipeReset = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start(() => setShowDelete(false));
  };

  const handleDelete = () => {
    onDelete?.();
  };

  if (isEditing) {
    return (
      <View style={styles.editContainer}>
        <TextInput
          style={[styles.editInput, styles.editNameInput]}
          value={editName}
          onChangeText={setEditName}
          placeholder="Item name"
          placeholderTextColor={colors.textTertiary}
          autoFocus
          returnKeyType="next"
        />
        <TextInput
          style={[styles.editInput, styles.editAmountInput]}
          value={editAmount}
          onChangeText={setEditAmount}
          placeholder="$0"
          placeholderTextColor={colors.textTertiary}
          keyboardType="number-pad"
          returnKeyType="done"
          onSubmitEditing={handleEditSubmit}
        />
        <View style={styles.editActions}>
          <Pressable
            onPress={handleEditSubmit}
            style={({ pressed }) => [
              styles.editButton,
              styles.saveButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
          <Pressable
            onPress={onEditCancel}
            style={({ pressed }) => [
              styles.editButton,
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.rowWrapper}>
      {showDelete && (
        <Pressable style={styles.deleteAction} onPress={handleDelete}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      )}
      <Animated.View
        style={[styles.row, { transform: [{ translateX }] }]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.rowContent,
            pressed && styles.rowPressed,
          ]}
          onPress={onEdit}
          onLongPress={onDelete ? handleSwipeStart : undefined}
          delayLongPress={300}
        >
          <Text style={styles.name} numberOfLines={1}>
            {purchase.name}
          </Text>
          <Text style={styles.amount}>{formatDollars(purchase.amount)}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowWrapper: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
  },
  rowPressed: {
    backgroundColor: colors.surfaceHover,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  amount: {
    ...typography.bodyMono,
    color: colors.textSecondary,
  },
  deleteAction: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: colors.danger,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  editContainer: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editInput: {
    backgroundColor: colors.inputBg,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xs,
    color: colors.textPrimary,
    ...typography.body,
    marginBottom: spacing.sm,
  },
  editNameInput: {
    flex: 0,
  },
  editAmountInput: {
    flex: 0,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButtonText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
