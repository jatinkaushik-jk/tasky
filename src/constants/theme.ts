import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A2E',
    background: '#FAFAFA',
    backgroundElement: '#F0F0F5',
    backgroundSelected: '#E4E4EF',
    textSecondary: '#6B6B8A',
    // Tasky brand colors
    accent: '#7C5CFC',
    accentSoft: '#EDE8FF',
    accentText: '#5B3FD4',
    success: '#34C97B',
    successSoft: '#E6F9F1',
    deadline: '#FF6B6B',
    deadlineSoft: '#FFF0F0',
    warning: '#FFB347',
    warningSoft: '#FFF6E6',
    surface: '#FFFFFF',
    surfaceAlt: '#F4F3FA',
    border: '#E8E8F0',
    borderStrong: '#C8C8DC',
    overlay: 'rgba(0,0,0,0.45)',
    checkboxBorder: '#C5BFE8',
  },
  dark: {
    text: '#F0F0F8',
    background: '#0F0F14',
    backgroundElement: '#1C1C25',
    backgroundSelected: '#26263A',
    textSecondary: '#9090B0',
    // Tasky brand colors
    accent: '#9D7FFF',
    accentSoft: '#2D2550',
    accentText: '#C4AEFF',
    success: '#2EBD71',
    successSoft: '#0F2E1F',
    deadline: '#FF8080',
    deadlineSoft: '#2E1010',
    warning: '#FFCC77',
    warningSoft: '#2E2010',
    surface: '#1A1A24',
    surfaceAlt: '#14141C',
    border: '#26263A',
    borderStrong: '#3C3C58',
    overlay: 'rgba(0,0,0,0.7)',
    checkboxBorder: '#5040A0',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
