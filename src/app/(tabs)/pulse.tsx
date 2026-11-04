import { StyleSheet, Text, View } from "react-native";

export default function PulseScreen() {
  return (
    <View style={styles.container}>
      <Text>Pulse</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
