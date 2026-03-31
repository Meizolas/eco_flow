import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { BarChart } from "react-native-gifted-charts";
import { ScreenContainer } from "../../components/screen-container";
import { HistoryStackParamList } from "../../types/navigation";
import { theme } from "../../theme";

const periods = ["Diario", "Semanal", "Mensal", "Anual"] as const;
type Period = (typeof periods)[number];

const data = [
  { value: 120, label: "Seg", frontColor: theme.colors.primary, gradientColor: theme.colors.brand[300] },
  { value: 85, label: "Ter", frontColor: theme.colors.primary, gradientColor: theme.colors.brand[300] },
  { value: 190, label: "Qua", frontColor: theme.colors.warning, gradientColor: "#F8D585" },
  { value: 260, label: "Qui", frontColor: theme.colors.danger, gradientColor: "#F2A6AF" },
  { value: 170, label: "Sex", frontColor: theme.colors.primary, gradientColor: theme.colors.brand[300] },
  { value: 220, label: "Sab", frontColor: theme.colors.warning, gradientColor: "#F8D585" }
];

const totalPeriod = data.reduce((s, d) => s + d.value, 0);
const peak = Math.max(...data.map((d) => d.value));
const minimum = Math.min(...data.map((d) => d.value));
const avg = Math.round(totalPeriod / data.length);

type Props = NativeStackScreenProps<HistoryStackParamList, "HistoryHome">;

export function HistoryScreen({ navigation }: Props) {
  const [activePeriod, setActivePeriod] = useState<Period>("Semanal");

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
        <BarChart
          data={data}
          yAxisColor={theme.colors.border}
          xAxisColor={theme.colors.border}
          barBorderRadius={10}
          hideRules={false}
          rulesColor={theme.colors.border}
          isAnimated
          yAxisTextStyle={{
            color: theme.colors.textMuted,
            fontSize: 11,
            fontFamily: theme.typography.fonts.body
          }}
          xAxisLabelTextStyle={{
            color: theme.colors.textMuted,
            fontSize: 11,
            fontFamily: theme.typography.fonts.body
          }}
        />
      </Animated.View>

      {/* Stats grid */}
      <Animated.View entering={FadeInUp.delay(140).duration(430)} style={styles.statsGrid}>
        {[
          {
            label: "Pico",
            value: `${peak}L`,
            caption: "Quinta-feira",
            icon: "trending-up-outline" as const,
            iconColor: theme.colors.danger,
            iconBg: "rgba(230,86,98,0.1)"
          },
          {
            label: "Minimo",
            value: `${minimum}L`,
            caption: "Terca-feira",
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
          <View style={[styles.progressFill, { width: `${Math.min((totalPeriod / 1200) * 100, 100)}%` }]} />
        </View>
        <Text style={styles.progressLabel}>vs meta mensal de 1.200L</Text>
      </Animated.View>

      {/* Detail button */}
      <Animated.View entering={FadeInUp.delay(220).duration(440)}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => navigation.navigate("ConsumptionDetails")}
        >
          <Ionicons name="bar-chart-outline" size={18} color="#FFFFFF" />
          <Text style={styles.detailButtonText}>Ver analise detalhada</Text>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
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
    justifyContent: "center",
    gap: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.lg,
    shadowColor: theme.colors.secondary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6
  },
  detailButtonText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.md,
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center"
  }
});
