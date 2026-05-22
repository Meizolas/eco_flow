import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppButton } from "../../components/app-button";
import { AppInput } from "../../components/app-input";
import { ScreenContainer } from "../../components/screen-container";
import { SectionHeader } from "../../components/section-header";
import { authApi } from "../../api/auth";
import { AuthStackParamList } from "../../types/navigation";
import { theme } from "../../theme";

const forgotPasswordSchema = z.object({
  email: z.string().email("Informe um email valido.")
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    const result = await authApi.forgotPassword(email);
    Alert.alert("Recuperacao", result.message, [
      {
        text: "Voltar para login",
        onPress: () => navigation.navigate("Login")
      },
      {
        text: "Continuar aqui",
        style: "cancel"
      }
    ]);
  });

  return (
    <ScreenContainer>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar para login"
        hitSlop={12}
        onPress={() => navigation.navigate("Login")}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>
      <SectionHeader
        eyebrow="Recuperacao"
        title="Recupere o acesso com seguranca"
        subtitle="No MVP o fluxo ja esta estruturado para integracao com email transacional."
      />
      <View style={styles.formCard}>
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
        <AppButton label={isSubmitting ? "Enviando..." : "Recuperar senha"} onPress={onSubmit} disabled={isSubmitting} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm
  },
  backText: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primary
  },
  formCard: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card
  }
});
