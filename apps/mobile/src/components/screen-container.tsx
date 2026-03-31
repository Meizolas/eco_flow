import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";

interface ScreenContainerProps extends PropsWithChildren {
  scrollable?: boolean;
}

export function ScreenContainer({ children, scrollable = true }: ScreenContainerProps) {
  const content = (
    <View style={styles.content}>
      {/* Top-right glow */}
      <LinearGradient
        colors={["rgba(62,198,224,0.22)", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glowTopRight}
      />
      {/* Bottom-left soft glow */}
      <LinearGradient
        colors={["rgba(37,119,191,0.12)", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glowBottomLeft}
      />
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scroll: {
    flexGrow: 1
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.background
  },
  glowTopRight: {
    position: "absolute",
    right: -40,
    top: -20,
    width: 240,
    height: 240,
    borderRadius: 999
  },
  glowBottomLeft: {
    position: "absolute",
    left: -60,
    bottom: 80,
    width: 200,
    height: 200,
    borderRadius: 999
  }
});
