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
  profilePicture?: string; 
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
         profilePicture: data.profilePicture || null,
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

/**
 * Change user's password
 * @param user - Current Firebase user
 * @param currentPassword - Current password for re-authentication
 * @param newPassword - New password
 */
export const changePassword = async (
  user: User,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  if (!user.email) {
    throw new Error("User does not have an email");
  }

  try {
    // Re-authenticate user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password in Firebase Auth
    const { updatePassword } = await import("firebase/auth");
    await updatePassword(user, newPassword);

  } catch (error: any) {
    throw new Error(`Tarkista salasana ja yritä uudestaan: ${error.message}`);
  }
};

/**
 * Update user profile (email and/or username) in Firestore
 * @param uid - User ID
 * @param email - User's email
 * @param profileData - Object with email and/or username to update
 * @param oldUsername - Previous username (required if username is being updated)
 */
export const updateUserProfile = async (
  uid: string,
  email: string,
  profileData: { email?: string; username?: string },
  oldUsername: string | null = null,
): Promise<void> => {
  try {
    if (profileData.username) {
      // Handle username update with usernames collection mapping
      await updateUsername(uid, email, oldUsername, profileData.username);
    } else if (profileData.email) {
      // Only update email if username isn't being changed
      await updateDoc(doc(db, "users", uid), {
        email: profileData.email,
      });
    }
  } catch (error: any) {
    throw new Error(`Profiilin päivittäminen epäonnistui: ${error.message}`);
  }
};

/**
 * Update user's username and update the usernames collection mapping
 * @param uid - User ID
 * @param email - User's email
 * @param oldUsername - Previous username (to delete from usernames collection)
 * @param newUsername - New username
 */
export const updateUsername = async (
  uid: string,
  email: string | null,
  oldUsername: string | null,
  newUsername: string,
): Promise<void> => {
  const normalizedNewUsername = newUsername.trim();

  // Validate username format
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(normalizedNewUsername)) {
    throw new Error("Käyttäjätunnus voi sisältää vain kirjaimia, numeroita ja alaviivoja (3-20 merkkiä)");
  }

  if (!email) {
    throw new Error("Sähköposti on vaadittu käyttäjätunnuksen päivittämiseen");
  }

  try {
    const { runTransaction } = await import("firebase/firestore");
    
    await runTransaction(db, async (transaction) => {
      // Check if new username is already taken
      const newUsernameRef = doc(db, "usernames", normalizedNewUsername);
      const newUsernameDoc = await transaction.get(newUsernameRef);

      if (newUsernameDoc.exists()) {
        throw new Error("Käyttäjätunnus on jo käytössä");
      }

      // Delete old username mapping if it exists
      if (oldUsername) {
        const oldUsernameRef = doc(db, "usernames", oldUsername.toLowerCase());
        transaction.delete(oldUsernameRef);
      }

      // Create new username mapping
      transaction.set(newUsernameRef, {
        uid,
        email,
        username: normalizedNewUsername,
      });

      // Update user document
      const userRef = doc(db, "users", uid);
      transaction.update(userRef, {
        username: normalizedNewUsername,
      });
    });
  } catch (error: any) {
    throw new Error(error.message || "Failed to update username");
  }
};

//profiilikuva päivitys
export const updateProfilePictureURL = async (uid: string, url: string) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    profilePicture: url
  });
};