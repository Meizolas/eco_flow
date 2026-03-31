import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Rect,
  Stop,
  ClipPath,
  G
} from "react-native-svg";
import { AppButton } from "../../components/app-button";
import { AppInput } from "../../components/app-input";
import { LiquidLimitSlider } from "../../components/liquid-limit-slider";
import { ScreenContainer } from "../../components/screen-container";
import { useLimitsStore } from "../../store/limits-store";
import { theme } from "../../theme";

const limitSchema = z.object({
  limitLiters: z.string().min(1)
});

type LimitForm = z.infer<typeof limitSchema>;

const MIN_LIMIT = 40;
const MAX_LIMIT = 300;
const STEP = 5;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CONTAINER_PADDING = theme.spacing.xl * 2;
const TANK_WIDTH = SCREEN_WIDTH - CONTAINER_PADDING;
const TANK_HEIGHT = 180;
const TANK_RADIUS = 28;

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const sanitizeLimitValue = (value: string) => {
  const onlyDigits = value.replace(/[^0-9]/g, "");
  if (!onlyDigits) return String(MIN_LIMIT);
  const numericValue = Number(onlyDigits);
  const clampedValue = Math.min(Math.max(numericValue, MIN_LIMIT), MAX_LIMIT);
  const rounded = Math.round(clampedValue / STEP) * STEP;
  return String(rounded);
};

// Smooth ocean wave path
const buildOceanWave = (
  width: number,
  height: number,
  waterY: number,
  amplitude: number,
  phase: number,
  frequency: number
) => {
  "worklet";
  const safeWidth = Math.max(width, 1);
  const numPoints = 40;
  const step = safeWidth / numPoints;

  let path = `M 0 ${height} L 0 ${waterY + Math.sin(phase) * amplitude}`;

  for (let i = 1; i <= numPoints; i++) {
    const x = i * step;
    const y = waterY + Math.sin((i / numPoints) * Math.PI * frequency + phase) * amplitude;
    path += ` L ${x} ${y}`;
  }

  path += ` L ${safeWidth} ${height} Z`;
  return path;
};

const buildFoamLine = (
  width: number,
  waterY: number,
  amplitude: number,
  phase: number,
  frequency: number
) => {
  "worklet";
  const safeWidth = Math.max(width, 1);
  const numPoints = 40;
  const step = safeWidth / numPoints;

  let path = `M 0 ${waterY + Math.sin(phase) * amplitude}`;

  for (let i = 1; i <= numPoints; i++) {
    const x = i * step;
    const y = waterY + Math.sin((i / numPoints) * Math.PI * frequency + phase) * amplitude;
    path += ` L ${x} ${y}`;
  }

  return path;
};

interface WaterTankProps {
  fillPercent: number; // 0-1
  width: number;
  height: number;
}

function WaterTank({ fillPercent, width, height }: WaterTankProps) {
  const wavePhase1 = useSharedValue(0);
  const wavePhase2 = useSharedValue(0);
  const animatedFill = useSharedValue(fillPercent);

  useEffect(() => {
    wavePhase1.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 2200, easing: Easing.linear }),
      -1,
      false
    );
    wavePhase2.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 3600, easing: Easing.linear }),
      -1,
      false
    );
  }, [wavePhase1, wavePhase2]);

  useEffect(() => {
    animatedFill.value = withTiming(fillPercent, {
      duration: 400,
      easing: Easing.out(Easing.cubic)
    });
  }, [fillPercent, animatedFill]);

  // waterY: the Y position of the water surface (from top)
  // Higher fillPercent = lower waterY value (water surface closer to top)
  const waterY = useDerivedValue(() => {
    const minY = height * 0.08; // max fill (92% of height)
    const maxY = height * 0.92; // min fill (8% of height)
    return maxY - animatedFill.value * (maxY - minY);
  });

  const amplitude1 = useDerivedValue(() => 6 + animatedFill.value * 3);
  const amplitude2 = useDerivedValue(() => amplitude1.value * 0.7);

  // Main wave
  const mainWaveProps = useAnimatedProps(() => ({
    d: buildOceanWave(width, height, waterY.value, amplitude1.value, wavePhase1.value, 5)
  }));

  // Secondary wave (slightly offset)
  const secWaveProps = useAnimatedProps(() => ({
    d: buildOceanWave(width, height, waterY.value + 9, amplitude2.value, wavePhase2.value + 0.8, 4)
  }));

  // Foam line
  const foamProps = useAnimatedProps(() => ({
    d: buildFoamLine(width, waterY.value - 5, Math.max(2, amplitude1.value * 0.5), wavePhase1.value + 0.3, 5)
  }));

  // Background fill rect (for solid area below waves)
  const fillRectProps = useAnimatedProps(() => ({
    y: waterY.value + amplitude1.value,
    height: Math.max(0, height - waterY.value - amplitude1.value)
  }));

  return (
    <Svg width={width} height={height}>
      <Defs>
        {/* Ocean gradient: deep navy bottom → aqua top */}
        <SvgLinearGradient id="tankOcean" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#45CFEB" />
          <Stop offset="35%" stopColor="#1E92D4" />
          <Stop offset="100%" stopColor="#083660" />
        </SvgLinearGradient>
        {/* Secondary wave overlay */}
        <SvgLinearGradient id="tankWave2" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(120,230,255,0.55)" />
          <Stop offset="100%" stopColor="rgba(10,70,140,0.25)" />
        </SvgLinearGradient>
        {/* Surface shimmer */}
        <SvgLinearGradient id="tankShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <Stop offset="50%" stopColor="rgba(255,255,255,0.1)" />
          <Stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
        </SvgLinearGradient>
        <ClipPath id="tankClip">
          <Rect x="0" y="0" width={width} height={height} rx={TANK_RADIUS} />
        </ClipPath>
      </Defs>

      <G clipPath="url(#tankClip)">
        {/* Solid fill below wave */}
        <AnimatedRect animatedProps={fillRectProps} x="0" width={width} fill="url(#tankOcean)" />

        {/* Secondary depth wave */}
        <AnimatedPath animatedProps={secWaveProps} fill="url(#tankWave2)" opacity={0.65} />

        {/* Main surface wave */}
        <AnimatedPath animatedProps={mainWaveProps} fill="url(#tankOcean)" opacity={0.92} />

        {/* Foam crest line */}
        <AnimatedPath
          animatedProps={foamProps}
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Top shimmer bar */}
        <Rect x="0" y="0" width={width} height="24" rx="0" fill="url(#tankShimmer)" opacity={0.4} />
      </G>
    </Svg>
  );
}

export function LimitsScreen() {
  const storedLimit = useLimitsStore((state) => state.monthlyLimitLiters);
  const hasHydrated = useLimitsStore((state) => state.hasHydrated);
  const hydrate = useLimitsStore((state) => state.hydrate);
  const setMonthlyLimitLiters = useLimitsStore((state) => state.setMonthlyLimitLiters);
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<LimitForm>({
    resolver: zodResolver(limitSchema),
    defaultValues: { limitLiters: String(storedLimit) }
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hasHydrated) return;
    setValue("limitLiters", String(storedLimit), { shouldDirty: false, shouldValidate: true });
  }, [hasHydrated, setValue, storedLimit]);

  const currentValue = Number(watch("limitLiters") || storedLimit || 120);
  const fillPercent = (currentValue - MIN_LIMIT) / (MAX_LIMIT - MIN_LIMIT);

  const helperText = useMemo(
    () =>
      currentValue >= 220
        ? "Limite alto. Ideal para unidades com maior ocupacao ou irrigacao frequente."
        : currentValue <= 80
          ? "Limite conservador. Ideal para receber alertas cedo e evitar desperdicios."
          : "Defina seu limite mensal para receber notificacoes se ultrapassar.",
    [currentValue]
  );

  const statusColor = currentValue >= 220 ? theme.colors.danger : currentValue <= 80 ? theme.colors.success : theme.colors.primary;

  const handleSliderChange = (nextValue: number) => {
    setSavedMessageVisible(false);
    setValue("limitLiters", String(nextValue), { shouldDirty: true, shouldValidate: true });
  };

  const handleManualChange = (nextValue: string) => {
    setSavedMessageVisible(false);
    setValue("limitLiters", sanitizeLimitValue(nextValue), { shouldDirty: true, shouldValidate: true });
  };

  const handleSave = handleSubmit(async ({ limitLiters }) => {
    const sanitized = Number(sanitizeLimitValue(limitLiters));
    await setMonthlyLimitLiters(sanitized);
    setValue("limitLiters", String(sanitized), { shouldDirty: false, shouldValidate: true });
    setSavedMessageVisible(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  });

  return (
    <ScreenContainer>
      {/* Page header */}
      <Animated.View entering={FadeInDown.duration(380)} style={styles.pageHeader}>
        <Text style={styles.pageEyebrow}>LIMITE MENSAL</Text>
        <Text style={styles.pageTitle}>Consumo de Agua</Text>
      </Animated.View>

      {/* Water tank card */}
      <Animated.View entering={FadeInDown.delay(60).duration(440)} style={styles.tankCard}>
        <LinearGradient
          colors={["#EAF8FD", "#D0F0FA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tankCardInner}
        >
          {/* Value overlay */}
          <View style={styles.tankValueRow}>
            <Text style={[styles.tankValueNumber, { color: statusColor }]}>{currentValue}</Text>
            <Text style={[styles.tankValueUnit, { color: statusColor }]}>L</Text>
          </View>
          <Text style={styles.tankHelperText}>{helperText}</Text>

          {/* The animated water tank */}
          <View style={styles.tankContainer}>
            <WaterTank fillPercent={fillPercent} width={TANK_WIDTH - theme.spacing.xl * 2} height={TANK_HEIGHT} />
          </View>

          {/* Min/max markers */}
          <View style={styles.tankMarkers}>
            <View style={[styles.tankMarker, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.tankMarkerText}>Eco {MIN_LIMIT}L</Text>
            </View>
            <View style={[styles.tankMarker, { backgroundColor: theme.colors.danger }]}>
              <Text style={styles.tankMarkerText}>Alto {MAX_LIMIT}L</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Slider card */}
      <Animated.View entering={FadeInUp.delay(120).duration(460)} style={styles.sliderCard}>
        <Text style={styles.sliderLabel}>Arraste para ajustar</Text>
        <LiquidLimitSlider
          value={currentValue}
          onChange={handleSliderChange}
          min={MIN_LIMIT}
          max={MAX_LIMIT}
          step={STEP}
        />
      </Animated.View>

      {/* Form card */}
      <Animated.View entering={FadeInUp.delay(200).duration(480)} style={styles.formCard}>
        <Controller
          control={control}
          name="limitLiters"
          render={({ field: { value } }) => (
            <AppInput
              label="Valor preciso (litros)"
              value={value}
              onChangeText={handleManualChange}
              placeholder="120"
              keyboardType="numeric"
              error={errors.limitLiters?.message}
              rightAdornment={<Text style={styles.inputUnit}>L</Text>}
            />
          )}
        />

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>Como esse limite funciona</Text>
          <Text style={styles.tipText}>
            O EcoFlow compara suas leituras com este valor e com seu historico recente para identificar excesso de consumo e possivel vazamento.
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {hasHydrated ? `Salvo: ${storedLimit}L` : "Carregando..."}
          </Text>
          {savedMessageVisible ? (
            <View style={styles.savedPillWrap}>
              <Text style={styles.savedPill}>Salvo com sucesso</Text>
            </View>
          ) : null}
        </View>

        <AppButton
          label={isSubmitting ? "Salvando..." : isDirty ? "Salvar Limite" : "Limite Salvo"}
          onPress={handleSave}
          disabled={!hasHydrated || isSubmitting || !isDirty}
        />
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm
  },
  pageEyebrow: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 1.5,
    color: theme.colors.primary,
    textTransform: "uppercase",
    marginBottom: theme.spacing.xs
  },
  pageTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeights.xl
  },
  tankCard: {
    marginTop: theme.spacing.md,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(185, 230, 245, 0.8)",
    shadowColor: "#083660",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 6
  },
  tankCardInner: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    alignItems: "center",
    gap: theme.spacing.md
  },
  tankValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing.xs
  },
  tankValueNumber: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: 70,
    lineHeight: 76,
    color: theme.colors.secondary
  },
  tankValueUnit: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 28,
    marginBottom: 10,
    color: theme.colors.primary
  },
  tankHelperText: {
    textAlign: "center",
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.lineHeights.md,
    maxWidth: 280
  },
  tankContainer: {
    marginTop: theme.spacing.sm,
    borderRadius: TANK_RADIUS,
    overflow: "hidden",
    width: "100%",
    alignItems: "center"
  },
  tankMarkers: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: theme.spacing.xs
  },
  tankMarker: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs
  },
  tankMarkerText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.xs,
    color: "#FFFFFF"
  },
  sliderCard: {
    marginTop: theme.spacing.lg,
    borderRadius: 28,
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    shadowColor: "#123D5E",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 4
  },
  sliderLabel: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    textAlign: "center"
  },
  formCard: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.lg,
    borderRadius: 28,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#123D5E",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 4
  },
  inputUnit: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary
  },
  tipCard: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: "rgba(224,246,252,0.95)",
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(180,225,242,0.7)"
  },
  tipTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.secondary
  },
  tipText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.md,
    color: theme.colors.textMuted
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md
  },
  metaText: {
    flex: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted
  },
  savedPillWrap: {
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(29,156,122,0.1)",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(29,156,122,0.2)"
  },
  savedPill: {
    color: theme.colors.success,
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.xs
  }
});
