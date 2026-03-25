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
import { Moon, Mail, User, Lock, CreditCard, Trash2, LogOut } from 'lucide-react-native';
import { createGlobalStyles } from '../theme/globalStyles';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

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
  const { logout, deleteAccount, userProfile, isLoading: authLoading } = useAuth();

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

  // Load user data from firestore when component mounts
  React.useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        email: userProfile.email || '',
        username: userProfile.username || '',
      }));
    }
  }, [userProfile]);

  // Placeholder functions for calls
  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      //TODO: Implement call to update profile
      // await updateUserProfile(formData);
      Alert.alert('Onnistui', 'Profiili päivitetty onnistuneesti!');
    } catch (error) {
      Alert.alert('Virhe', 'Profiilin päivittäminen epäonnistui. Yritä uudestaan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Virhe', 'Uudet salasanat eivät täsmää');
      return;
    }

    try {
      setIsLoading(true);
      //TODO: Implement call to change password
      // await changeUserPassword(formData.currentPassword, formData.newPassword);
      Alert.alert('Onnistui', 'Salasana vaihdettu onnistuneesti!');
    } catch (error) {
      Alert.alert('Virhe', 'Salasanan vaihtaminen epäonnistui. Varmista, että nykyinen salasana on oikein ja yritä uudestaan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Virhe', 'Vahvista tilin poisto syöttämällä salasana');
      return;
    }

    try {
      setIsLoading(true);

      await deleteAccount(deletePassword);

      Alert.alert('Käyttäjä poistettu', 'Tilisi on poistettu onnistuneesti.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      const errorMessage = error.message || 'Tilin poisto epäonnistui. Varmista, että salasana on oikein ja yritä uudestaan.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeletePassword('');
    }
  };

  const handleNavigateToBilling = () => {
    navigation.navigate('Billing');
  };

  // Show loading indicator while auth state is being determined
  if (authLoading) {
    return (
      <View style={[globalStyles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }
  
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
          <Text style={globalStyles.subheading}>Käyttäjä Tiedot</Text>
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
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Päivitä Profiili</Text>
                )}
              </TouchableOpacity>
            </View>

          {/* Password Section */}
          <Text style={globalStyles.subheading}>Turvallisuus</Text>

          <View style={globalStyles.card}>
            <View style={styles.inputGroup}>
              <View style={styles.inputWithIcon}>
                <Lock size={16} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Nykyinen Salasana"
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
                  placeholder="Uusi Salasana"
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
                  placeholder="Vahvista Salasana"
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
                <Text style={globalStyles.buttonText}>Vaihda Salasana</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Billing Section */}
          <Text style={globalStyles.subheading}>Maksaminen</Text>

          <TouchableOpacity
            style={[globalStyles.card, globalStyles.button, { marginBottom: 16 }]}
            onPress={handleNavigateToBilling}
          >
            <View style={styles.billingRow}>
              <CreditCard size={20} color={colors.primary} />
              <Text style={[globalStyles.bodyText, { flex: 1, marginLeft: 12 }]}>
                Laskutustiedot
              </Text>
              <Text style={{ color: colors.textSecondary }}>→</Text>
            </View>
          </TouchableOpacity>


          {/* Logout Section */}
          <Text style={globalStyles.subheading}>Istunto</Text>

          <View style={globalStyles.card}>
            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonPrimary]}
              onPress={logout}
              disabled={isLoading}
            >
              <View style={styles.deleteButtonContent}>
                <LogOut size={18} color="#fff" />
                <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>Kirjaudu ulos</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Delete Account Section */}
          <Text style={globalStyles.subheading}>Vaaravyöhyke</Text>

          <View style={globalStyles.card}>

            <TouchableOpacity
              style={[globalStyles.button, globalStyles.buttonDanger]}
              onPress={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
            >
              <View style={styles.deleteButtonContent}>
                <Trash2 size={18} color="#fff" />
                <Text style={[globalStyles.buttonText, { marginLeft: 8 }]}>Poista Käyttäjä</Text>
              </View>
            </TouchableOpacity>

            {showDeleteConfirm && (
              <>
                <View style={globalStyles.divider} />
                <Text style={[globalStyles.bodyText, { color: colors.danger, marginVertical: 12 }]}>
                  Varoitus: Tämä toiminto poistaa tilisi pysyvästi. Syötä salasana vahvistaaksesi tilin poiston.
                </Text>
                <View style={styles.inputWithIcon}>
                  <Lock size={16} color={colors.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Salasana"
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
                    <Text style={[globalStyles.buttonText, { color: colors.text }]}>Peruuta</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[globalStyles.button, globalStyles.buttonDanger, { flex: 1, marginLeft: 8 }]}
                    onPress={handleDeleteAccount}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={globalStyles.buttonText}>Vahvista</Text>
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
