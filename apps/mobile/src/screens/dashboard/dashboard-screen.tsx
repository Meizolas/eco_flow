import { useEffect } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart } from "react-native-gifted-charts";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  useAnimatedProps,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop
} from "react-native-svg";
import { ScreenContainer } from "../../components/screen-container";
import { useAuthStore } from "../../store/auth-store";
import { useDashboardSummary } from "../../hooks/use-dashboard-summary";
import { theme } from "../../theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GAUGE_SIZE = 200;
const GAUGE_STROKE = 20;
const GAUGE_RADIUS = (GAUGE_SIZE - GAUGE_STROKE) / 2;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const fallbackSummary = {
  propertyName: "Residencia Principal",
  totalConsumptionLiters: 120,
  averageConsumptionLiters: 100,
  previousPeriodConsumptionLiters: 96,
  comparisonPercentage: 25,
  status: "attention",
  message: "Consumo em zona de atencao",
  smartTip: "Voce esta consumindo mais agua que o normal nas ultimas leituras.",
  activeAlerts: [
    { id: "1", title: "Consumo acima da media", severity: "WARNING" }
  ]
};

interface GaugeProps {
  percent: number; // 0-1
  statusColor: string;
  total: number;
  average: number;
  isLoading: boolean;
}

function ConsumptionGauge({ percent, statusColor, total, average, isLoading }: GaugeProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.min(percent, 1), {
      duration: 1200,
      easing: Easing.out(Easing.cubic)
    });
  }, [percent, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: GAUGE_CIRCUMFERENCE * (1 - progress.value)
  }));

  const cx = GAUGE_SIZE / 2;
  const cy = GAUGE_SIZE / 2;

  return (
    <View style={gaugeStyles.container}>
      <Svg width={GAUGE_SIZE} height={GAUGE_SIZE}>
        <Defs>
          <SvgLinearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={statusColor} stopOpacity="0.7" />
            <Stop offset="100%" stopColor={statusColor} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={cx}
          cy={cy}
          r={GAUGE_RADIUS}
          stroke="rgba(210,235,248,0.9)"
          strokeWidth={GAUGE_STROKE}
          fill="none"
        />

        {/* Progress arc */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={GAUGE_RADIUS}
          stroke="url(#gaugeGrad)"
          strokeWidth={GAUGE_STROKE}
          fill="none"
          strokeDasharray={GAUGE_CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx},${cy}`}
        />
      </Svg>

      {/* Center content */}
      <View style={gaugeStyles.center}>
        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <>
            <Text style={gaugeStyles.label}>Consumo Atual</Text>
            <Text style={[gaugeStyles.total, { color: statusColor }]}>{total.toFixed(0)}L</Text>
            <Text style={gaugeStyles.avg}>Media: {average.toFixed(0)}L</Text>
          </>
        )}
      </View>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: "center",
    justifyContent: "center"
  },
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: GAUGE_SIZE - GAUGE_STROKE * 2 - 16,
    height: GAUGE_SIZE - GAUGE_STROKE * 2 - 16,
    borderRadius: 999
  },
  label: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center"
  },
  total: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: 36,
    color: "#FFFFFF",
    lineHeight: 40
  },
  avg: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: "rgba(255,255,255,0.75)"
  }
});

export function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const summaryQuery = useDashboardSummary();
  const summary = summaryQuery.data ?? fallbackSummary;

  const chartData = [52, 66, 60, 85, 74, 95, 82].map((value) => ({
    value,
    dataPointColor: theme.colors.brand[300]
  }));

  const usagePercent = summary.totalConsumptionLiters / (summary.averageConsumptionLiters * 1.5);
  const statusColor =
    summary.status === "critical"
      ? theme.colors.danger
      : summary.status === "attention"
        ? theme.colors.warning
        : theme.colors.success;

  const statusLabel =
    summary.status === "critical" ? "Critico" : summary.status === "attention" ? "Atencao" : "Estavel";

  const firstName = user?.name?.split(" ")[0] ?? "Usuario";

  return (
    <ScreenContainer>
      {/* Header row */}
      <Animated.View entering={FadeInDown.duration(350)} style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Ola, {firstName}</Text>
          <Text style={styles.headerSub}>Acompanhe seu consumo</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color={theme.colors.secondary} />
            {summary.activeAlerts.length > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{summary.activeAlerts.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Hero card with gauge */}
      <Animated.View entering={FadeInDown.delay(60).duration(420)} style={styles.heroCard}>
        <LinearGradient
          colors={["#1668B8", "#0D4A8C", "#083660"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          {/* Top label */}
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Resumo do mes</Text>
              <Text style={styles.heroPropertyName}>{summary.propertyName}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}30`, borderColor: `${statusColor}60` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>

          {/* Gauge */}
          <View style={styles.heroGaugeRow}>
            <ConsumptionGauge
              percent={usagePercent}
              statusColor={statusColor}
              total={summary.totalConsumptionLiters}
              average={summary.averageConsumptionLiters}
              isLoading={summaryQuery.isLoading}
            />
          </View>

          {/* Message + comparison */}
          <View style={styles.heroBottom}>
            <View style={styles.heroMessageWrap}>
              <Ionicons name="water-outline" size={16} color="rgba(255,255,255,0.75)" />
              <Text style={styles.heroMessage}>{summary.message}</Text>
            </View>
            <View style={styles.compareBadge}>
              <Ionicons
                name={summary.comparisonPercentage > 0 ? "trending-up-outline" : "trending-down-outline"}
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.compareBadgeText}>
                {summary.comparisonPercentage > 0 ? "+" : ""}
                {summary.comparisonPercentage.toFixed(0)}% vs periodo anterior
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Quick actions row */}
      <Animated.View entering={FadeInUp.delay(120).duration(420)} style={styles.quickRow}>
        <TouchableOpacity style={styles.quickCard}>
          <LinearGradient
            colors={["#F9FDFF", "#ECF7FB"]}
            style={styles.quickCardInner}
          >
            <View style={[styles.quickIcon, { backgroundColor: "rgba(37,119,191,0.12)" }]}>
              <Ionicons name="bar-chart-outline" size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.quickCardLabel}>Comparacao</Text>
            <Text style={styles.quickCardLabel}>Mensal</Text>
            <View style={styles.quickStat}>
              <Ionicons
                name={summary.comparisonPercentage > 0 ? "arrow-up" : "arrow-down"}
                size={12}
                color={summary.comparisonPercentage > 15 ? theme.colors.danger : theme.colors.success}
              />
              <Text style={[styles.quickStatText, { color: summary.comparisonPercentage > 15 ? theme.colors.danger : theme.colors.success }]}>
                {Math.abs(summary.comparisonPercentage).toFixed(0)}% vs mes anterior
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard}>
          <LinearGradient
            colors={["#F9FDFF", "#ECF7FB"]}
            style={styles.quickCardInner}
          >
            <View style={[styles.quickIcon, { backgroundColor: "rgba(242,184,75,0.12)" }]}>
              <Ionicons name="receipt-outline" size={20} color={theme.colors.warning} />
            </View>
            <Text style={styles.quickCardLabel}>Proxima</Text>
            <Text style={styles.quickCardLabel}>Fatura Est.</Text>
            <View style={styles.quickStat}>
              <Text style={[styles.quickStatText, { color: theme.colors.textMuted }]}>
                ~R$ {(summary.totalConsumptionLiters * 0.018).toFixed(0)}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Metric cards */}
      <Animated.View entering={FadeInUp.delay(160).duration(440)} style={styles.metricsGrid}>
        {[
          {
            label: "Consumo Atual",
            value: `${summary.totalConsumptionLiters.toFixed(0)}L`,
            icon: "water" as const,
            iconBg: "rgba(37,119,191,0.12)",
            iconColor: theme.colors.primary,
            accent: theme.colors.primary
          },
          {
            label: "Media Diaria",
            value: `${(summary.averageConsumptionLiters / 30).toFixed(1)}L`,
            icon: "analytics-outline" as const,
            iconBg: "rgba(242,184,75,0.12)",
            iconColor: theme.colors.warning,
            accent: theme.colors.warning
          },
          {
            label: "Periodo Anterior",
            value: `${summary.previousPeriodConsumptionLiters.toFixed(0)}L`,
            icon: "time-outline" as const,
            iconBg: "rgba(77,189,228,0.12)",
            iconColor: theme.colors.info,
            accent: theme.colors.info
          },
          {
            label: "Alertas Ativos",
            value: `${summary.activeAlerts.length}`,
            icon: "warning-outline" as const,
            iconBg: "rgba(230,86,98,0.12)",
            iconColor: theme.colors.danger,
            accent: summary.activeAlerts.length > 0 ? theme.colors.danger : theme.colors.success
          }
        ].map((card) => (
          <View key={card.label} style={[styles.metricCard, { borderTopColor: card.accent }]}>
            <View style={[styles.metricIcon, { backgroundColor: card.iconBg }]}>
              <Ionicons name={card.icon} size={18} color={card.iconColor} />
            </View>
            <Text style={styles.metricLabel}>{card.label}</Text>
            <Text style={[styles.metricValue, { color: card.accent }]}>{card.value}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Chart */}
      <Animated.View entering={FadeInUp.delay(200).duration(460)} style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Tendencia semanal</Text>
          <View style={styles.chartLegend}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
            <Text style={styles.legendText}>Litros/dia</Text>
          </View>
        </View>
        <LineChart
          data={chartData}
          areaChart
          hideDataPoints={false}
          color={theme.colors.primary}
          startFillColor="rgba(37,119,191,0.28)"
          endFillColor="rgba(121,221,241,0.04)"
          yAxisColor={theme.colors.border}
          xAxisColor={theme.colors.border}
          noOfSections={4}
          thickness={3}
          hideRules={false}
          rulesColor={theme.colors.border}
          isAnimated
          dataPointsColor={theme.colors.primary}
          dataPointsRadius={4}
          yAxisTextStyle={{ color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fonts.body }}
          xAxisLabelTextStyle={{ color: theme.colors.textMuted, fontSize: 11, fontFamily: theme.typography.fonts.body }}
        />
      </Animated.View>

      {/* Smart tip */}
      <Animated.View entering={FadeInUp.delay(240).duration(460)} style={styles.tipCard}>
        <View style={styles.tipRow}>
          <View style={styles.tipIconWrap}>
            <Ionicons name="bulb-outline" size={20} color={theme.colors.secondary} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Dica Inteligente</Text>
            <Text style={styles.tipText}>{summary.smartTip}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Alerts section */}
      {summary.activeAlerts.length > 0 && (
        <Animated.View entering={FadeInUp.delay(280).duration(460)} style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertCardTitle}>Alertas Recentes</Text>
            <View style={[styles.alertCount, { backgroundColor: theme.colors.danger }]}>
              <Text style={styles.alertCountText}>{summary.activeAlerts.length}</Text>
            </View>
          </View>
          {summary.activeAlerts.map((alert) => (
            <View key={alert.id} style={styles.alertItem}>
              <View
                style={[
                  styles.alertIconWrap,
                  {
                    backgroundColor:
                      alert.severity === "CRITICAL"
                        ? "rgba(230,86,98,0.12)"
                        : "rgba(242,184,75,0.12)"
                  }
                ]}
              >
                <Ionicons
                  name={alert.severity === "CRITICAL" ? "alert-circle" : "warning-outline"}
                  size={18}
                  color={alert.severity === "CRITICAL" ? theme.colors.danger : theme.colors.warning}
                />
              </View>
              <View style={styles.alertItemContent}>
                <Text style={styles.alertItemTitle}>{alert.title}</Text>
                <Text style={styles.alertItemSeverity}>
                  {alert.severity === "CRITICAL" ? "Critico" : "Aviso"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
            </View>
          ))}
        </Animated.View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.sm
  },
  headerGreeting: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text
  },
  headerSub: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#123D5E",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3
  },
  notifBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center"
  },
  notifBadgeText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 9,
    color: "#FFFFFF"
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4
  },
  avatarText: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.md,
    color: "#FFFFFF"
  },
  heroCard: {
    marginTop: theme.spacing.xl,
    borderRadius: 32,
    overflow: "hidden",
    shadowColor: "#0B3F6A",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 10
  },
  heroGradient: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  heroLabel: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: "rgba(255,255,255,0.7)"
  },
  heroPropertyName: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.lg,
    color: "#FFFFFF",
    marginTop: 2
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 99
  },
  statusText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.xs
  },
  heroGaugeRow: {
    alignItems: "center"
  },
  heroBottom: {
    gap: theme.spacing.sm
  },
  heroMessageWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm
  },
  heroMessage: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.md,
    color: "rgba(255,255,255,0.9)",
    flex: 1
  },
  compareBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs
  },
  compareBadgeText: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: "#FFFFFF"
  },
  quickRow: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    gap: theme.spacing.md
  },
  quickCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#123D5E",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4
  },
  quickCardInner: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xs
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs
  },
  quickCardLabel: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text
  },
  quickStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2
  },
  quickStatText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 11
  },
  metricsGrid: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  metricCard: {
    width: (SCREEN_WIDTH - theme.spacing.xl * 2 - theme.spacing.md) / 2 - 0.5,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderTopWidth: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
    shadowColor: "#123D5E",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
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
    color: theme.colors.textMuted
  },
  metricValue: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text
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
    borderRadius: 99
  },
  legendText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted
  },
  tipCard: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(185,225,242,0.8)"
  },
  tipRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    alignItems: "flex-start"
  },
  tipIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(22,61,116,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  tipContent: {
    flex: 1,
    gap: theme.spacing.xs
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
    color: theme.colors.text
  },
  alertCard: {
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
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm
  },
  alertCardTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text,
    flex: 1
  },
  alertCount: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center"
  },
  alertCountText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 11,
    color: "#FFFFFF"
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  alertIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  alertItemContent: {
    flex: 1,
    gap: 2
  },
  alertItemTitle: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text
  },
  alertItemSeverity: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted
  }
});
