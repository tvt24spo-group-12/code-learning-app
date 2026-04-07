import { 
  deleteUser as deleteAuthUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc, writeBatch, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export type UserProfile = {
  uid: string;
  email: string;
  username: string | null;
  hasUsername: boolean;
  createdAt?: any;
};

export type PaymentMethod = {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  isDefault: boolean;
  createdAt: Date;
};

/**
 * Fetch user profile from Firestore
 * @param uid - User ID
 * @returns User profile or null if not found
 */
export const fetchUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid,
        email: data.email || "",
        username: data.username || null,
        hasUsername: !!data.username,
        createdAt: data.createdAt || null,
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * Get email address associated with a username
 * @param username - Username to lookup
 * @returns Email address or null if username not found
 */
export const getEmailFromUsername = async (
  username: string,
): Promise<string | null> => {
  try {
    const usernameDoc = await getDoc(
      doc(db, "usernames", username.toLowerCase()),
    );

    if (usernameDoc.exists()) {
      return usernameDoc.data().email;
    }

    return null;
  } catch (error) {
    console.error("Error fetching username:", error);
    return null;
  }
};

/**
 * Create a new user document in Firestore
 * @param uid - User ID
 * @param email - User's email address
 */
export const createUserDocument = async (
  uid: string,
  email: string,
): Promise<void> => {
  await setDoc(doc(db, "users", uid), {
    uid,
    email,
    username: null,
    createdAt: new Date(),
  });
};

/**
 * Delete user account and all associated data
 * @param user - Current Firebase user
 * @param password - User's password for re-authentication
 */
export const deleteUserAccount = async (
  user: User,
  password: string,
): Promise<void> => {
  if (!user.email) {
    throw new Error("User does not have an email");
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const username = userDoc.data()?.username;

    const batch = writeBatch(db);

    batch.delete(doc(db, "users", user.uid));

    if (username) {
      batch.delete(doc(db, "usernames", username.toLowerCase()));
    }

    // Delete related subcollections
    /* const coursesSnapshot = await getDocs(
      query(collection(db, "users", user.uid, "courses"))
    );
    coursesSnapshot.forEach((doc) => batch.delete(doc.ref)); */

    await batch.commit();
    await deleteAuthUser(user);
  } catch (error: any) {
    throw new Error(`Failed to delete account: ${error.message}`);
  }
};

/**
 * Fetch payment methods for a user
 * @param uid - User ID
 * @returns Array of payment methods or empty array
 */
export const fetchPaymentMethods = async (uid: string): Promise<PaymentMethod[]> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const paymentMethods = userDoc.data().paymentMethods || [];
      return paymentMethods.map((pm: any) => ({
        ...pm,
        createdAt: pm.createdAt?.toDate?.() || new Date(),
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return [];
  }
};

/**
 * Add a new payment method to user's document
 * @param uid - User ID
 * @param cardData - Card information (cardNumber, cardHolder, expiryDate)
 * @param isDefault - Whether this should be the default payment method
 */
export const addPaymentMethod = async (
  uid: string,
  cardData: { cardNumber: string; cardHolder: string; expiryDate: string },
  isDefault: boolean = false
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }

    // Get last 4 digits and mask the card number
    const last4 = cardData.cardNumber.replace(/\s/g, "").slice(-4);
    const maskedCardNumber = `•••• •••• •••• ${last4}`;

    const paymentMethodId = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newPaymentMethod: PaymentMethod = {
      id: paymentMethodId,
      cardNumber: maskedCardNumber,
      cardHolder: cardData.cardHolder,
      expiryDate: cardData.expiryDate,
      isDefault,
      createdAt: new Date(),
    };

    if (isDefault) {
      const currentMethods = userDoc.data().paymentMethods || [];
      const updatedMethods = currentMethods.map((pm: any) => ({
        ...pm,
        isDefault: false,
      }));
      await updateDoc(userRef, { paymentMethods: updatedMethods });
    }

    await updateDoc(userRef, {
      paymentMethods: arrayUnion(newPaymentMethod),
    });
  } catch (error: any) {
    throw new Error(`Failed to add payment method: ${error.message}`);
  }
};

/**
 * Delete a payment method from user's document
 * @param uid - User ID
 * @param paymentMethodId - ID of the payment method to delete
 */
export const deletePaymentMethod = async (
  uid: string,
  paymentMethodId: string
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }

    const paymentMethods = userDoc.data().paymentMethods || [];
    const methodToDelete = paymentMethods.find((pm: any) => pm.id === paymentMethodId);

    if (!methodToDelete) {
      throw new Error("Payment method not found");
    }

    await updateDoc(userRef, {
      paymentMethods: arrayRemove(methodToDelete),
    });
  } catch (error: any) {
    throw new Error(`Failed to delete payment method: ${error.message}`);
  }
};

/**
 * Set a payment method as default
 * @param uid - User ID
 * @param paymentMethodId - ID of the payment method to set as default
 */
export const setDefaultPaymentMethod = async (
  uid: string,
  paymentMethodId: string
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error("User document not found");
    }

    const paymentMethods = userDoc.data().paymentMethods || [];
    const updatedMethods = paymentMethods.map((pm: any) => ({
      ...pm,
      isDefault: pm.id === paymentMethodId,
    }));

    await updateDoc(userRef, { paymentMethods: updatedMethods });
  } catch (error: any) {
    throw new Error(`Failed to set default payment method: ${error.message}`);
  }
};