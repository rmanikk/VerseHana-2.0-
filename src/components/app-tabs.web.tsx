
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabTriggerSlotProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const navigationItems = [
  { name: 'home', href: '/', label: 'Home', icon: '⌂' },
  { name: 'discover', href: '/explore', label: 'Discover', icon: '✳' },
] as const;

export default function AppTabs() {
  return (
    <Tabs>
      {/* Register routes directly inside TabList */}
      <TabList style={styles.hiddenRouteList}>
        {navigationItems.map((item) => (
          <TabTrigger
            key={item.name}
            name={item.name}
            href={item.href}
          >
            {item.label}
          </TabTrigger>
        ))}
      </TabList>

      <View style={styles.app}>
        <View style={styles.topBar}>
          <View style={styles.topBarInner}>
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>V</Text>
              </View>
              <Text style={styles.brandText}>VerseHana</Text>
              <Text style={styles.versionText}>2.0</Text>
            </View>

            <View style={styles.navigation}>
              {navigationItems.map((item) => (
                <TabTrigger key={item.name} name={item.name} asChild>
                  <WebTabButton icon={item.icon}>
                    {item.label}
                  </WebTabButton>
                </TabTrigger>
              ))}
            </View>

            <View style={styles.status}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                YOUR SOUND, YOUR WORLD
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.screen}>
          <TabSlot />
        </View>
      </View>
    </Tabs>
  );
}

function WebTabButton({
  children,
  isFocused,
  icon,
  ...props
}: TabTriggerSlotProps & { icon: string }) {
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [
        styles.navButton,
        isFocused && styles.navButtonActive,
        pressed && styles.navButtonPressed,
      ]}
    >
      <Text style={[styles.navIcon, isFocused && styles.navTextActive]}>
        {icon}
      </Text>
      <Text style={[styles.navText, isFocused && styles.navTextActive]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#06181B',
  },
  hiddenRouteList: {
    display: 'none',
  },
  topBar: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#1B3B3E',
    backgroundColor: '#081E21',
  },
  topBarInner: {
    width: '100%',
    maxWidth: 1200,
    minHeight: 76,
    alignSelf: 'center',
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },
  brandText: {
    color: '#F5FFFF',
    fontSize: 19,
    fontWeight: '800',
  },
  versionText: {
    color: '#22D3EE',
    fontSize: 11,
    fontWeight: '800',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButton: {
    minHeight: 42,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navButtonActive: {
    backgroundColor: '#123437',
  },
  navButtonPressed: {
    opacity: 0.7,
  },
  navIcon: {
    color: '#9FB8BA',
    fontSize: 17,
  },
  navText: {
    color: '#9FB8BA',
    fontSize: 12,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#22D3EE',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14B8A6',
  },
  statusText: {
    color: '#718D90',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  screen: {
    flex: 1,
    width: '100%',
  },
});
