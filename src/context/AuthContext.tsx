import React, { createContext, useState, useContext, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  fetchUserProfile,
  getEmailFromUsername,
  createUserDocument,
  UserProfile,
} from "../services/userService";
import {
  checkUsernameExists,
  setUsername as setUsernameService,
} from "../services/usernameService";

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  login: (identifier: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkUsernameExists: (username: string) => Promise<boolean>;
  setUsername: (username: string) => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (identifier: string, password: string) => {
    let email = identifier;

    // If identifier doesn't contain @, treat it as username
    if (!identifier.includes("@")) {
      const emailFromUsername = await getEmailFromUsername(identifier);
      if (!emailFromUsername) {
        throw new Error("Username not found");
      }
      email = emailFromUsername;
    }

    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Create initial user document in Firestore
    await createUserDocument(userCredential.user.uid, email);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const checkUsername = async (username: string): Promise<boolean> => {
    return checkUsernameExists(username);
  };

  const setUsername = async (username: string) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    await setUsernameService(user.uid, user.email, username);

    // Update local profile
    const normalizedUsername = username.toLowerCase().trim();
    setUserProfile((prev) =>
      prev
        ? { ...prev, username: normalizedUsername, hasUsername: true }
        : null,
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        login,
        register,
        logout,
        checkUsernameExists: checkUsername,
        setUsername,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
