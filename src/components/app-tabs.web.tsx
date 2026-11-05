
import { Link, Slot, usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

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
});
