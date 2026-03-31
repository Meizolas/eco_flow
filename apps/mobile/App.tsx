import "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts as useInterFonts
} from "@expo-google-fonts/inter";
import { Manrope_700Bold, useFonts as useManropeFonts } from "@expo-google-fonts/manrope";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootNavigation } from "./src/navigation/root-navigation";

const queryClient = new QueryClient();

export default function App() {
  useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold
  });
  useManropeFonts({
    Manrope_700Bold
  });

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <RootNavigation />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
