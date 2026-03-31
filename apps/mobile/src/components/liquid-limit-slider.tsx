import { useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, Platform, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Rect, Stop } from "react-native-svg";
import { theme } from "../theme";

const TRACK_HEIGHT = 60;
const THUMB_SIZE = 32;
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface LiquidLimitSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const clamp = (value: number, min: number, max: number) => {
  "worklet";
  return Math.min(Math.max(value, min), max);
};

const buildWaveArea = (
  width: number,
  height: number,
  level: number,
  amplitude: number,
  phase: number,
  frequency: number
) => {
  "worklet";

  const safeWidth = Math.max(width, 1);
  const points = 24;
  const stepX = safeWidth / points;
  let path = `M 0 ${height} L 0 ${level}`;

  for (let index = 0; index <= points; index += 1) {
    const x = index * stepX;
    const y = level + Math.sin((index / points) * Math.PI * frequency + phase) * amplitude;
    path += ` L ${x} ${y}`;
  }

  path += ` L ${safeWidth} ${height} Z`;
  return path;
};

const buildWaveLine = (
  width: number,
  level: number,
  amplitude: number,
  phase: number,
  frequency: number
) => {
  "worklet";

  const safeWidth = Math.max(width, 1);
  const points = 24;
  const stepX = safeWidth / points;
  let path = `M 0 ${level}`;

  for (let index = 0; index <= points; index += 1) {
    const x = index * stepX;
    const y = level + Math.sin((index / points) * Math.PI * frequency + phase) * amplitude;
    path += ` L ${x} ${y}`;
  }

  return path;
};

export function LiquidLimitSlider({
  value,
  onChange,
  min = 40,
  max = 300,
  step = 5
}: LiquidLimitSliderProps) {
  const [trackWidth, setTrackWidth] = useState(1);
  const widthShared = useSharedValue(1);
  const progress = useSharedValue((value - min) / (max - min));
  const startProgress = useSharedValue(progress.value);
  const pressed = useSharedValue(0);
  const wavePhaseA = useSharedValue(0);
  const wavePhaseB = useSharedValue(0);
  const lastReportedValue = useRef(value);

  useEffect(() => {
    wavePhaseA.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 2200, easing: Easing.linear }),
      -1,
      false
    );
    wavePhaseB.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 3200, easing: Easing.linear }),
      -1,
      false
    );
  }, [wavePhaseA, wavePhaseB]);

  useEffect(() => {
    const nextProgress = (value - min) / (max - min);
    progress.value = withTiming(clamp(nextProgress, 0, 1), {
      duration: 280,
      easing: Easing.out(Easing.cubic)
    });
  }, [max, min, progress, value]);

  const emitValueChange = async (nextValue: number) => {
    if (lastReportedValue.current === nextValue) {
      return;
    }

    lastReportedValue.current = nextValue;
    onChange(nextValue);

    if (Platform.OS !== "web") {
      await Haptics.selectionAsync();
    }
  };

  const steppedValue = useDerivedValue(() => {
    const rawValue = min + progress.value * (max - min);
    const rounded = Math.round(rawValue / step) * step;
    return clamp(rounded, min, max);
  });

  useAnimatedReaction(
    () => steppedValue.value,
    (nextValue, previousValue) => {
      if (nextValue !== previousValue) {
        runOnJS(emitValueChange)(nextValue);
      }
    }
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          startProgress.value = progress.value;
          pressed.value = withTiming(1, { duration: 160 });
        })
        .onUpdate((event) => {
          const delta = event.translationX / widthShared.value;
          progress.value = clamp(startProgress.value + delta, 0, 1);
        })
        .onFinalize(() => {
          pressed.value = withTiming(0, { duration: 220 });
        }),
    [pressed, progress, startProgress, widthShared]
  );

  const fillWidth = useDerivedValue(() => Math.max(28, progress.value * widthShared.value));
  const waveLevel = useDerivedValue(() => 32 - progress.value * 8 - pressed.value * 2);
  const waveAmplitude = useDerivedValue(() => 4 + progress.value * 2 + pressed.value * 2);
  const secondWaveLevel = useDerivedValue(() => waveLevel.value + 5);
  const secondWaveAmplitude = useDerivedValue(() => waveAmplitude.value * 0.7);

  const fillProps = useAnimatedProps(() => ({
    width: fillWidth.value
  }));

  const primaryWaveProps = useAnimatedProps(() => ({
    d: buildWaveArea(
      fillWidth.value,
      TRACK_HEIGHT,
      waveLevel.value,
      waveAmplitude.value,
      wavePhaseA.value,
      5
    )
  }));

  const secondaryWaveProps = useAnimatedProps(() => ({
    d: buildWaveArea(
      fillWidth.value,
      TRACK_HEIGHT,
      secondWaveLevel.value,
      secondWaveAmplitude.value,
      wavePhaseB.value + 0.6,
      4.2
    )
  }));

  const foamProps = useAnimatedProps(() => ({
    d: buildWaveLine(
      fillWidth.value,
      waveLevel.value - 2,
      Math.max(2, waveAmplitude.value * 0.6),
      wavePhaseA.value + 0.4,
      5
    )
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: fillWidth.value - THUMB_SIZE / 2 }, { scale: 1 + pressed.value * 0.08 }]
  }));

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.max(event.nativeEvent.layout.width, 1);
    setTrackWidth(nextWidth);
    widthShared.value = nextWidth;
  };

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.trackShell} onLayout={handleLayout}>
          <View style={styles.trackBase}>
            <Svg width={trackWidth} height={TRACK_HEIGHT} style={StyleSheet.absoluteFillObject}>
              <Defs>
                <SvgLinearGradient id="waterBase" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor="#1F6FCB" />
                  <Stop offset="50%" stopColor="#30A9DB" />
                  <Stop offset="100%" stopColor="#8BE5F7" />
                </SvgLinearGradient>
                <SvgLinearGradient id="waterOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                  <Stop offset="100%" stopColor="rgba(20,79,146,0.06)" />
                </SvgLinearGradient>
              </Defs>

              <AnimatedRect
                animatedProps={fillProps}
                x="0"
                y="0"
                height={TRACK_HEIGHT}
                rx="30"
                fill="url(#waterBase)"
                opacity={0.88}
              />
              <AnimatedPath animatedProps={secondaryWaveProps} fill="url(#waterOverlay)" opacity={0.7} />
              <AnimatedPath animatedProps={primaryWaveProps} fill="url(#waterBase)" opacity={0.95} />
              <AnimatedPath
                animatedProps={foamProps}
                stroke="rgba(255,255,255,0.72)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <AnimatedRect
                animatedProps={fillProps}
                x="0"
                y="8"
                height="14"
                rx="8"
                fill="rgba(255,255,255,0.18)"
              />
            </Svg>
          </View>

          <Animated.View style={[styles.thumb, thumbStyle]}>
            <View style={styles.thumbCore} />
          </Animated.View>
        </View>
      </GestureDetector>

      <View style={styles.scaleRow}>
        <Text style={styles.scaleLabel}>{min}L</Text>
        <Text style={styles.scaleLabel}>{max}L</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.sm
  },
  trackShell: {
    height: THUMB_SIZE + 26,
    justifyContent: "center"
  },
  trackBase: {
    height: TRACK_HEIGHT,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "rgba(214, 230, 239, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(160, 198, 217, 0.65)",
    shadowColor: "#0B4B73",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
    elevation: 4
  },
  thumb: {
    position: "absolute",
    top: (THUMB_SIZE + 26 - THUMB_SIZE) / 2,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  thumbCore: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "rgba(142, 194, 214, 0.65)",
    shadowColor: "#0F4172",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 5
  },
  scaleRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  scaleLabel: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted
  }
});
