import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../../components/app-button";
import { AppInput } from "../../components/app-input";
import { ScreenContainer } from "../../components/screen-container";
import { appConfig } from "../../config/app-config";
import { useLoginMutation } from "../../hooks/use-login-mutation";
import { AuthStackParamList } from "../../types/navigation";
import { theme } from "../../theme";

const loginSchema = z.object({
  email: z.string().email("Informe um email valido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.")
});

type LoginForm = z.infer<typeof loginSchema>;
type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: appConfig.demoMode ? appConfig.demoUserEmail : "",
      password: appConfig.demoMode ? appConfig.demoUserPassword : ""
    }
  });

  return (
    <ScreenContainer>
      {/* Logo — já inclui "ECOFLOW" e tagline */}
      <Animated.View entering={FadeInDown.duration(500)} style={styles.logoBlock}>
        <Image
          source={require("../../../assets/ecoflow-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Title */}
      <Animated.View entering={FadeInDown.delay(80).duration(440)} style={styles.titleBlock}>
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>
          Entre para acompanhar seu consumo, alertas e tendencias.
        </Text>
      </Animated.View>

      {/* Form card */}
      <Animated.View entering={FadeInUp.delay(140).duration(460)} style={styles.formCard}>
        <Controller
          control={control}
          name="email"
          render={({ field: { value, onChange } }) => (
            <AppInput
              label="Email"
              value={value}
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
              value={value}
              onChangeText={onChange}
              placeholder="Sua senha"
              secureTextEntry={!showPassword}
              error={errors.password?.message}
              rightAdornment={
                <Pressable
                  onPress={() => setShowPassword((c) => !c)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={theme.colors.textMuted}
                  />
                </Pressable>
              }
            />
          )}
        />

        {appConfig.demoMode ? (
          <View style={styles.demoCard}>
            <View style={styles.demoHeader}>
              <Ionicons name="flask-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.demoTitle}>Modo demo</Text>
            </View>
            <Text style={styles.demoText}>{appConfig.demoUserEmail}</Text>
            <Text style={styles.demoText}>{appConfig.demoUserPassword}</Text>
          </View>
        ) : null}

        {loginMutation.error ? (
          <View style={styles.errorWrap}>
            <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
            <Text style={styles.error}>{loginMutation.error.message}</Text>
          </View>
        ) : null}

        <AppButton
          label={loginMutation.isPending ? "Entrando..." : "Entrar"}
          onPress={handleSubmit((values) => loginMutation.mutate(values))}
          disabled={loginMutation.isPending}
        />

        <Pressable onPress={() => navigation.navigate("ForgotPassword")} style={styles.forgotWrap}>
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </Pressable>
      </Animated.View>

      {/* Cadastro CTA */}
      <Animated.View entering={FadeInUp.delay(200).duration(440)} style={styles.registerRow}>
        <Text style={styles.registerPrompt}>Ainda nao tem conta?</Text>
        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerLink}>Criar conta gratis</Text>
        </Pressable>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoBlock: {
    marginTop: theme.spacing.md,
    alignItems: "center"
  },
  logo: {
    width: 220,
    height: 220
  },
  titleBlock: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs
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
  eyeButton: {
    padding: theme.spacing.xs
  },
  demoCard: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: "rgba(180,225,242,0.7)"
  },
  demoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs
  },
  demoTitle: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary
  },
  demoText: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    paddingLeft: theme.spacing.xl
  },
  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    backgroundColor: "rgba(230,86,98,0.08)",
    borderRadius: theme.radius.md,
    padding: theme.spacing.md
  },
  error: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.danger,
    flex: 1
  },
  forgotWrap: {
    alignItems: "center"
  },
  forgotText: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted
  },
  registerRow: {
    marginTop: theme.spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs
  },
  registerPrompt: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted
  },
  registerLink: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary
  }
});
