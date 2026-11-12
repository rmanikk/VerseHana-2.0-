
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";

type LoaderSize = "sm" | "md" | "lg";

interface VerseHanaLoaderProps {
  size?: LoaderSize;
  fullScreen?: boolean;
}

const SIZES: Record<LoaderSize, number> = {
  sm: 48,
  md: 112,
  lg: 200,
};

export function VerseHanaLoader({
  size = "md",
  fullScreen = false,
}: VerseHanaLoaderProps) {
  const px = SIZES[size];

  // Continuous rotation for the glowing ring.
  const rotation = useRef(new Animated.Value(0)).current;

  // Gentle pulsing glow.
  const pulse = useRef(new Animated.Value(0)).current;

  // Subtle logo breathing.
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const breatheAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    rotateAnimation.start();
    pulseAnimation.start();
    breatheAnimation.start();

    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
      breatheAnimation.stop();
    };
  }, [rotation, pulse, breathe]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const glowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.55],
  });

  const glowScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.88, 1.12],
  });

  const logoScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.035],
  });

  const logoTranslateY = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1.5],
  });

  const ringSize = px * 0.94;
  const logoSize = px * 0.64;

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel="VerseHana loading"
      accessibilityState={{ busy: true }}
    >
      <View
        style={{
          width: px,
          height: px,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Soft pulsing glow behind the logo */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            {
              width: px * 0.78,
              height: px * 0.78,
              borderRadius: px,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        {/* Subtle static outer ring */}
        <View
          pointerEvents="none"
          style={[
            styles.outerRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderWidth: size === "sm" ? 1 : 1.5,
            },
          ]}
        />

        {/* Rotating cyan loading ring */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.rotatingRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderWidth: size === "sm" ? 2 : 2.5,
              transform: [{ rotate }],
            },
          ]}
        />

        {/* Original VerseHana splash icon */}
        <Animated.View
          style={{
            alignItems: "center",
            justifyContent: "center",
            transform: [
              { scale: logoScale },
              { translateY: logoTranslateY },
            ],
          }}
        >
          <Image
            source={require("../../../assets/images/splash-icon.png")}
            style={{
              width: logoSize,
              height: logoSize,
            }}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  fullScreen: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#061719",
  },

  glow: {
    position: "absolute",
    backgroundColor: "rgba(45, 212, 191, 0.16)",
    shadowColor: "#2DD4BF",
    shadowOpacity: 0.8,
    shadowRadius: 22,
    elevation: 8,
  },

  outerRing: {
    position: "absolute",
    borderColor: "rgba(45, 212, 191, 0.13)",
  },

  rotatingRing: {
    position: "absolute",
    borderColor: "transparent",
    borderTopColor: "#67E8F9",
    borderRightColor: "#2DD4BF",
    borderBottomColor: "rgba(6, 182, 212, 0.45)",
    borderLeftColor: "transparent",

    shadowColor: "#2DD4BF",
    shadowOpacity: 0.85,
    shadowRadius: 9,
    elevation: 5,
  },
});
