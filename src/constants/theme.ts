export const colors = {
  // Backgrounds
  background: '#0F1117',
  surface: '#1A1D27',
  surfaceHover: '#222633',

  // Primary accent
  primary: '#6C63FF',
  primaryMuted: '#6C63FF1A',

  // Text hierarchy
  textPrimary: '#F0F0F3',
  textSecondary: '#9BA1B0',
  textTertiary: '#565C6B',

  // Semantic
  success: '#34D399',
  successMuted: '#34D3991A',
  danger: '#F472B6',
  dangerMuted: '#F472B61A',

  // Structural
  border: '#2A2E3A',
  inputBg: '#1E2130',
  tabBarBg: '#13151D',
} as const;

export const typography = {
  displayLarge: {
    fontSize: 36,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  subheading: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.1,
    lineHeight: 24,
  },
  bodyMono: {
    fontSize: 17,
    fontWeight: '500' as const,
    letterSpacing: 0,
    lineHeight: 24,
    fontVariant: ['tabular-nums'] as ('tabular-nums')[],
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  footnote: {
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
} as const;
