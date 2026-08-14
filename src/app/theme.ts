import { MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

const colors = {
  primary: '#2563EB',
  onPrimary: '#FFFFFF',
  primaryContainer: '#DBEAFE',
  onPrimaryContainer: '#1E3A8A',
  secondary: '#0F766E',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#CCFBF1',
  onSecondaryContainer: '#134E4A',
  tertiary: '#0369A1',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#E0F2FE',
  onTertiaryContainer: '#0C4A6E',
  error: '#DC2626',
  onError: '#FFFFFF',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#7F1D1D',
  background: '#F8FAFC',
  onBackground: '#0F172A',
  surface: '#FFFFFF',
  onSurface: '#0F172A',
  surfaceVariant: '#F1F5F9',
  surfaceDisabled: '#E2E8F0',
  onSurfaceVariant: '#475569',
  onSurfaceDisabled: '#94A3B8',
  outline: '#CBD5E1',
  outlineVariant: '#E2E8F0',
  shadow: '#0F172A',
  scrim: '#000000',
  backdrop: 'rgba(15, 23, 42, 0.4)',
  inverseSurface: '#0F172A',
  inverseOnSurface: '#F8FAFC',
  inversePrimary: '#93C5FD',
  elevation: {
    level0: 'transparent',
    level1: '#F8FAFC',
    level2: '#F1F5F9',
    level3: '#E2E8F0',
    level4: '#CBD5E1',
    level5: '#94A3B8',
  },
};

export const appTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...colors,
  },
};

export const navigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.onSurface,
    border: colors.outline,
    notification: colors.error,
  },
};
