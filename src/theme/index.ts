export const Colors = {
  light: {
    primary: '#4F46E5', // Deep indigo
    primaryDark: '#3730A3',
    primaryLight: '#EEF2FF',
    secondary: '#7C3AED', // Soft violet
    secondaryLight: '#F5F3FF',
    accent: '#0D9488', // Teal
    accentLight: '#F0FDFA',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    success: '#059669',
    successLight: '#D1FAE5',

    // Backgrounds & Surfaces
    background: '#F8FAFC', // Warm off-white / slate 50
    surface: '#FFFFFF',
    surfaceSubtle: '#F1F5F9',
    surfaceBorder: '#E2E8F0',

    // Text & Content
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#94A3B8',
    textInverse: '#FFFFFF',

    // Navigation & Tabs
    tabActive: '#4F46E5',
    tabInactive: '#94A3B8',
    cardBorder: '#E2E8F0',
    divider: '#E2E8F0',
    shadow: '#0F172A14',
  },
  dark: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#312E81',
    secondary: '#8B5CF6',
    secondaryLight: '#4C1D95',
    accent: '#14B8A6',
    accentLight: '#134E4A',
    warning: '#F59E0B',
    warningLight: '#78350F',
    danger: '#EF4444',
    dangerLight: '#7F1D1D',
    success: '#10B981',
    successLight: '#064E3B',

    // Backgrounds & Surfaces
    background: '#0F172A', // Deep charcoal / slate 900
    surface: '#1E293B', // Slate 800
    surfaceSubtle: '#334155', // Slate 700
    surfaceBorder: '#334155',

    // Text & Content
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#64748B',
    textInverse: '#0F172A',

    // Navigation & Tabs
    tabActive: '#818CF8',
    tabInactive: '#64748B',
    cardBorder: '#334155',
    divider: '#334155',
    shadow: '#00000040',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  huge: 48,
};

export const Typography = {
  sizes: {
    caption: 12,
    bodySm: 14,
    body: 16,
    subtitle: 18,
    title: 20,
    h2: 24,
    h1: 28,
    hero: 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export type ThemeType = 'light' | 'dark';
