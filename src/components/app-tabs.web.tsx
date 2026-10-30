import { Link, Slot, usePathname } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

const tabs = [
  { label: "Home", href: "/" as const },
  { label: "Explore", href: "/explore" as const },
];

export default function AppTabsWeb() {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Fallback in case the splash animation fails to finish.
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
                  style={[styles.linkText, active && styles.activeLinkText]}
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
          <AnimatedSplashOverlay onFinish={() => setShowSplash(false)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "#06181B",
  },
  navigation: {
    minHeight: 68,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#183438",
  },
  brand: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  links: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  link: {
    paddingVertical: 12,
    textDecorationLine: "none",
  },
  activeLink: {
    borderBottomWidth: 2,
    borderBottomColor: "#35D0C1",
  },
  linkText: {
    color: "#8FA8AA",
    fontSize: 15,
  },
  activeLinkText: {
    color: "#35D0C1",
    fontWeight: "600",
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
