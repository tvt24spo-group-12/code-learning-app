import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

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
  uid: string
): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid,
        email: data.email || '',
        username: data.username || null,
        hasUsername: !!data.username,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Get email address associated with a username
 * @param username - Username to lookup
 * @returns Email address or null if username not found
 */
export const getEmailFromUsername = async (
  username: string
): Promise<string | null> => {
  try {
    const usernameDoc = await getDoc(
      doc(db, 'usernames', username.toLowerCase())
    );

    if (usernameDoc.exists()) {
      return usernameDoc.data().email;
    }

    return null;
  } catch (error) {
    console.error('Error fetching username:', error);
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
  email: string
): Promise<void> => {
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    username: null,
    createdAt: new Date(),
  });
};
