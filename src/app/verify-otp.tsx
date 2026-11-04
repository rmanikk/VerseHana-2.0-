import { StyleSheet, Text, View } from "react-native";

export default function VerifyOtpScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your email</Text>
      <Text style={styles.subtitle}>
        Your OTP verification screen will be implemented here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030707",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#35C9BC",
    fontSize: 26,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#A3B8B8",
    marginTop: 12,
    textAlign: "center",
  },
});
