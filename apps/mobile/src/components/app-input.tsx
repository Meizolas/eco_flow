import { ReactNode, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { theme } from "../theme";

interface AppInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  error?: string;
  rightAdornment?: ReactNode;
}

export function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  error,
  rightAdornment
}: AppInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputFocused,
          error && styles.inputError
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          style={styles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightAdornment}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.sm
  },
  label: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted
  },
  labelFocused: {
    color: theme.colors.primary
  },
  inputWrapper: {
    minHeight: 56,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#123D5E",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: "#FAFEFF",
    shadowOpacity: 0.1,
    shadowColor: theme.colors.primary
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text
  },
  inputError: {
    borderColor: theme.colors.danger,
    backgroundColor: "rgba(230,86,98,0.03)"
  },
  error: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.danger,
    paddingLeft: theme.spacing.md
  }
});
