import { doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Check if a username is already taken
 * @param username - Username to check
 * @returns true if username exists, false otherwise
 */
export const checkUsernameExists = async (
  username: string,
): Promise<boolean> => {
  const usernameDoc = await getDoc(
    doc(db, "usernames", username.toLowerCase()),
  );
  return usernameDoc.exists();
};

/**
 * Set a username for a user with validation and transaction safety
 * @param uid - User ID
 * @param email - User's email address
 * @param username - Desired username
 * @throws Error if username is invalid or already taken
 */
export const setUsername = async (
  uid: string,
  email: string | null,
  username: string,
): Promise<void> => {
  const normalizedUsername = username.toLowerCase().trim();

  // Validate username format
  if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
    throw new Error(
      "Username must be 3-20 characters, alphanumeric and underscores only",
    );
  }

  if (!email) {
    throw new Error("User email is required");
  }

  try {
    await runTransaction(db, async (transaction) => {
      // Check if username is already taken
      const usernameRef = doc(db, "usernames", normalizedUsername);
      const usernameDoc = await transaction.get(usernameRef);

      if (usernameDoc.exists()) {
        throw new Error("Username is already taken");
      }

      // Create username mapping
      transaction.set(usernameRef, {
        uid,
        email,
        username: normalizedUsername,
      });

      // Update user document
      const userRef = doc(db, "users", uid);
      transaction.update(userRef, {
        username: normalizedUsername,
      });
    });
  } catch (error: any) {
    throw new Error(error.message || "Failed to set username");
  }
};
