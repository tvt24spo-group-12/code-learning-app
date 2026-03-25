import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { ArrowLeft, CreditCard, Plus, Trash2, Eye, EyeOff } from 'lucide-react-native';
import { createGlobalStyles } from '../theme/globalStyles';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme/theme';

type PaymentMethod = {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  isDefault: boolean;
};

type NewCardData = {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
};

export default function BillingPage({ navigation }: any) {
    const { theme } = useTheme();
    const colors = getTheme(theme);
    const globalStyles = createGlobalStyles(theme);

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddCard, setShowAddCard] = useState(false);
    const [showCVV, setShowCVV] = useState(false);
    const [newCard, setNewCard] = useState<NewCardData>({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
    });

    // Load payment methods and invoices on mount
    useEffect(() => {
        loadBillingData();
    }, []);

    const loadBillingData = async () => {
        try {
            setIsLoading(true);
            // TODO: Fetch payment methods from Firebase
            // const methods = await fetchPaymentMethods();
            // setPaymentMethods(methods);

            // Placeholder data for UI
            setPaymentMethods([
                {
                    id: '1',
                    cardNumber: '•••• •••• •••• 4242',
                    cardHolder: 'John Doe',
                    expiryDate: '12/25',
                    isDefault: true,
                },
            ]);
        } catch (error) {
            Alert.alert('Virhe', 'Laskutietojen lataaminen epäonnistui');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 16);
        const formatted = cleaned.split('').reduce((acc, digit, index) => {
            if (index > 0 && index % 4 === 0) acc += ' ';
            return acc + digit;
        }, '');
        return formatted;
    };

    const formatExpiryDate = (value: string) => {
        const cleaned = value.replace(/\D/g, '').slice(0, 4);
        if (cleaned.length >= 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        };
        return cleaned;
    };

    const handleAddCard = async () => {
        if (!newCard.cardNumber || !newCard.cardHolder || !newCard.expiryDate || !newCard.cvv) {
            Alert.alert('Virhe', 'Täytä kaikki kentät');
            return;
        };

        try {
            setIsLoading(true);
            // TODO: Add payment method to Firebase
            // const result = await addPaymentMethod(newCard);

            Alert.alert('Onnistui', 'Maksutapa lisätty');
            setShowAddCard(false);
            setNewCard({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
            await loadBillingData();
        } catch (error) {
            Alert.alert('Virhe', 'Maksutavan lisääminen epäonnistui');
            console.error(error);
        } finally {
            setIsLoading(false);
        };
    };

    const handleDeleteCard = async (cardId: string) => {
        Alert.alert('Poista maksutapa', 'Oletko varma?', [
            { text: 'Peruuta', style: 'cancel' },
            {
                text: 'Poista',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setIsLoading(true);
                        // TODO: Delete payment method from Firebase
                        // await deletePaymentMethod(cardId);

                        Alert.alert('Onnistui', 'Maksutapa poistettu');
                        await loadBillingData();
                    } catch (error) {
                        Alert.alert('Virhe', 'Maksutavan poisto epäonnistui');
                    } finally {
                        setIsLoading(false);
                    }
                },
            },
        ]);
    };

    const handleSetDefault = async (cardId: string) => {
        try {
            setIsLoading(true);
            // TODO: Set default payment method in Firebase
            // await setDefaultPaymentMethod(cardId);

            Alert.alert('Onnistui', 'Oletusmaksutapa päivitetty');
            await loadBillingData();
        } catch (error) {
            Alert.alert('Virhe', 'Oletusmaksutavan asettaminen epäonnistui');
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <ScrollView style={[globalStyles.screenContainer]} showsVerticalScrollIndicator={false}>
      <View style={globalStyles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <View style={{ width: 24 }} />
        </View>

        {isLoading && paymentMethods.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Payment Methods Section */}
            <View>
              <View style={styles.sectionHeader}>
                <Text style={globalStyles.subheading}>Maksutapa</Text>
                <TouchableOpacity onPress={() => setShowAddCard(true)}>
                  <Plus size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {paymentMethods.length === 0 ? (
                <View style={[globalStyles.card, styles.emptyState]}>
                  <CreditCard size={32} color={colors.textSecondary} />
                  <Text style={[globalStyles.bodyText, { marginTop: 12, textAlign: 'center' }]}>
                    Ei tallennettuja maksutapoja. Lisää maksutapa painamalla plus-kuvaketta.
                  </Text>
                </View>
              ) : (
                paymentMethods.map((method) => (
                  <View key={method.id} style={[globalStyles.card, styles.cardItem]}>
                    <View style={styles.cardItemHeader}>
                      <View style={styles.cardInfo}>
                        <CreditCard size={20} color={colors.primary} />
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={globalStyles.subheading}>{method.cardNumber}</Text>
                          <Text style={[globalStyles.bodyText, { color: colors.textSecondary }]}>
                            {method.cardHolder}
                          </Text>
                          <Text style={[globalStyles.bodyText, { color: colors.textSecondary, fontSize: 12 }]}>
                            Vanhentuu: {method.expiryDate}
                          </Text>
                        </View>
                      </View>
                      {method.isDefault && (
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>
                            Oletus
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={globalStyles.divider} />

                    <View style={styles.cardActions}>
                      {!method.isDefault && (
                        <TouchableOpacity
                          style={[globalStyles.button, { flex: 1, backgroundColor: colors.surface }]}
                          onPress={() => handleSetDefault(method.id)}
                        >
                          <Text style={[globalStyles.buttonText, { color: colors.text }]}>
                            Set Default
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[globalStyles.button, globalStyles.buttonDanger, { flex: 1, marginLeft: method.isDefault ? 0 : 8 }]}
                        onPress={() => handleDeleteCard(method.id)}
                      >
                        <Trash2 size={16} color="#fff" />
                        <Text style={[globalStyles.buttonText, { marginLeft: 6 }]}>Poista</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Footer spacing */}
            <View style={{ height: 40 }} />
          </>
        )}
      </View>

      {/* Add Card Modal */}
      <Modal visible={showAddCard} animationType="slide" transparent={true}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={globalStyles.container}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowAddCard(false)}>
                  <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1 }} />
                <View style={{ width: 24 }} />
              </View>

              {/* Form */}
              <View style={globalStyles.card}>
                <Text style={globalStyles.label}>Kortin numero</Text>
                <TextInput
                  style={globalStyles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  value={newCard.cardNumber}
                  onChangeText={(text) =>
                    setNewCard((prev) => ({ ...prev, cardNumber: formatCardNumber(text) }))
                  }
                  editable={!isLoading}
                />

                <Text style={globalStyles.label}>Kortinhaltijan nimi</Text>
                <TextInput
                  style={globalStyles.input}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textSecondary}
                  value={newCard.cardHolder}
                  onChangeText={(text) =>
                    setNewCard((prev) => ({ ...prev, cardHolder: text }))
                  }
                  editable={!isLoading}
                />

                <View style={styles.Row}>
                  <View style={{ flex: 1 }}>
                    <Text style={globalStyles.label}>Voimassaolopäivä</Text>
                    <TextInput
                      style={globalStyles.input}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="number-pad"
                      value={newCard.expiryDate}
                      onChangeText={(text) =>
                        setNewCard((prev) => ({ ...prev, expiryDate: formatExpiryDate(text) }))
                      }
                      editable={!isLoading}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={globalStyles.label}>CVV</Text>
                    <View style={styles.cvvContainer}>
                      <TextInput
                        style={[globalStyles.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="123"
                        placeholderTextColor={colors.textSecondary}
                        secureTextEntry={!showCVV}
                        keyboardType="number-pad"
                        maxLength={4}
                        value={newCard.cvv}
                        onChangeText={(text) =>
                          setNewCard((prev) => ({ ...prev, cvv: text.replace(/\D/g, '') }))
                        }
                        editable={!isLoading}
                      />
                      <TouchableOpacity onPress={() => setShowCVV(!showCVV)}>
                        {showCVV ? (
                          <Eye size={18} color={colors.textSecondary} />
                        ) : (
                          <EyeOff size={18} color={colors.textSecondary} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: 12 }]}
                  onPress={handleAddCard}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={globalStyles.buttonText}>Lisää Kortti</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[globalStyles.button, { backgroundColor: colors.surface, marginTop: 8 }]}
                  onPress={() => setShowAddCard(false)}
                  disabled={isLoading}
                >
                  <Text style={[globalStyles.buttonText, { color: colors.text }]}>Peruuta</Text>
                </TouchableOpacity>
              </View>

              <View style={{ height: 40 }} />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );

};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  cardItem: {
    marginBottom: 12,
  },
  cardItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  Row: {
    flexDirection: 'row',
  },
  cvvContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});