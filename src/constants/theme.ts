/**
 * Centralized design tokens for Hamro Safety.
 * Every screen/component should pull colors, spacing, radii, and typography
 * from here rather than hard-coding values, so the app stays visually
 * consistent and themeable (light/dark/system).
 */

export const palette = {
  emergency: "#E11D2E",
  emergencyDark: "#B0121F",
  emergencyLight: "#FF5A63",
  navy: "#0B1220",
  navyLight: "#1B2536",
  safe: "#16A34A",
  safeLight: "#DCFCE7",
  warn: "#D97706",
  warnLight: "#FEF3C7",
  white: "#FFFFFF",
  black: "#000000",
  gray50: "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray400: "#94A3B8",
  gray500: "#64748B",
  gray700: "#334155",
  gray900: "#0F172A",
};

export const lightTheme = {
  mode: "light" as const,
  background: palette.gray50,
  surface: palette.white,
  surfaceAlt: palette.gray100,
  textPrimary: palette.navy,
  textSecondary: palette.gray500,
  border: palette.gray200,
  emergency: palette.emergency,
  emergencyDark: palette.emergencyDark,
  safe: palette.safe,
  safeSurface: palette.safeLight,
  warn: palette.warn,
  warnSurface: palette.warnLight,
  tabBarBackground: palette.white,
  tabBarActive: palette.navy,
  tabBarInactive: palette.gray400,
};

export const darkTheme = {
  mode: "dark" as const,
  background: palette.navy,
  surface: palette.navyLight,
  surfaceAlt: "#141C2B",
  textPrimary: palette.white,
  textSecondary: palette.gray400,
  border: "#2A3547",
  emergency: palette.emergencyLight,
  emergencyDark: palette.emergency,
  safe: palette.safe,
  safeSurface: "#0F2A1B",
  warn: palette.warn,
  warnSurface: "#2E2410",
  tabBarBackground: palette.navyLight,
  tabBarActive: palette.white,
  tabBarInactive: palette.gray500,
};

export type AppTheme = typeof lightTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "700" as const },
  h2: { fontSize: 22, fontWeight: "700" as const },
  h3: { fontSize: 18, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const },
  bodyBold: { fontSize: 16, fontWeight: "600" as const },
  caption: { fontSize: 13, fontWeight: "400" as const },
  button: { fontSize: 17, fontWeight: "700" as const },
};

/** Minimum touch target size per accessibility guidance (WCAG / platform HIG). */
export const MIN_TOUCH_TARGET = 44;
