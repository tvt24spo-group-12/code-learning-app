/**
 * Firebase Auth Error Codes and User-Friendly Messages
 */

export const AUTH_ERROR_CODES = {
  // Login errors
  LOGIN: {
    "auth/invalid-email": "Invalid email format",
    "auth/user-not-found": "No account found with this email or username",
    "auth/wrong-password": "Incorrect password",
    "auth/user-disabled": "Account has been disabled",
    "auth/too-many-requests": "Too many attempts. Please try again later",
    "auth/network-request-failed": "Network error. Check your connection",
    "auth/invalid-credential":
      "Invalid credentials. Please check your email and password",
  },

  // Registration errors
  REGISTER: {
    "auth/email-already-in-use": "An account with this email already exists",
    "auth/invalid-email": "Invalid email format",
    "auth/weak-password": "Password is too weak. Use at least 6 characters",
    "auth/network-request-failed": "Network error. Check your connection",
  },

  // Generic error messages
  GENERIC: {
    LOGIN: "Login failed. Please try again",
    REGISTER: "Registration failed. Please try again",
  },
};

/**
 * Format Firebase error code into user-friendly message
 * @param errorCode - The Firebase error code
 * @param type - The type of operation (login or register)
 * @returns User-friendly error message
 */
export const formatAuthError = (
  errorCode: string | undefined,
  type: "login" | "register",
): string => {
  if (!errorCode) {
    return AUTH_ERROR_CODES.GENERIC[type.toUpperCase() as "LOGIN" | "REGISTER"];
  }

  const errorMap =
    type === "login" ? AUTH_ERROR_CODES.LOGIN : AUTH_ERROR_CODES.REGISTER;

  return (
    errorMap[errorCode as keyof typeof errorMap] ||
    AUTH_ERROR_CODES.GENERIC[type.toUpperCase() as "LOGIN" | "REGISTER"]
  );
};

/**
 * Extract error code from Firebase error object
 * @param error - The error object from Firebase
 * @returns Error code string or undefined
 */
export const getErrorCode = (error: any): string | undefined => {
  if (error?.code) {
    return error.code;
  }
  if (typeof error?.message === "string") {
    // Try to extract code from message if not available directly
    const codeMatch = error.message.match(/\(auth\/[\w-]+\)/);
    if (codeMatch) {
      return codeMatch[0].replace(/[()]/g, "");
    }
  }
  return undefined;
};
