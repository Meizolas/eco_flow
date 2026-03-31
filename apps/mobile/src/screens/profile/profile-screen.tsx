import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { AppButton } from "../../components/app-button";
import { ScreenContainer } from "../../components/screen-container";
import { useAuthStore } from "../../store/auth-store";
import { theme } from "../../theme";

const menuItems = [
  {
    label: "Dados da Conta",
    icon: "person-outline" as const,
    iconColor: theme.colors.primary,
    iconBg: "rgba(37,119,191,0.1)"
  },
  {
    label: "Meus Dispositivos",
    icon: "hardware-chip-outline" as const,
    iconColor: theme.colors.info,
    iconBg: "rgba(77,189,228,0.1)"
  },
  {
    label: "Alertas e Notificacoes",
    icon: "notifications-outline" as const,
    iconColor: theme.colors.warning,
    iconBg: "rgba(242,184,75,0.1)"
  },
  {
    label: "Limites Configurados",
    icon: "options-outline" as const,
    iconColor: theme.colors.success,
    iconBg: "rgba(29,156,122,0.1)",
    value: "120 L"
  },
  {
    label: "Privacidade",
    icon: "shield-checkmark-outline" as const,
    iconColor: "#7B68EE",
    iconBg: "rgba(123,104,238,0.1)"
  },
  {
    label: "Central de Ajuda",
    icon: "help-circle-outline" as const,
    iconColor: theme.colors.textMuted,
    iconBg: "rgba(106,131,152,0.1)"
  }
];

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const firstName = user?.name?.split(" ")[0] ?? "Usuario";

  return (
    <ScreenContainer>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(380)} style={styles.pageHeader}>
        <Text style={styles.pageEyebrow}>MEU PERFIL</Text>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Conta</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={22} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Profile hero card */}
      <Animated.View entering={FadeInDown.delay(60).duration(420)} style={styles.profileCard}>
        <LinearGradient
          colors={["#1668B8", "#0D4A8C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileGradient}
        >
          {/* Decorative circles */}
          <View style={[styles.decorCircle, styles.decorCircle1]} />
          <View style={[styles.decorCircle, styles.decorCircle2]} />

          {/* Avatar com inicial do usuário */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing}>
              <LinearGradient
                colors={["#41C8E8", "#1668B8"]}
                style={styles.avatarBg}
              >
                <Text style={styles.avatarInitial}>
                  {(user?.name ?? "U")[0].toUpperCase()}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* User info */}
          <Text style={styles.profileName}>{user?.name ?? "Usuario EcoFlow"}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? "usuario@ecoflow.app"}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>120L</Text>
              <Text style={styles.statLabel}>Limite</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>Propriedade</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Ativo</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Menu items */}
      <Animated.View entering={FadeInUp.delay(100).duration(440)} style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            style={[
              styles.menuItem,
              index < menuItems.length - 1 && styles.menuItemBorder
            ]}
          >
            <View style={[styles.menuItemIcon, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon} size={20} color={item.iconColor} />
            </View>
            <Text style={styles.menuItemLabel}>{item.label}</Text>
            <View style={styles.menuItemRight}>
              {item.value ? (
                <Text style={styles.menuItemValue}>{item.value}</Text>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* App version */}
      <Animated.View entering={FadeInUp.delay(160).duration(440)} style={styles.versionRow}>
        <Ionicons name="water-outline" size={14} color={theme.colors.textMuted} />
        <Text style={styles.versionText}>EcoFlow v1.0 — MVP</Text>
      </Animated.View>

      {/* Sign out */}
      <Animated.View entering={FadeInUp.delay(200).duration(440)}>
        <AppButton label="Sair da conta" onPress={signOut} variant="danger" style={styles.logout} />
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  pageHeader: {
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  pageTitle: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  profileCard: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#0B3F6A",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 9
  },
  profileGradient: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    alignItems: "center",
    gap: theme.spacing.sm
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.07)"
  },
  decorCircle1: {
    width: 180,
    height: 180,
    top: -60,
    right: -50
  },
  decorCircle2: {
    width: 120,
    height: 120,
    bottom: -30,
    left: -30
  },
  avatarWrap: {
    marginBottom: theme.spacing.xs
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 32,
    padding: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)"
  },
  avatarBg: {
    flex: 1,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarInitial: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: 38,
    color: "#FFFFFF",
    lineHeight: 44
  },
  profileName: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xl,
    color: "#FFFFFF"
  },
  profileEmail: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: "rgba(255,255,255,0.75)"
  },
  statsRow: {
    marginTop: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.xl,
    width: "100%",
    justifyContent: "center"
  },
  statItem: {
    alignItems: "center",
    gap: 2
  },
  statValue: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.lg,
    color: "#FFFFFF"
  },
  statLabel: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 11,
    color: "rgba(255,255,255,0.65)"
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  menuCard: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    shadowColor: "#123D5E",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    gap: theme.spacing.md
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  menuItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  menuItemLabel: {
    flex: 1,
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm
  },
  menuItemValue: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted
  },
  versionRow: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs
  },
  versionText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted
  },
  logout: {
    marginTop: theme.spacing.lg
  }
});
