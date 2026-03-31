import { useState } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNotifications } from "../../hooks/use-dashboard-summary";
import { ScreenContainer } from "../../components/screen-container";
import { theme } from "../../theme";

const fallbackNotifications = [
  {
    id: "1",
    title: "Aviso",
    body: "Consumo acima da media nas ultimas 24 horas.",
    status: "SENT",
    time: "Hoje, 14:00"
  },
  {
    id: "2",
    title: "Alerta critico",
    body: "Possivel vazamento detectado. Verifique agora.",
    status: "SENT",
    time: "Hoje, 11:30"
  }
];

const tabs = ["Todos", "Avisos", "Criticos"] as const;
type Tab = (typeof tabs)[number];

export function AlertsScreen() {
  const notificationsQuery = useNotifications();
  const rawNotifications = notificationsQuery.data ?? fallbackNotifications;
  const [activeTab, setActiveTab] = useState<Tab>("Todos");

  const notifications = rawNotifications.map((item) => ({
    ...item,
    isCritical:
      item.title.toLowerCase().includes("critico") ||
      item.body.toLowerCase().includes("vazamento")
  }));

  const filtered = notifications.filter((item) => {
    if (activeTab === "Avisos") return !item.isCritical;
    if (activeTab === "Criticos") return item.isCritical;
    return true;
  });

  const criticalCount = notifications.filter((n) => n.isCritical).length;
  const warningCount = notifications.filter((n) => !n.isCritical).length;

  return (
    <ScreenContainer>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(380)}>
        <Text style={styles.eyebrow}>CENTRAL</Text>
        <Text style={styles.title}>Alertas e Notificacoes</Text>
        <Text style={styles.subtitle}>
          Avisos moderados, suspeitas de vazamento e historico de leituras.
        </Text>
      </Animated.View>

      {/* Summary badges */}
      <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.summaryRow}>
        <View style={[styles.summaryBadge, { borderColor: "rgba(242,184,75,0.5)", backgroundColor: "rgba(242,184,75,0.08)" }]}>
          <Ionicons name="warning-outline" size={16} color={theme.colors.warning} />
          <Text style={[styles.summaryBadgeText, { color: theme.colors.warning }]}>
            {warningCount} {warningCount === 1 ? "Aviso" : "Avisos"}
          </Text>
        </View>
        <View style={[styles.summaryBadge, { borderColor: "rgba(230,86,98,0.5)", backgroundColor: "rgba(230,86,98,0.08)" }]}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
          <Text style={[styles.summaryBadgeText, { color: theme.colors.danger }]}>
            {criticalCount} {criticalCount === 1 ? "Critico" : "Criticos"}
          </Text>
        </View>
      </Animated.View>

      {/* Filter tabs */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.tabsRow}>
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </Pressable>
        ))}
      </Animated.View>

      {/* Alert list */}
      <View style={styles.list}>
        {filtered.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(140).duration(380)} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="checkmark-circle-outline" size={36} color={theme.colors.success} />
            </View>
            <Text style={styles.emptyTitle}>Tudo certo por aqui</Text>
            <Text style={styles.emptyText}>Nenhum alerta nesta categoria no momento.</Text>
          </Animated.View>
        ) : (
          filtered.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(140 + index * 60).duration(400)}
            >
              <View
                style={[
                  styles.card,
                  item.isCritical ? styles.criticalCard : styles.warningCard
                ]}
              >
                {/* Icon + tag row */}
                <View style={styles.cardTop}>
                  <View
                    style={[
                      styles.cardIconWrap,
                      {
                        backgroundColor: item.isCritical
                          ? "rgba(230,86,98,0.12)"
                          : "rgba(242,184,75,0.12)"
                      }
                    ]}
                  >
                    <Ionicons
                      name={item.isCritical ? "alert-circle" : "warning-outline"}
                      size={22}
                      color={item.isCritical ? theme.colors.danger : theme.colors.warning}
                    />
                  </View>
                  <View style={styles.cardTagWrap}>
                    <View
                      style={[
                        styles.tag,
                        item.isCritical ? styles.criticalTag : styles.warningTag
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          { color: item.isCritical ? theme.colors.danger : "#A66D00" }
                        ]}
                      >
                        {item.isCritical ? "CRITICO" : "AVISO"}
                      </Text>
                    </View>
                    {"time" in item && (
                      <Text style={styles.timeText}>{(item as { time?: string }).time}</Text>
                    )}
                  </View>
                </View>

                {/* Content */}
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>{item.body}</Text>

                {/* Action for critical */}
                {item.isCritical && (
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="search-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Verificar Agora</Text>
                  </TouchableOpacity>
                )}

                {/* Read status */}
                <View style={styles.cardFooter}>
                  <View style={styles.unreadDot} />
                  <Text style={styles.statusText}>Nao lido</Text>
                </View>
              </View>
            </Animated.View>
          ))
        )}
      </View>
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
  summaryRow: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    gap: theme.spacing.md
  },
  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm
  },
  summaryBadgeText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.sm
  },
  tabsRow: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.cardMuted,
    borderRadius: theme.radius.pill,
    padding: theme.spacing.xs
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    alignItems: "center"
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4
  },
  tabText: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontFamily: theme.typography.fonts.bodySemiBold
  },
  list: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.lg
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.md
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "rgba(29,156,122,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text
  },
  emptyText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    textAlign: "center"
  },
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    gap: theme.spacing.sm,
    shadowColor: "#123D5E",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 4
  },
  warningCard: {
    borderColor: "rgba(242,184,75,0.4)",
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning
  },
  criticalCard: {
    borderColor: "rgba(230,86,98,0.4)",
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  cardTagWrap: {
    flex: 1,
    gap: 2
  },
  tag: {
    alignSelf: "flex-start",
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 3
  },
  warningTag: {
    backgroundColor: "#FFF5D9"
  },
  criticalTag: {
    backgroundColor: "#FFE1E5"
  },
  tagText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 10,
    letterSpacing: 0.8
  },
  timeText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted
  },
  cardTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text
  },
  cardBody: {
    fontFamily: theme.typography.fonts.body,
    lineHeight: theme.typography.lineHeights.md,
    color: theme.colors.textMuted
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    alignSelf: "flex-start",
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.xs,
    shadowColor: theme.colors.danger,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4
  },
  actionButtonText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.sm,
    color: "#FFFFFF"
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: theme.colors.primary
  },
  statusText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted
  }
});
