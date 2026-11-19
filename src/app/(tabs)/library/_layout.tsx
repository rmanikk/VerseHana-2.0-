
import { Stack } from "expo-router";

import { Colors } from "@/constants/theme";

export default function LibraryLayout() {
  const colors = Colors.dark;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: "slide_from_right",
      }}
    />
  );
}
