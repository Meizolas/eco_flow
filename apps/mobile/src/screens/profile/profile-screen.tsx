import { useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { AppButton } from "../../components/app-button";
import { ScreenContainer } from "../../components/screen-container";
import { useAuthStore } from "../../store/auth-store";
import { useLimitsStore } from "../../store/limits-store";
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
    iconBg: "rgba(29,156,122,0.1)"
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
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const profilePhotoUri = useAuthStore((state) => state.profilePhotoUri);
  const setProfilePhotoUri = useAuthStore((state) => state.setProfilePhotoUri);
  const updateUser = useAuthStore((state) => state.updateUser);
  const storedDeviceName = useAuthStore((state) => state.deviceName);
  const setStoredDeviceName = useAuthStore((state) => state.setDeviceName);
  const monthlyLimitLiters = useLimitsStore((state) => state.monthlyLimitLiters);
  const setMonthlyLimitLiters = useLimitsStore((state) => state.setMonthlyLimitLiters);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [editableName, setEditableName] = useState(user?.name ?? "");
  const [editableEmail, setEditableEmail] = useState(user?.email ?? "");
  const [deviceName, setDeviceName] = useState(storedDeviceName);
  const [limitDraft, setLimitDraft] = useState(String(monthlyLimitLiters));
  const [pushEnabled, setPushEnabled] = useState(true);
  const [leakAlertsEnabled, setLeakAlertsEnabled] = useState(true);

  const firstName = user?.name?.split(" ")[0] ?? "Usuario";
  const pickProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Autorize o acesso as fotos para escolher uma imagem de perfil.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75
    });

    if (!result.canceled) {
      setProfilePhotoUri(result.assets[0].uri);
    }
  };

  const handleMenuPress = (label: string) => {
    if (label === "Alertas e Notificacoes") {
      navigation.navigate("AlertsTab");
      return;
    }

    setActivePanel(label);
  };

  const saveAccount = () => {
    updateUser({ name: editableName.trim() || user?.name, email: editableEmail.trim() || user?.email });
    setActivePanel(null);
  };

  const saveLimit = async () => {
    const nextLimit = Number(limitDraft.replace(",", "."));

    if (!Number.isFinite(nextLimit) || nextLimit <= 0) {
      Alert.alert("Limite invalido", "Informe um limite maior que zero.");
      return;
    }

    await setMonthlyLimitLiters(nextLimit);
    setActivePanel(null);
  };

  const saveDevice = () => {
    setStoredDeviceName(deviceName.trim() || "Hidrometro Principal");
    setActivePanel(null);
  };

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
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Alterar foto de perfil"
            activeOpacity={0.85}
            onPress={pickProfilePhoto}
            style={styles.avatarWrap}
          >
            <View style={styles.avatarRing}>
              {profilePhotoUri ? (
                <Image source={{ uri: profilePhotoUri }} style={styles.avatarPhoto} />
              ) : (
                <LinearGradient
                  colors={["#41C8E8", "#1668B8"]}
                  style={styles.avatarBg}
                >
                  <Text style={styles.avatarInitial}>
                    {(user?.name ?? "U")[0].toUpperCase()}
                  </Text>
                </LinearGradient>
              )}
            </View>
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera-outline" size={16} color={theme.colors.primary} />
            </View>
          </TouchableOpacity>

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
            onPress={() => handleMenuPress(item.label)}
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
              {item.label === "Limites Configurados" ? (
                <Text style={styles.menuItemValue}>{monthlyLimitLiters} L</Text>
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

      <Modal visible={activePanel != null} transparent animationType="fade" onRequestClose={() => setActivePanel(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setActivePanel(null)}>
          <Pressable style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activePanel}</Text>
              <TouchableOpacity style={styles.modalClose} onPress={() => setActivePanel(null)}>
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              {activePanel === "Dados da Conta" ? (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.inputLabel}>Nome</Text>
                    <TextInput value={editableName} onChangeText={setEditableName} style={styles.textInput} placeholder="Seu nome" />
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput value={editableEmail} onChangeText={setEditableEmail} style={styles.textInput} keyboardType="email-address" autoCapitalize="none" />
                  </View>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>Conta ativa, monitoramento mensal e sincronizacao local do perfil habilitados.</Text>
                  </View>
                  <TouchableOpacity style={styles.primaryModalButton} onPress={saveAccount}>
                    <Text style={styles.primaryModalButtonText}>Salvar dados</Text>
                  </TouchableOpacity>
                </>
              ) : null}

              {activePanel === "Meus Dispositivos" ? (
                <>
                  <View style={styles.deviceCard}>
                    <View style={styles.deviceIcon}>
                      <Ionicons name="hardware-chip-outline" size={22} color={theme.colors.info} />
                    </View>
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceTitle}>{deviceName}</Text>
                      <Text style={styles.deviceMeta}>Online - enviando leituras via API</Text>
                    </View>
                  </View>
                  <Text style={styles.inputLabel}>Nome do dispositivo</Text>
                  <TextInput value={deviceName} onChangeText={setDeviceName} style={styles.textInput} />
                  <TouchableOpacity style={styles.primaryModalButton} onPress={saveDevice}>
                    <Text style={styles.primaryModalButtonText}>Salvar dispositivo</Text>
                  </TouchableOpacity>
                </>
              ) : null}

              {activePanel === "Limites Configurados" ? (
                <>
                  <View style={styles.limitHighlight}>
                    <Text style={styles.limitValue}>{monthlyLimitLiters}L</Text>
                    <Text style={styles.limitCaption}>Limite mensal atual</Text>
                  </View>
                  <Text style={styles.inputLabel}>Novo limite mensal em litros</Text>
                  <TextInput value={limitDraft} onChangeText={setLimitDraft} keyboardType="numeric" style={styles.textInput} />
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>Aviso em 85% do limite e alerta critico quando houver suspeita de vazamento.</Text>
                  </View>
                  <TouchableOpacity style={styles.primaryModalButton} onPress={saveLimit}>
                    <Text style={styles.primaryModalButtonText}>Atualizar limite</Text>
                  </TouchableOpacity>
                </>
              ) : null}

              {activePanel === "Privacidade" ? (
                <>
                  <View style={styles.privacyRow}>
                    <View>
                      <Text style={styles.privacyTitle}>Notificacoes push</Text>
                      <Text style={styles.privacyText}>Permitir avisos importantes no celular.</Text>
                    </View>
                    <Switch value={pushEnabled} onValueChange={setPushEnabled} />
                  </View>
                  <View style={styles.privacyRow}>
                    <View>
                      <Text style={styles.privacyTitle}>Alertas de vazamento</Text>
                      <Text style={styles.privacyText}>Priorizar eventos criticos de consumo.</Text>
                    </View>
                    <Switch value={leakAlertsEnabled} onValueChange={setLeakAlertsEnabled} />
                  </View>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>Seus dados de consumo sao usados apenas para historico, alertas e analises do EcoFlow.</Text>
                  </View>
                </>
              ) : null}

              {activePanel === "Central de Ajuda" ? (
                <>
                  {[
                    ["Como o consumo ao vivo funciona?", "O sensor ou simulador envia leituras para a API, e a dashboard busca atualizacoes automaticamente."],
                    ["Nao consigo logar", "Confira se API e celular estao na mesma rede e se o apiUrl aponta para o IP do computador."],
                    ["Quando recebo alertas?", "Quando o consumo passa do padrao esperado ou do limite configurado."]
                  ].map(([title, body]) => (
                    <View key={title} style={styles.helpItem}>
                      <Text style={styles.helpTitle}>{title}</Text>
                      <Text style={styles.helpBody}>{body}</Text>
                    </View>
                  ))}
                </>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  avatarPhoto: {
    flex: 1,
    borderRadius: 28
  },
  avatarEditBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.75)",
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
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(4,18,32,0.42)",
    justifyContent: "flex-end",
    padding: theme.spacing.lg
  },
  modalSheet: {
    maxHeight: "86%",
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    padding: theme.spacing.lg,
    ...theme.shadow.card
  },
  modalHandle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 99,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.lg
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg
  },
  modalTitle: {
    flex: 1,
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text
  },
  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.cardMuted
  },
  modalContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.sm
  },
  infoRow: {
    gap: theme.spacing.xs
  },
  inputLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text
  },
  textInput: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.background
  },
  summaryBox: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: "rgba(185,225,242,0.8)"
  },
  summaryText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.md,
    color: theme.colors.text
  },
  primaryModalButton: {
    minHeight: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.xs
  },
  primaryModalButtonText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.md,
    color: "#FFFFFF"
  },
  deviceCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(77,189,228,0.12)"
  },
  deviceInfo: {
    flex: 1,
    gap: 2
  },
  deviceTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text
  },
  deviceMeta: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted
  },
  limitHighlight: {
    alignItems: "center",
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.secondary
  },
  limitValue: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: 34,
    color: "#FFFFFF"
  },
  limitCaption: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: "rgba(255,255,255,0.78)"
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background
  },
  privacyTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text
  },
  privacyText: {
    maxWidth: 220,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted
  },
  helpItem: {
    gap: theme.spacing.xs,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background
  },
  helpTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text
  },
  helpBody: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.md,
    color: theme.colors.textMuted
  }
});
