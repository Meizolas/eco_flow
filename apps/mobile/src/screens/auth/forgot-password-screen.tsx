import { Controller, useForm } from "react-hook-form";
import { Alert, StyleSheet, View } from "react-native";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton } from "../../components/app-button";
import { AppInput } from "../../components/app-input";
import { ScreenContainer } from "../../components/screen-container";
import { SectionHeader } from "../../components/section-header";
import { authApi } from "../../api/auth";
import { theme } from "../../theme";

const forgotPasswordSchema = z.object({
  email: z.string().email("Informe um email valido.")
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    const result = await authApi.forgotPassword(email);
    Alert.alert("Recuperacao", result.message);
  });

  return (
    <ScreenContainer>
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
