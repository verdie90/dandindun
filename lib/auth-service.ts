import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  User,
  UserRole,
  LoginCredentials,
  RegisterCredentials,
  ROLE_PERMISSIONS,
} from "./types/auth";
import crypto from "crypto";

const USERS_COLLECTION = "users";
const SESSIONS_COLLECTION = "sessions";

/**
 * Hash password using SHA-256
 */
export const hashPassword = (password: string): string => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

/**
 * Verify password
 */
export const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

/**
 * Register a new user
 */
export const registerUser = async (
  credentials: RegisterCredentials
): Promise<User> => {
  // Check if user already exists
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where("email", "==", credentials.email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error("User already exists with this email");
  }

  const userId = doc(collection(db, USERS_COLLECTION)).id;
  const user: User = {
    id: userId,
    email: credentials.email,
    name: credentials.name,
    role: "user", // Default role
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Store user data and hashed password separately for security
  await setDoc(doc(db, USERS_COLLECTION, userId), {
    ...user,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Store password hash
  await setDoc(doc(db, `${USERS_COLLECTION}/${userId}/credentials`, "password"), {
    hash: hashPassword(credentials.password),
    updatedAt: new Date().toISOString(),
  });

  return user;
};

/**
 * Login user
 */
export const loginUser = async (
  credentials: LoginCredentials
): Promise<User & { sessionId: string }> => {
  // Find user by email
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where("email", "==", credentials.email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("User not found");
  }

  const userDoc = querySnapshot.docs[0];
  const userData = userDoc.data() as Omit<User, "id"> & {
    createdAt: string;
    updatedAt: string;
  };
  const userId = userDoc.id;

  // Verify password
  try {
    const passwordDoc = await getDoc(
      doc(db, `${USERS_COLLECTION}/${userId}/credentials`, "password")
    );
    if (!passwordDoc.exists()) {
      throw new Error("Invalid credentials");
    }

    const passwordData = passwordDoc.data();
    if (!verifyPassword(credentials.password, passwordData.hash)) {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    throw new Error("Invalid credentials");
  }

  // Create session
  const sessionId = crypto.randomBytes(32).toString("hex");
  await setDoc(doc(db, SESSIONS_COLLECTION, sessionId), {
    userId,
    userEmail: credentials.email,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  });

  return {
    id: userId,
    email: userData.email,
    name: userData.name,
    role: userData.role as UserRole,
    createdAt: new Date(userData.createdAt),
    updatedAt: new Date(userData.updatedAt),
    sessionId,
  };
};

/**
 * Get user by session ID
 */
export const getUserBySession = async (
  sessionId: string
): Promise<User | null> => {
  try {
    const sessionDoc = await getDoc(doc(db, SESSIONS_COLLECTION, sessionId));

    if (!sessionDoc.exists()) {
      return null;
    }

    const sessionData = sessionDoc.data();

    // Check if session is expired
    if (new Date(sessionData.expiresAt) < new Date()) {
      // Delete expired session
      await deleteDoc(doc(db, SESSIONS_COLLECTION, sessionId));
      return null;
    }

    // Get user data
    const userDoc = await getDoc(
      doc(db, USERS_COLLECTION, sessionData.userId)
    );
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data() as Omit<User, "id"> & {
      createdAt: string;
      updatedAt: string;
    };

    return {
      id: sessionData.userId,
      email: userData.email,
      name: userData.name,
      role: userData.role as UserRole,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
    };
  } catch (error) {
    return null;
  }
};

/**
 * Logout user
 */
export const logoutUser = async (sessionId: string): Promise<void> => {
  await deleteDoc(doc(db, SESSIONS_COLLECTION, sessionId));
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data() as Omit<User, "id"> & {
      createdAt: string;
      updatedAt: string;
    };

    return {
      id: userId,
      email: userData.email,
      name: userData.name,
      role: userData.role as UserRole,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
    };
  } catch (error) {
    return null;
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (
  userId: string,
  newRole: UserRole
): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    role: newRole,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, USERS_COLLECTION);
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<User, "id"> & {
      createdAt: string;
      updatedAt: string;
    };
    return {
      id: doc.id,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  });
};

/**
 * Check if user has permission
 */
export const hasPermission = (role: UserRole, permission: keyof typeof ROLE_PERMISSIONS["admin"]): boolean => {
  return ROLE_PERMISSIONS[role][permission];
};
