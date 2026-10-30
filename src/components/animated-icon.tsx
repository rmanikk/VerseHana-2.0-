
import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
} from "react-native";

type AnimatedSplashOverlayProps = {
  onFinish?: () => void;
};

const PARTICLES = [
  { x: "9%", y: "18%", delay: 0 },
  { x: "23%", y: "29%", delay: 400 },
  { x: "78%", y: "17%", delay: 700 },
  { x: "88%", y: "34%", delay: 200 },
  { x: "14%", y: "43%", delay: 600 },
  { x: "84%", y: "53%", delay: 300 },
  { x: "19%", y: "68%", delay: 900 },
  { x: "76%", y: "73%", delay: 500 },
  { x: "31%", y: "83%", delay: 100 },
  { x: "91%", y: "82%", delay: 800 },
  { x: "47%", y: "12%", delay: 350 },
  { x: "65%", y: "88%", delay: 650 },
];

export function AnimatedSplashOverlay({
  onFinish,
}: AnimatedSplashOverlayProps) {
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.96)).current;

  const particleAnimations = useRef(
    PARTICLES.map(() => new Animated.Value(0.2))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 35,
        useNativeDriver: false,
      }),
    ]).start();

    const loops = particleAnimations.map((particle, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(PARTICLES[index].delay),
          Animated.timing(particle, {
            toValue: 0.85,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(particle, {
            toValue: 0.2,
            duration: 1200,
            useNativeDriver: false,
          }),
        ])
      )
    );

    loops.forEach((loop) => loop.start());

    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) onFinish?.();
      });
    }, 3800);

    return () => {
      clearTimeout(timer);
      loops.forEach((loop) => loop.stop());
    };
  }, [
    logoOpacity,
    logoScale,
    screenOpacity,
    particleAnimations,
    onFinish,
  ]);

  return (
    <Animated.View
      pointerEvents="auto"
      style={[styles.screen, { opacity: screenOpacity }]}
    >
      <View style={StyleSheet.absoluteFill}>
        {PARTICLES.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: particle.x as any,
                top: particle.y as any,
                opacity: particleAnimations[index],
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require("@/assets/images/splash-icon.png")}
          style={styles.logo}
          contentFit="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

export function AnimatedIcon() {
  return null;
}

const styles = StyleSheet.create({
  screen: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999999,
    backgroundColor: "#020E11",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  logoContainer: {
    width: 290,
    height: 290,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: "100%",
    height: "100%",
  },

  particle: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 5,
    backgroundColor: "#55EDE7",
  },
});
