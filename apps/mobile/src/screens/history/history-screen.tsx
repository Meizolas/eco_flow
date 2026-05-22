import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { BarChart } from "react-native-gifted-charts";
import { ScreenContainer } from "../../components/screen-container";
import { HistoryStackParamList } from "../../types/navigation";
import { theme } from "../../theme";

const periods = ["Diario", "Semanal", "Mensal", "Anual"] as const;
type Period = (typeof periods)[number];

const periodData: Record<Period, Array<{ value: number; label: string }>> = {
  Diario: [
    { value: 8, label: "6h" },
    { value: 18, label: "9h" },
    { value: 12, label: "12h" },
    { value: 22, label: "15h" },
    { value: 16, label: "18h" },
    { value: 10, label: "21h" }
  ],
  Semanal: [
    { value: 120, label: "Seg" },
    { value: 85, label: "Ter" },
    { value: 190, label: "Qua" },
    { value: 260, label: "Qui" },
    { value: 170, label: "Sex" },
    { value: 220, label: "Sab" },
    { value: 140, label: "Dom" }
  ],
  Mensal: [
    { value: 680, label: "S1" },
    { value: 820, label: "S2" },
    { value: 760, label: "S3" },
    { value: 910, label: "S4" }
  ],
  Anual: [
    { value: 2100, label: "Jan" },
    { value: 1900, label: "Fev" },
    { value: 2380, label: "Mar" },
    { value: 2200, label: "Abr" },
    { value: 2050, label: "Mai" },
    { value: 1980, label: "Jun" }
  ]
};

type Props = NativeStackScreenProps<HistoryStackParamList, "HistoryHome">;

export function HistoryScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const [activePeriod, setActivePeriod] = useState<Period>("Semanal");
  const chartWidth = Math.max(220, width - theme.spacing.xl * 2 - theme.spacing.lg * 2 - 38);
  const maxDataValue = Math.max(...periodData[activePeriod].map((entry) => entry.value));
  const data = periodData[activePeriod].map((item) => {
    const frontColor =
      item.value >= maxDataValue * 0.9
        ? theme.colors.danger
        : item.value >= maxDataValue * 0.72
          ? theme.colors.warning
          : theme.colors.primary;

    return {
      ...item,
      frontColor,
      gradientColor:
        frontColor === theme.colors.danger
          ? "#F2A6AF"
          : frontColor === theme.colors.warning
            ? "#F8D585"
            : theme.colors.brand[300]
    };
  });
  const totalPeriod = data.reduce((s, d) => s + d.value, 0);
  const peak = Math.max(...data.map((d) => d.value));
  const minimum = Math.min(...data.map((d) => d.value));
  const avg = Math.round(totalPeriod / data.length);
  const peakLabel = data.find((item) => item.value === peak)?.label ?? "-";
  const minimumLabel = data.find((item) => item.value === minimum)?.label ?? "-";
  const goal = activePeriod === "Diario" ? 120 : activePeriod === "Semanal" ? 840 : activePeriod === "Mensal" ? 1200 : 14400;

  return (
    <ScreenContainer>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(380)}>
        <Text style={styles.eyebrow}>HISTORICO</Text>
        <Text style={styles.title}>Consumo por Periodo</Text>
        <Text style={styles.subtitle}>
          Filtre leituras e compare comportamentos ao longo do tempo.
        </Text>
      </Animated.View>

      {/* Period selector */}
      <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.segmented}>
        {periods.map((period) => (
          <Pressable
            key={period}
            onPress={() => setActivePeriod(period)}
            style={[styles.segment, activePeriod === period && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, activePeriod === period && styles.segmentTextActive]}>
              {period}
            </Text>
          </Pressable>
        ))}
      </Animated.View>

      {/* Chart card */}
      <Animated.View entering={FadeInDown.delay(100).duration(420)} style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Consumo do periodo</Text>
          <View style={styles.chartBadge}>
            <Ionicons name="water-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.chartBadgeText}>{activePeriod}</Text>
          </View>
        </View>
        <View style={styles.chartViewport}>
          <BarChart
            data={data}
            width={chartWidth}
            height={210}
            barWidth={activePeriod === "Mensal" ? 34 : 24}
            spacing={
              activePeriod === "Mensal"
                ? Math.max(16, (chartWidth - 34 * data.length) / Math.max(data.length - 1, 1))
                : Math.max(10, (chartWidth - 24 * data.length) / Math.max(data.length - 1, 1))
            }
            initialSpacing={4}
            endSpacing={4}
            disableScroll
            showGradient
            gradientColor="rgba(255,255,255,0.18)"
            yAxisColor="transparent"
            xAxisColor={theme.colors.border}
            yAxisThickness={0}
            xAxisThickness={1}
            yAxisLabelWidth={32}
            noOfSections={5}
            maxValue={Math.ceil((maxDataValue * 1.12) / 10) * 10}
            barBorderTopLeftRadius={12}
            barBorderTopRightRadius={12}
            barBorderBottomLeftRadius={8}
            barBorderBottomRightRadius={8}
            hideRules={false}
            rulesColor="rgba(204,226,237,0.75)"
            rulesType="dashed"
            dashWidth={4}
            dashGap={6}
            isAnimated
            yAxisTextStyle={{
              color: theme.colors.textMuted,
              fontSize: 10,
              fontFamily: theme.typography.fonts.body
            }}
            xAxisLabelTextStyle={{
              color: theme.colors.textMuted,
              fontSize: 10,
              fontFamily: theme.typography.fonts.body
            }}
          />
        </View>
      </Animated.View>

      {/* Stats grid */}
      <Animated.View entering={FadeInUp.delay(140).duration(430)} style={styles.statsGrid}>
        {[
          {
            label: "Pico",
            value: `${peak}L`,
            caption: peakLabel,
            icon: "trending-up-outline" as const,
            iconColor: theme.colors.danger,
            iconBg: "rgba(230,86,98,0.1)"
          },
          {
            label: "Minimo",
            value: `${minimum}L`,
            caption: minimumLabel,
            icon: "trending-down-outline" as const,
            iconColor: theme.colors.success,
            iconBg: "rgba(29,156,122,0.1)"
          },
          {
            label: "Media",
            value: `${avg}L`,
            caption: "Por dia",
            icon: "analytics-outline" as const,
            iconColor: theme.colors.primary,
            iconBg: "rgba(37,119,191,0.1)"
          },
          {
            label: "Tendencia",
            value: "-5%",
            caption: "Reducao",
            icon: "arrow-down-circle-outline" as const,
            iconColor: theme.colors.success,
            iconBg: "rgba(29,156,122,0.1)"
          }
        ].map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: stat.iconBg }]}>
              <Ionicons name={stat.icon} size={18} color={stat.iconColor} />
            </View>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={[styles.statValue, { color: stat.iconColor }]}>{stat.value}</Text>
            <Text style={styles.statCaption}>{stat.caption}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Total */}
      <Animated.View entering={FadeInUp.delay(180).duration(440)} style={styles.totalCard}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalLabel}>Consumo Total no Periodo</Text>
            <Text style={styles.totalValue}>{totalPeriod.toLocaleString("pt-BR")} L</Text>
          </View>
          <View style={styles.trendBadge}>
            <Ionicons name="arrow-down" size={14} color={theme.colors.success} />
            <Text style={[styles.trendText, { color: theme.colors.success }]}>Reducao (-5%)</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min((totalPeriod / goal) * 100, 100)}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          vs meta do periodo de {goal.toLocaleString("pt-BR")}L
        </Text>
      </Animated.View>

      {/* Detail button */}
      <Animated.View entering={FadeInUp.delay(220).duration(440)}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => navigation.navigate("ConsumptionDetails")}
        >
          <View style={styles.detailIconSlot}>
            <Ionicons name="bar-chart-outline" size={18} color="#FFFFFF" />
          </View>
          <Text style={styles.detailButtonText}>Ver analise detalhada</Text>
          <View style={styles.detailIconSlot}>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
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
  segmented: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.pill,
    padding: theme.spacing.xs
  },
  segment: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    alignItems: "center"
  },
  segmentActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4
  },
  segmentText: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted
  },
  segmentTextActive: {
    color: "#FFFFFF",
    fontFamily: theme.typography.fonts.bodySemiBold
  },
  chartCard: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.lg,
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
  chartBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs
  },
  chartBadgeText: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary
  },
  statsGrid: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
    shadowColor: "#123D5E",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xs
  },
  statLabel: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  statValue: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text
  },
  statCaption: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted
  },
  totalCard: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
    shadowColor: "#123D5E",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  totalLabel: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted
  },
  totalValue: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text,
    marginTop: 2
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(29,156,122,0.1)",
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs
  },
  trendText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.xs
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.cardMuted,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: theme.colors.primary
  },
  progressLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted
  },
  detailButton: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    minHeight: 58,
    shadowColor: theme.colors.secondary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6
  },
  chartViewport: {
    width: "100%",
    overflow: "hidden",
    alignItems: "center",
    borderRadius: theme.radius.md,
    paddingTop: theme.spacing.xs,
    backgroundColor: "rgba(249,253,255,0.62)"
  },
  detailIconSlot: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  detailButtonText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.md,
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
    paddingHorizontal: theme.spacing.sm
  }
});
