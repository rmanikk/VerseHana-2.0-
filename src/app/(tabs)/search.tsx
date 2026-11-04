
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

export default function PlaceholderScreen() {
  const colors = Colors.dark;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.eyebrow, { color: colors.primary }]}>
        VERSEHANA 2.0
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Search
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Your next favorite sound is waiting.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 500,
    padding: 32,
    justifyContent: 'center',
    gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
  },
  description: {
    fontSize: 15,
  },
});
