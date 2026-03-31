import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LineChart } from "react-native-gifted-charts";
import { ScreenContainer } from "../../components/screen-container";
import { theme } from "../../theme";

const detailData = [
  { value: 60, dataPointColor: theme.colors.primary },
  { value: 75, dataPointColor: theme.colors.primary },
  { value: 64, dataPointColor: theme.colors.primary },
  { value: 185, dataPointColor: theme.colors.warning },
  { value: 280, dataPointColor: theme.colors.danger },
  { value: 140, dataPointColor: theme.colors.primary },
  { value: 120, dataPointColor: theme.colors.primary }
];

const metrics = [
  {
    label: "Media",
    value: "100L",
    icon: "analytics-outline" as const,
    iconBg: "rgba(37,119,191,0.1)",
    iconColor: theme.colors.primary,
    accent: theme.colors.primary
  },
  {
    label: "Pico",
    value: "300L",
    icon: "trending-up-outline" as const,
    iconBg: "rgba(242,184,75,0.1)",
    iconColor: theme.colors.warning,
    accent: theme.colors.warning
  },
  {
    label: "Minimo",
    value: "45L",
    icon: "trending-down-outline" as const,
    iconBg: "rgba(29,156,122,0.1)",
    iconColor: theme.colors.success,
    accent: theme.colors.success
  },
  {
    label: "Tendencia",
    value: "-5%",
    icon: "arrow-down-circle-outline" as const,
    iconBg: "rgba(29,156,122,0.1)",
    iconColor: theme.colors.success,
    accent: theme.colors.success
  }
];

export function ConsumptionDetailsScreen() {
  return (
    <ScreenContainer>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(380)}>
        <Text style={styles.eyebrow}>DETALHES</Text>
        <Text style={styles.title}>Analise Completa</Text>
        <Text style={styles.subtitle}>
          Use esse painel para validar picos, reducoes e possiveis sinais de vazamento.
        </Text>
      </Animated.View>

      {/* Chart */}
      <Animated.View entering={FadeInDown.delay(60).duration(420)} style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Curva de consumo</Text>
          <View style={styles.chartLegend}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.legendText}>Litros</Text>
          </View>
        </View>
        <LineChart
          data={detailData}
          areaChart
          color={theme.colors.primary}
          startFillColor="rgba(37,119,191,0.28)"
          endFillColor="rgba(121,221,241,0.04)"
          thickness={3}
          yAxisColor={theme.colors.border}
          xAxisColor={theme.colors.border}
          rulesColor={theme.colors.border}
          isAnimated
          dataPointsColor={theme.colors.primary}
          dataPointsRadius={5}
          yAxisTextStyle={{
            color: theme.colors.textMuted,
            fontSize: 11,
            fontFamily: theme.typography.fonts.body
          }}
        />
      </Animated.View>

      {/* Metrics grid */}
      <Animated.View entering={FadeInUp.delay(100).duration(430)} style={styles.metricsGrid}>
        {metrics.map((m) => (
          <View key={m.label} style={[styles.metricCard, { borderTopColor: m.accent }]}>
            <View style={[styles.metricIcon, { backgroundColor: m.iconBg }]}>
              <Ionicons name={m.icon} size={18} color={m.iconColor} />
            </View>
            <Text style={styles.metricLabel}>{m.label}</Text>
            <Text style={[styles.metricValue, { color: m.accent }]}>{m.value}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Analysis note */}
      <Animated.View entering={FadeInUp.delay(160).duration(440)} style={styles.noteCard}>
        <View style={styles.noteHeader}>
          <View style={styles.noteIconWrap}>
            <Ionicons name="bulb-outline" size={20} color={theme.colors.secondary} />
          </View>
          <Text style={styles.noteTitle}>Leitura Analitica</Text>
        </View>
        <Text style={styles.noteText}>
          Houve concentracao de consumo no meio do periodo, mas a tendencia fechou em queda. Isso reduz o risco de falso positivo para vazamento continuo.
        </Text>

        {/* Risk indicator */}
        <View style={styles.riskRow}>
          <Text style={styles.riskLabel}>Risco de vazamento</Text>
          <View style={styles.riskBadge}>
            <View style={[styles.riskDot, { backgroundColor: theme.colors.success }]} />
            <Text style={[styles.riskText, { color: theme.colors.success }]}>Baixo</Text>
          </View>
        </View>

        {/* Risk track */}
        <View style={styles.riskTrack}>
          <View style={[styles.riskFill, { width: "15%", backgroundColor: theme.colors.success }]} />
        </View>
      </Animated.View>

      {/* Anomaly check */}
      <Animated.View entering={FadeInUp.delay(200).duration(440)} style={styles.anomalyCard}>
        <View style={styles.anomalyRow}>
          <View style={[styles.anomalyIcon, { backgroundColor: "rgba(242,184,75,0.1)" }]}>
            <Ionicons name="warning-outline" size={20} color={theme.colors.warning} />
          </View>
          <View style={styles.anomalyContent}>
            <Text style={styles.anomalyTitle}>Pico detectado</Text>
            <Text style={styles.anomalyText}>
              Consumo de 280L registrado no 5 dia do periodo, 2.8x acima da media.
            </Text>
          </View>
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 1.5,
    color: theme.colors.primary,
    textTransform: "uppercase",
    marginBottom: theme.spacing.xs
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeights.xl
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.lineHeights.md
  },
  chartCard: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    shadowColor: "#123D5E",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 4
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  chartTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text
  },
  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted
  },
  metricsGrid: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderTopWidth: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
    shadowColor: "#123D5E",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs
  },
  metricLabel: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  metricValue: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text
  },
  noteCard: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: "rgba(185,225,242,0.8)"
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm
  },
  noteIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(22,61,116,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  noteTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.secondary
  },
  noteText: {
    fontFamily: theme.typography.fonts.body,
    lineHeight: theme.typography.lineHeights.md,
    color: theme.colors.text
  },
  riskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  riskLabel: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(29,156,122,0.1)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs
  },
  riskDot: {
    width: 7,
    height: 7,
    borderRadius: 99
  },
  riskText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.xs
  },
  riskTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.08)",
    overflow: "hidden"
  },
  riskFill: {
    height: "100%",
    borderRadius: 3
  },
  anomalyCard: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(242,184,75,0.35)",
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
    shadowColor: "#123D5E",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3
  },
  anomalyRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "flex-start"
  },
  anomalyIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  anomalyContent: {
    flex: 1,
    gap: theme.spacing.xs
  },
  anomalyTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text
  },
  anomalyText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.md,
    color: theme.colors.textMuted
  }
});
