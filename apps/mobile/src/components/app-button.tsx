import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../theme";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  style?: ViewStyle;
}

export function AppButton({ label, onPress, variant = "primary", disabled, style }: AppButtonProps) {
  if (variant === "primary") {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
          style
        ]}
      >
        <LinearGradient
          colors={disabled ? ["#8ABBD8", "#8ABBD8"] : ["#3DAEE2", "#1668B8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
        >
          <Text style={styles.lightLabel}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      <Text style={[styles.label, variant !== "secondary" && styles.lightLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.pill,
    minHeight: 54,
    overflow: "hidden",
    shadowColor: "#0B3F6A",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 5
  },
  gradientFill: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl
  },
  secondary: {
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.05
  },
  danger: {
    backgroundColor: theme.colors.danger,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.colors.danger,
    shadowOpacity: 0.3
  },
  disabled: {
    opacity: 0.5
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  },
  label: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text
  },
  lightLabel: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.md,
    color: "#FFFFFF"
  }
});
