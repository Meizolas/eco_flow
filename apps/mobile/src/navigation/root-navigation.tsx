import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DashboardScreen } from "../screens/dashboard/dashboard-screen";
import { AlertsScreen } from "../screens/alerts/alerts-screen";
import { LimitsScreen } from "../screens/limits/limits-screen";
import { ProfileScreen } from "../screens/profile/profile-screen";
import { ConsumptionDetailsScreen } from "../screens/history/consumption-details-screen";
import { HistoryScreen } from "../screens/history/history-screen";
import { ForgotPasswordScreen } from "../screens/auth/forgot-password-screen";
import { LoginScreen } from "../screens/auth/login-screen";
import { RegisterScreen } from "../screens/auth/register-screen";
import { SplashScreen } from "../screens/auth/splash-screen";
import { useAuthStore } from "../store/auth-store";
import { AppTabParamList, AuthStackParamList, HistoryStackParamList } from "../types/navigation";
import { theme } from "../theme";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();

const tabLabels: Record<keyof AppTabParamList, string> = {
  DashboardTab: "Dashboard",
  HistoryTab: "Historico",
  AlertsTab: "Alertas",
  LimitsTab: "Limites",
  ProfileTab: "Perfil"
};

const tabIcons: Record<keyof AppTabParamList, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  DashboardTab: { active: "water", inactive: "water-outline" },
  HistoryTab: { active: "stats-chart", inactive: "stats-chart-outline" },
  AlertsTab: { active: "notifications", inactive: "notifications-outline" },
  LimitsTab: { active: "options", inactive: "options-outline" },
  ProfileTab: { active: "person-circle", inactive: "person-circle-outline" }
};

function HistoryStackNavigator() {
  return (
    <HistoryStack.Navigator id="HistoryStack" screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="HistoryHome" component={HistoryScreen} />
      <HistoryStack.Screen name="ConsumptionDetails" component={ConsumptionDetailsScreen} />
    </HistoryStack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      id="AppTabs"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          height: Platform.OS === "ios" ? 84 : 70,
          paddingBottom: Platform.OS === "ios" ? 22 : 10,
          paddingTop: 10,
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          shadowColor: "#0B3F6A",
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 16,
          elevation: 12
        },
        tabBarLabel: ({ color, focused }) => (
          <Text
            style={{
              color,
              fontFamily: focused
                ? theme.typography.fonts.bodySemiBold
                : theme.typography.fonts.body,
              fontSize: 11,
              marginTop: 2
            }}
          >
            {tabLabels[route.name]}
          </Text>
        ),
        tabBarIcon: ({ color, focused }) => {
          const icons = tabIcons[route.name];
          return (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Ionicons
                name={focused ? icons.active : icons.inactive}
                size={24}
                color={color}
              />
            </View>
          );
        }
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} />
      <Tab.Screen name="HistoryTab" component={HistoryStackNavigator} />
      <Tab.Screen name="AlertsTab" component={AlertsScreen} />
      <Tab.Screen name="LimitsTab" component={LimitsScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator id="AuthStack" screenOptions={{ headerShown: false }} initialRouteName="Login">
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="Splash" component={SplashScreen} />
    </AuthStack.Navigator>
  );
}

export function RootNavigation() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.card,
          primary: theme.colors.primary,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.danger
        }
      }}
    >
      {showSplash ? <SplashScreen /> : accessToken ? <AppTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  activeIconWrap: {
    backgroundColor: `${theme.colors.primary}18`,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4
  }
});
