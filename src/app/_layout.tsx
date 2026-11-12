
import { useCallback, useState } from "react";
import { View } from "react-native";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Colors } from "@/constants/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

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

export default function RootLayout() {
  const [rootReady, setRootReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  const onRootLayout = useCallback(() => {
    if (rootReady) return;

    SplashScreen.hideAsync().catch(() => {});
    setRootReady(true);
  }, [rootReady]);

  const handleSplashFinish = useCallback(() => {
    setShowAnimatedSplash(false);
  }, []);

  return (
    <ThemeProvider value={theme}>
      <View style={{ flex: 1 }} onLayout={onRootLayout}>
        <StatusBar style="light" />

        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="verify-otp" />
          <Stack.Screen name="choose-username" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>

        {rootReady && showAnimatedSplash && (
          <AnimatedSplashOverlay onFinish={handleSplashFinish} />
        )}
      </View>
    </ThemeProvider>
  );
}
