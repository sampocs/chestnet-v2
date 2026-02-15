import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { colors, typography, radii } from '../constants/theme';

const DELETE_THRESHOLD = -150;

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete: () => void;
  onSwipeOpen?: () => void;
  swipeableRef?: React.RefObject<SwipeableMethods | null>;
}

function RightAction(
  _prog: SharedValue<number>,
  drag: SharedValue<number>,
  onPress: () => void,
) {
  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      drag.value,
      [-DELETE_THRESHOLD, -80, 0],
      [DELETE_THRESHOLD, 80, 0],
      'clamp',
    );
    return { width: Math.abs(width) };
  });

  return (
    <Reanimated.View style={[styles.rightActionContainer, animatedStyle]}>
      <Pressable style={styles.deleteAction} onPress={onPress}>
        <Text style={styles.deleteText}>Delete</Text>
      </Pressable>
    </Reanimated.View>
  );
}

export function SwipeableRow({
  children,
  onDelete,
  onSwipeOpen,
  swipeableRef: externalRef,
}: SwipeableRowProps) {
  const internalRef = useRef<SwipeableMethods | null>(null);
  const swipeRef = externalRef ?? internalRef;

  const handleDelete = useCallback(() => {
    swipeRef.current?.close();
    onDelete();
  }, [onDelete, swipeRef]);

  const renderRightActions = useCallback(
    (prog: SharedValue<number>, drag: SharedValue<number>) =>
      RightAction(prog, drag, handleDelete),
    [handleDelete],
  );

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      friction={2}
      rightThreshold={80}
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={(direction) => {
        if (direction === 'right') {
          onSwipeOpen?.();
        }
      }}
      onSwipeableOpen={(direction) => {
        if (direction === 'right') {
          // Full swipe past threshold triggers delete
          handleDelete();
        }
      }}
      overshootRight={false}
    >
      {children}
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  rightActionContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: radii.md,
    borderBottomRightRadius: radii.md,
  },
  deleteText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
