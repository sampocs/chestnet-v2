import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import PurchasesScreen from '../screens/PurchasesScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { colors, typography } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: 88,
          paddingBottom: 28,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: typography.footnote.fontSize,
          fontWeight: '500',
          letterSpacing: 0.2,
        },
      }}
    >
      <Tab.Screen
        name="Purchases"
        component={PurchasesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
