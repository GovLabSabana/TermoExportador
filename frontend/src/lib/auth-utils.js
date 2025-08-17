// Server-side auth session - only use this in server components
export async function getServerAuthSession() {
  // This function should only be called from server components
  // It will be properly imported there
  throw new Error(
    "getServerAuthSession should only be used in server components"
  );
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export class AuthError extends Error {
  constructor(message, type = "AuthError") {
    super(message);
    this.name = type;
  }
}

export const authErrorMessages = {
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  USER_EXISTS: "User already exists",
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Validation error. Please check your input.",
};
