import { DarkTheme, ThemeProvider } from "expo-router";
import { StatusBar } from "react-native";

import AppTabs from "@/components/app-tabs";
import { Colors } from "@/constants/theme";

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.backgroundElement,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.cyan,
  },
};

export default function TabLayout() {
  return (
    <ThemeProvider value={theme}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.dark.background}
      />
      <AppTabs />
    </ThemeProvider>
  );
}
