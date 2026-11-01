import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  dark: {
    // Brand
    primary: "#35C9BC",
    primaryPressed: "#20A99D",
    cyan: "#58D8E8",

    // Backgrounds
    background: "#07191B",
    backgroundElement: "#102B2D",
    backgroundSelected: "#194144",
    surfaceElevated: "#1B3B3D",

    // Text
    text: "#F2FAF9",
    textSecondary: "#A3B8B8",
    textMuted: "#718B8C",

    // Borders and states
    border: "#234345",
    success: "#36C978",
    error: "#F07878",

    // Music moods
    moodHappy: "#F6BC57",
    moodCalm: "#35C9BC",
    moodRain: "#83A8F0",
    moodNight: "#A99AF5",
    moodLove: "#F28BAE",
    moodFocus: "#65C98B",
    moodParty: "#E9A1E0",
    moodSad: "#9BAED0",
  },
} as const;

export type ThemeName = "dark";

export type ThemeColor = keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Typography = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  weight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const BottomTabInset =
  Platform.select({
    ios: 50,
    android: 80,
  }) ?? 0;

export const MaxContentWidth = 800;