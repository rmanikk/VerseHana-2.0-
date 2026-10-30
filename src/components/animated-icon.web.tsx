import { Image } from "expo-image";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

type Props = {
  onFinish?: () => void;
};

const PARTICLES = [
  { top: "18%", left: "12%", delay: 0 },
  { top: "29%", left: "25%", delay: 400 },
  { top: "16%", left: "78%", delay: 700 },
  { top: "35%", left: "88%", delay: 200 },
  { top: "44%", left: "15%", delay: 600 },
  { top: "53%", left: "84%", delay: 300 },
  { top: "69%", left: "20%", delay: 900 },
  { top: "74%", left: "76%", delay: 500 },
  { top: "83%", left: "32%", delay: 100 },
  { top: "81%", left: "90%", delay: 800 },
  { top: "12%", left: "48%", delay: 350 },
  { top: "88%", left: "65%", delay: 650 },
];

export function AnimatedSplashOverlay({ onFinish }: Props) {
  const fade = useRef(new Animated.Value(1)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.96)).current;

  const particles = useRef(
    PARTICLES.map(() => new Animated.Value(0.2)),
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

    const particleLoops = particles.map((particle, index) =>
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
        ]),
      ),
    );

    particleLoops.forEach((loop) => loop.start());

    const timer = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) onFinish?.();
      });
    }, 2800);

    return () => {
      clearTimeout(timer);
      particleLoops.forEach((loop) => loop.stop());
    };
  }, [fade, logoOpacity, logoScale, particles, onFinish]);

  return (
    <Animated.View style={[styles.screen, { opacity: fade }]}>
      {/* Subtle floating particles */}
      <View style={StyleSheet.absoluteFill}>
        {PARTICLES.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                top: particle.top as any,
                left: particle.left as any,
                opacity: particles[index],
              },
            ]}
          />
        ))}
      </View>

      {/* Original logo, including its wordmark */}
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
    ...StyleSheet.absoluteFill,
    backgroundColor: "#020E11",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
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
    borderRadius: 2,
    backgroundColor: "#55EDE7",
  },
});
