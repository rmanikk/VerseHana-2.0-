import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    // Brand
    primary: "#0F9F91",
    primaryPressed: "#0B8278",
    cyan: "#0891B2",

    // Backgrounds
    background: "#F4FAFA",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#EAF5F5",
    surfaceElevated: "#FFFFFF",

    // Text
    text: "#102A2D",
    textSecondary: "#527174",
    textMuted: "#789294",

    // Borders and states
    border: "#D5E7E8",
    success: "#15803D",
    error: "#DC2626",

    // Music moods
    moodHappy: "#E9A23B",
    moodCalm: "#0F9F91",
    moodRain: "#6487C8",
    moodNight: "#7566B5",
    moodLove: "#D96C91",
    moodFocus: "#0891B2",
    moodParty: "#D977D0",
    moodSad: "#7186A8",
  },

  dark: {
    // Brand
    primary: "#14B8A6",
    primaryPressed: "#0D9488",
    cyan: "#22D3EE",

    // Backgrounds
    background: "#06181B",
    backgroundElement: "#0D272A",
    backgroundSelected: "#123437",
    surfaceElevated: "#173D40",

    // Text
    text: "#F5FFFF",
    textSecondary: "#9FB8BA",
    textMuted: "#718D90",

    // Borders and states
    border: "#1B3B3E",
    success: "#4ADE80",
    error: "#F87171",

    // Music moods
    moodHappy: "#F6BC57",
    moodCalm: "#14B8A6",
    moodRain: "#83A8F0",
    moodNight: "#A99AF5",
    moodLove: "#F28BAE",
    moodFocus: "#22D3EE",
    moodParty: "#E9A1E0",
    moodSad: "#9BAED0",
  },
} as const;

export type ThemeName = keyof typeof Colors;

export type ThemeColor = keyof (typeof Colors)["light"] &
  keyof (typeof Colors)["dark"];

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
