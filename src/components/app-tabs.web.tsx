import { Link, Slot, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Colors, Spacing } from "@/constants/theme";

const colors = Colors.dark;

const tabs = [
  { label: "Home", href: "/" as const },
  { label: "Search", href: "/search" as const },
  { label: "Pulse", href: "/pulse" as const },
  { label: "Library", href: "/library" as const },
  { label: "Profile", href: "/profile" as const },
];

export default function AppTabsWeb() {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        <Text style={styles.brand}>VerseHana</Text>

        <View style={styles.links}>
          {tabs.map((tab) => {
            const active =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={[styles.link, active && styles.activeLink]}
              >
                <Text
                  style={[
                    styles.linkText,
                    active && styles.activeLinkText,
                  ]}
                >
                  {tab.label}
                </Text>
              </Link>
            );
          })}
        </View>
      </View>

      <View style={styles.content}>
        <Slot />
      </View>

      {showSplash && (
        <View style={styles.splashOverlay}>
          <AnimatedSplashOverlay
            onFinish={() => setShowSplash(false)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: colors.background,
  },

  navigation: {
    minHeight: 68,
    paddingHorizontal: Spacing.four,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  brand: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.6,
  },

  links: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },

  link: {
    paddingVertical: 12,
    textDecorationLine: "none",
  },

  activeLink: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },

  linkText: {
    color: colors.textMuted,
    fontSize: 14,
  },

  activeLinkText: {
    color: colors.primary,
    fontWeight: "700",
  },

  content: {
    flex: 1,
  },

  splashOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999999,
    elevation: 999999,
  },
});