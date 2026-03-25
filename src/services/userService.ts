import { 
  deleteUser as deleteAuthUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../../firebaseConfig";

export type UserProfile = {
  uid: string;
  email: string;
  username: string | null;
  hasUsername: boolean;
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
    // Handle specific errors
    if (error.code === "auth/wrong-password") {
      throw new Error("Incorrect password");
    }
    if (error.code === "auth/requires-recent-login") {
      throw new Error("Please log in again before deleting account");
    }
    throw new Error(`Failed to delete account: ${error.message}`);
  }
};