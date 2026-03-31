import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

interface MetricCardProps {
  label: string;
  value: string;
  accent?: "primary" | "warning" | "danger";
}

export function MetricCard({ label, value, accent = "primary" }: MetricCardProps) {
  return (
    <View style={[styles.card, styles[accent]]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card
  },
  primary: {
    borderTopWidth: 4,
    borderTopColor: theme.colors.primary
  },
  warning: {
    borderTopWidth: 4,
    borderTopColor: theme.colors.warning
  },
  danger: {
    borderTopWidth: 4,
    borderTopColor: theme.colors.danger
  },
  label: {
    fontFamily: theme.typography.fonts.bodyMedium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted
  },
  value: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.text
  }
});
