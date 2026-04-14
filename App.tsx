import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, StyleSheet } from "react-native";

// Kontekstit
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

// Komponentit ja näkymät
import Tabs from "./src/components/naviGationBar";
import ExerciseScreen from "./src/screens/ExerciseScreen";
import Login from "./src/screens/login";
import Register from "./src/screens/register";
import UsernameSetup from "./src/screens/usernameSetup";
import CoursePage from "./src/screens/Courses";
import CodingScreen from "./src/screens/CodingScreen";

const Stack = createNativeStackNavigator();
type AuthScreen = "Login" | "Register";

// Apufunktio kirjautumisnäkymille
function AuthFlow({ screen, onSwitch }: { screen: AuthScreen; onSwitch: () => void }) {
  return screen === "Login" ? <Login onNavigate={onSwitch} /> : <Register onNavigate={onSwitch} />;
}

function MainNavigator() {
  const { user, userProfile, isLoading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>("Login");

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const switchAuthScreen = () => {
    setAuthScreen(authScreen === "Login" ? "Register" : "Login");
  };

  return (
    <NavigationContainer>
      {!user ? (
        /* 1. Ei kirjautunut: Näytetään kirjautuminen tai rekisteröinti */
        <AuthFlow screen={authScreen} onSwitch={switchAuthScreen} />
      ) : userProfile && !userProfile.hasUsername ? (
        /* 2. Kirjautunut, mutta nimimerkki puuttuu */
        <UsernameSetup />
      ) : (
        /* 3. Kirjautunut sisään: Näytetään pääsovellus (Tabs + Stack) */
        <Stack.Navigator>
          <Stack.Screen 
            name="MainTabs" 
            component={Tabs} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ExerciseDetail" 
            component={ExerciseScreen} 
            options={({ route }: any) => ({ 
              title: route.params?.title || 'Exercise Detail',
              headerBackTitle: 'Back', 
            })} 
          />
          <Stack.Screen 
            name={"CodingScreen"}
            component={CodingScreen}
          />
        </Stack.Navigator>
      )}
      <StatusBar style="auto" />
    </NavigationContainer>
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