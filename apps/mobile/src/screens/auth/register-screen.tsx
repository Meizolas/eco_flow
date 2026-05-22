import { Controller, Resolver, useForm } from "react-hook-form";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../../components/app-button";
import { AppInput } from "../../components/app-input";
import { ScreenContainer } from "../../components/screen-container";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../store/auth-store";
import { AuthStackParamList } from "../../types/navigation";
import { theme } from "../../theme";

const registerSchema = z
  .object({
    name: z.string().min(3, "Informe seu nome."),
    email: z.string().email("Informe um email valido."),
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas precisam ser iguais.",
    path: ["confirmPassword"]
  });

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const setSession = useAuthStore((state) => state.setSession);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema) as unknown as Resolver<RegisterForm>
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await authApi.register(values as unknown as RegisterForm);
    setSession({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user
    });
  });

  return (
    <ScreenContainer>
      {/* Logo compacta no topo */}
      <Animated.View entering={FadeInDown.duration(420)} style={styles.logoBlock}>
        <Image
          source={require("../../../assets/ecoflow-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInDown.delay(60).duration(430)} style={styles.titleBlock}>
        <Text style={styles.eyebrow}>NOVO CADASTRO</Text>
        <Text style={styles.title}>Crie sua conta</Text>
        <Text style={styles.subtitle}>
          Conecte seu consumo e comece a monitorar com inteligencia.
        </Text>
      </Animated.View>

      {/* Benefits */}
      <Animated.View entering={FadeInDown.delay(100).duration(430)} style={styles.benefitsRow}>
        {[
          { icon: "water-outline" as const, label: "Monitoramento em tempo real" },
          { icon: "notifications-outline" as const, label: "Alertas inteligentes" },
          { icon: "shield-checkmark-outline" as const, label: "Dados protegidos" }
        ].map((item) => (
          <View key={item.label} style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name={item.icon} size={16} color={theme.colors.primary} />
            </View>
            <Text style={styles.benefitText}>{item.label}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Form */}
      <Animated.View entering={FadeInUp.delay(160).duration(460)} style={styles.formCard}>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange } }) => (
            <AppInput
              label="Nome completo"
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="Seu nome"
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <AppInput
              label="Email"
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="voce@exemplo.com"
              keyboardType="email-address"
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange } }) => (
            <AppInput
              label="Senha"
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="Minimo 8 caracteres"
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { value, onChange } }) => (
            <AppInput
              label="Confirmar senha"
              value={value ?? ""}
              onChangeText={onChange}
              placeholder="Repita a senha"
              secureTextEntry
              error={errors.confirmPassword?.message}
            />
          )}
        />

        <AppButton
          label={isSubmitting ? "Criando conta..." : "Criar conta"}
          onPress={onSubmit}
          disabled={isSubmitting}
        />

        <View style={styles.termsRow}>
          <Text style={styles.termsText}>Ao criar conta, voce concorda com os </Text>
          <Text style={styles.termsLink}>Termos de Uso</Text>
          <Text style={styles.termsText}> e </Text>
          <Text style={styles.termsLink}>Privacidade</Text>
        </View>
      </Animated.View>

      {/* Login CTA */}
      <Animated.View entering={FadeInUp.delay(220).duration(440)} style={styles.loginRow}>
        <Text style={styles.loginPrompt}>Ja tem uma conta?</Text>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>Fazer login</Text>
        </Pressable>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoBlock: {
    marginTop: theme.spacing.sm,
    alignItems: "center"
  },
  logo: {
    width: 160,
    height: 160
  },
  titleBlock: {
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs
  },
  eyebrow: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 1.5,
    color: theme.colors.primary,
    textTransform: "uppercase"
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeights.xl
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.lineHeights.md
  },
  benefitsRow: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm
  },
  benefitIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(37,119,191,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  benefitText: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text
  },
  formCard: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: "#123D5E",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 5
  },
  termsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center"
  },
  termsText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: 12,
    color: theme.colors.textMuted
  },
  termsLink: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: 12,
    color: theme.colors.primary
  },
  loginRow: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs
  },
  loginPrompt: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted
  },
  loginLink: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary
  }
});
