import { useEffect } from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  ZoomIn
} from "react-native-reanimated";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
  ClipPath,
  G
} from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AnimatedPath = Animated.createAnimatedComponent(Path);

const buildWave = (
  width: number,
  height: number,
  level: number,
  amplitude: number,
  phase: number
) => {
  "worklet";
  const numPoints = 40;
  const step = width / numPoints;
  let path = `M 0 ${height} L 0 ${level}`;
  for (let i = 1; i <= numPoints; i++) {
    const x = i * step;
    const y = level + Math.sin((i / numPoints) * Math.PI * 5 + phase) * amplitude;
    path += ` L ${x} ${y}`;
  }
  path += ` L ${width} ${height} Z`;
  return path;
};

function SplashWaves() {
  const wavePhase1 = useSharedValue(0);
  const wavePhase2 = useSharedValue(0);
  const wavePhase3 = useSharedValue(0);

  useEffect(() => {
    wavePhase1.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 2400, easing: Easing.linear }),
      -1,
      false
    );
    wavePhase2.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 3200, easing: Easing.linear }),
      -1,
      false
    );
    wavePhase3.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, [wavePhase1, wavePhase2, wavePhase3]);

  const W = SCREEN_WIDTH;
  const H = SCREEN_HEIGHT * 0.32;

  const wave1Props = useAnimatedProps(() => ({
    d: buildWave(W, H, H * 0.2, 20, wavePhase1.value)
  }));
  const wave2Props = useAnimatedProps(() => ({
    d: buildWave(W, H, H * 0.38, 15, wavePhase2.value + 1.0)
  }));
  const wave3Props = useAnimatedProps(() => ({
    d: buildWave(W, H, H * 0.55, 10, wavePhase3.value + 2.2)
  }));

  return (
    <Svg
      width={W}
      height={H}
      style={{ position: "absolute", bottom: 0, left: 0 }}
    >
      <Defs>
        <SvgLinearGradient id="wave1grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(100,210,240,0.55)" />
          <Stop offset="100%" stopColor="rgba(10,70,140,0.85)" />
        </SvgLinearGradient>
        <SvgLinearGradient id="wave2grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(60,190,225,0.45)" />
          <Stop offset="100%" stopColor="rgba(8,54,96,0.92)" />
        </SvgLinearGradient>
        <SvgLinearGradient id="wave3grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(20,100,180,0.65)" />
          <Stop offset="100%" stopColor="#083660" />
        </SvgLinearGradient>
        <ClipPath id="waveClip">
          <Rect x="0" y="0" width={W} height={H} />
        </ClipPath>
      </Defs>
      <G clipPath="url(#waveClip)">
        <AnimatedPath animatedProps={wave3Props} fill="url(#wave3grad)" opacity={0.85} />
        <AnimatedPath animatedProps={wave2Props} fill="url(#wave2grad)" opacity={0.8} />
        <AnimatedPath animatedProps={wave1Props} fill="url(#wave1grad)" opacity={0.9} />
      </G>
    </Svg>
  );
}

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#F2FBFF", "#E0F6FD", "#CCF0FA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Glow accents */}
      <View style={[styles.glowCircle, styles.glowTopRight]} />
      <View style={[styles.glowCircle, styles.glowMidLeft]} />

      {/* Logo centrado — a logo já contém o texto "ECOFLOW" e o tagline */}
      <Animated.View entering={ZoomIn.delay(100).duration(700)} style={styles.centerContent}>
        {/* Sombra/halo atrás da logo */}
        <View style={styles.logoHalo} />

        <Image
          source={require("../../../assets/ecoflow-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Indicador de carregamento */}
        <Animated.View entering={FadeIn.delay(700).duration(500)} style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
          ))}
        </Animated.View>
      </Animated.View>

      {/* Ondas oceânicas na parte inferior */}
      <SplashWaves />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  glowCircle: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.2
  },
  glowTopRight: {
    width: 300,
    height: 300,
    backgroundColor: "#79DDF1",
    top: -90,
    right: -80
  },
  glowMidLeft: {
    width: 220,
    height: 220,
    backgroundColor: "#2D95CE",
    top: SCREEN_HEIGHT * 0.22,
    left: -90
  },
  centerContent: {
    alignItems: "center",
    gap: 20,
    marginBottom: SCREEN_HEIGHT * 0.14
  },
  logoHalo: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(45,149,206,0.08)",
    shadowColor: "#1B82C5",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 60
  },
  logo: {
    width: 300,
    height: 300
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(37,119,191,0.25)"
  },
  dotActive: {
    width: 26,
    backgroundColor: "#2577BF"
  }
});
