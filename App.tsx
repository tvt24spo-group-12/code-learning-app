import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import Tabs from "./src/components/naviGationBar";
import { ThemeProvider } from "./src/context/ThemeContext";
import { ActivityIndicator, View, StyleSheet } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import Login from "./src/screens/login";
import Register from "./src/screens/register";
import UsernameSetup from "./src/screens/usernameSetup";

type AuthScreen = "Login" | "Register";

function AuthScreenContainer({
  screen,
  onSwitch,
}: {
  screen: AuthScreen;
  onSwitch: () => void;
}) {
  if (screen === "Login") {
    return <Login onNavigate={onSwitch} />;
  }
  return <Register onNavigate={onSwitch} />;
}

function MainNavigator() {
  const { user, userProfile, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("Login");

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const switchAuthScreen = () => {
    setAuthScreen(authScreen === "Login" ? "Register" : "Login");
  };

  return (
    <>
      {!user ? (
        // Not logged in - show auth screens
        <AuthScreenContainer screen={authScreen} onSwitch={switchAuthScreen} />
      ) : userProfile && !userProfile.hasUsername ? (
        // Logged in but no username - show username setup
        <UsernameSetup />
      ) : (
        // Fully logged in with username - show main app
        <NavigationContainer>
          <Tabs />
          <StatusBar style="auto" />
        </NavigationContainer>
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
