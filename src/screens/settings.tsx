import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Switch } from 'react-native';
import { Moon, Mail, User, Lock, CreditCard, Trash2 } from 'lucide-react-native';
import { createGlobalStyles } from '../theme/globalStyles';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

type FormData = {
  email: string;
  username: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};


export default function SettingsPage({ navigation }: any) {
  const { theme, toggleTheme } = useTheme();
  const colors = getTheme(theme);
  const globalStyles = createGlobalStyles(theme);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Placeholder functions for API calls
  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      //TODO: Implement API call to update profile
      // await updateUserProfile(formData);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match.');
      return;
    }

    try {
      setIsLoading(true);
      //TODO: Implement API call to change password
      // await changeUserPassword(formData.currentPassword, formData.newPassword);
      Alert.alert('Success', 'Password changed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      // TODO: Integrate with Firebase Auth
      // await deleteUserAccount(deletePassword);
      Alert.alert('Success', 'Account deleted');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete account');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  const handleNavigateToBilling = () => {
    navigation.navigate('Billing');
  };
  
    return(
      <ScrollView style={[globalStyles.screenContainer]} showsVerticalScrollIndicator={false}>
        <View style={globalStyles.container}>
          {/* Header */}
          {/* <Text style={globalStyles.heading}>Settings</Text> */}

          {/* Theme Toggle */}
          <View style={[globalStyles.card, styles.themeCard]}>
            <View style={styles.themeRow}>
              <View style={styles.themeLabel}>
                <Moon size={20} color={colors.primary} />
                <Text style={[globalStyles.subheading, { marginBottom: 0, marginLeft: 8 }]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>
          </View>

          {/* Account Section */}
          <Text style={globalStyles.subheading}>Account Information</Text>
            <View style={globalStyles.card}>
              <View style={styles.inputGroup}>
                <View style={styles.inputWithIcon}>
                  <Mail size={16} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput 
                    style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Email"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    editable={!isLoading}
                    keyboardType="email-address"
                  />
                </View>

                <View style={globalStyles.divider} />

                <View style={styles.inputWithIcon}>
                  <User size={16} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput 
                    style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Username"
                    placeholderTextColor={colors.textSecondary}
                    value={formData.username}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: 12 }]}
                onPress={handleUpdateProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Update Profile</Text>
                )}
              </TouchableOpacity>
            </View>

          {/* Password Section */}
          <Text style={globalStyles.subheading}>Security</Text>

          <View style={globalStyles.card}>
            <View style={styles.inputGroup}>
              <View style={styles.inputWithIcon}>
                <Lock size={16} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Current Password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  value={formData.currentPassword}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, currentPassword: text }))}
                  editable={!isLoading}
                />
              </View>

              <View style={globalStyles.divider} />

              <View style={styles.inputWithIcon}>
                <Lock size={16} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="New Password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  value={formData.newPassword}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, newPassword: text }))}
                  editable={!isLoading}
                />
              </View>

              <View style={globalStyles.divider} />

              <View style={styles.inputWithIcon}>
                <Lock size={16} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Confirm Password"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                  editable={!isLoading}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: 12 }]}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={globalStyles.buttonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Billing Section */}
          <Text style={globalStyles.subheading}>Billing</Text>

          <TouchableOpacity
            style={[globalStyles.card, globalStyles.button, { marginBottom: 16 }]}
            onPress={handleNavigateToBilling}
          >
            <View style={styles.billingRow}>
              <CreditCard size={20} color={colors.primary} />
              <Text style={[globalStyles.bodyText, { flex: 1, marginLeft: 12 }]}>
                Billing Information
              </Text>
              <Text style={{ color: colors.textSecondary }}>→</Text>
            </View>
          </TouchableOpacity>

          {/* Delete Account Section */}
          <Text style={globalStyles.subheading}>Danger Zone</Text>

          <View style={globalStyles.card}>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonDanger]}
              onPress={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
            >
              <View style={styles.deleteButtonContent}>
                <Trash2 size={18} color="#fff" />
                <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>Delete Account</Text>
              </View>
            </TouchableOpacity>

            {showDeleteConfirm && (
              <>
                <View style={globalStyles.divider} />
                <Text style={[globalStyles.bodyText, { color: colors.danger, marginVertical: 12 }]}>
                  Warning: This action cannot be undone.
                </Text>
                <View style={styles.inputWithIcon}>
                  <Lock size={16} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Enter password to confirm"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry
                    value={deletePassword}
                    onChangeText={setDeletePassword}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={[globalStyles.button, { flex: 1, backgroundColor: colors.border }]}
                    onPress={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword('');
                    }}
                    disabled={isLoading}
                  >
                    <Text style={[globalStyles.buttonText, { color: colors.text }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[globalStyles.button, globalStyles.buttonDanger, { flex: 1, marginLeft: 8 }]}
                    onPress={handleDeleteAccount}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={globalStyles.buttonText}>Confirm Delete</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Footer spacing */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    )
  }

const styles = StyleSheet.create({
  themeCard: {
    marginBottom: 24,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputGroup: {
    gap: 0,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 8,
  },
  billingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  deleteButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonGroup: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
});