import { colors } from "./colors";
import { radius, spacing } from "./spacing";
import { typography } from "./typography";

export const theme = {
  colors,
  spacing,
  radius,
  typography,
  shadow: {
    card: {
      shadowColor: "#123D5E",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 18,
      elevation: 5
    }
  },
  chart: {
    primary: colors.brand[600],
    secondary: colors.brand[300],
    attention: colors.warning,
    grid: colors.border
  }
} as const;
