import * as Haptics from 'expo-haptics';

export function useHaptics() {
  return {
    impact: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    success: () =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  };
}
