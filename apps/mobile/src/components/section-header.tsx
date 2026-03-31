import { StyleSheet, Text, View } from "react-native";
import { theme } from "../theme";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.wrapper}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.xs
  },
  eyebrow: {
    fontFamily: theme.typography.fonts.bodySemiBold,
    fontSize: theme.typography.sizes.xs,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: theme.colors.primary
  },
  title: {
    fontFamily: theme.typography.fonts.heading,
    fontSize: theme.typography.sizes.xxl,
    lineHeight: theme.typography.lineHeights.xl,
    color: theme.colors.text
  },
  subtitle: {
    fontFamily: theme.typography.fonts.body,
    fontSize: theme.typography.sizes.md,
    lineHeight: theme.typography.lineHeights.md,
    color: theme.colors.textMuted
  }
});
