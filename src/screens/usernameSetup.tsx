import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { createGlobalStyles } from "../theme/globalStyles";
import { getTheme } from "../theme/theme";

export default function UsernameSetup() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const { setUsername: saveUsername, checkUsernameExists, user } = useAuth();
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const colors = getTheme(theme);

  const validateUsername = (value: string): boolean => {
    return /^[a-z0-9_]{3,20}$/.test(value);
  };

  const checkAvailability = async () => {
    if (!validateUsername(username)) {
      setIsAvailable(false);
      return;
    }

    setChecking(true);

    try {
      const exists = await checkUsernameExists(username);
      setIsAvailable(!exists);
    } catch (error) {
      console.error("Error checking username:", error);
      setIsAvailable(null);
    } finally {
      setChecking(false);
    }
  };

  const handleSetUsername = async () => {
    if (!validateUsername(username)) {
      Alert.alert(
        "Invalid Username",
        "Username must be 3-20 characters, lowercase letters, numbers, and underscores only",
      );
      return;
    }

    setLoading(true);

    try {
      await saveUsername(username);
      Alert.alert("Success", "Username set successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAvailabilityIndicator = () => {
    if (checking) {
      return (
        <Text style={[styles.bodyText, { marginTop: 8 }]}>
          Checking availability...
        </Text>
      );
    }

    if (isAvailable === true) {
      return (
        <Text
          style={[styles.bodyText, { color: colors.success, marginTop: 8 }]}
        >
          Username is available!
        </Text>
      );
    }

    if (isAvailable === false && username.length > 0) {
      return (
        <Text style={[styles.bodyText, { color: colors.danger, marginTop: 8 }]}>
          Username is not available or invalid
        </Text>
      );
    }

    return null;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { justifyContent: "center" },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Text style={styles.heading}>Choose Your Username</Text>
          <Text style={styles.bodyText}>
            This will be your unique identifier. You can use it to login instead
            of your email.
          </Text>

          <View style={{ height: 32 }} />

          {/* Username Input */}
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username (e.g., john_doe123)"
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={(text) => {
              setUsername(text.toLowerCase());
              setIsAvailable(null);
            }}
            onBlur={checkAvailability}
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={20}
          />

          {/* Availability Indicator */}
          {renderAvailabilityIndicator()}

          {/* Validation Hint */}
          <Text
            style={[
              styles.bodyText,
              { marginTop: 8, fontSize: 12, color: colors.textSecondary },
            ]}
          >
            3-20 characters, lowercase letters, numbers, and underscores only
          </Text>

          <View style={{ height: 24 }} />

          {/* Set Username Button */}
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleSetUsername}
            disabled={loading || isAvailable !== true}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.background }]}>
                Set Username
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
