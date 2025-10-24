import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { User, UserRole } from "./types/auth";

const USERS_COLLECTION = "users";
const USER_PROFILES_COLLECTION = "user_profiles";
const ACTIVITY_LOGS_COLLECTION = "activity_logs";

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      } as User;
    });
  } catch (error) {
    console.error("Failed to get all users:", error);
    return [];
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId: string) => {
  try {
    const profileDoc = await getDoc(
      doc(db, USER_PROFILES_COLLECTION, userId)
    );
    if (!profileDoc.exists()) {
      return null;
    }
    return profileDoc.data();
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  profileData: {
    bio?: string;
    avatar?: string;
    phone?: string;
    location?: string;
    website?: string;
    preferences?: Record<string, any>;
  }
) => {
  try {
    await setDoc(
      doc(db, USER_PROFILES_COLLECTION, userId),
      {
        ...profileData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    throw new Error("Failed to update profile");
  }
};

/**
 * Update user basic info
 */
export const updateUserInfo = async (
  userId: string,
  data: {
    name?: string;
    email?: string;
  }
) => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error("Failed to update user info");
  }
};

/**
 * Change user password
 */
export const changeUserPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  try {
    // Verify old password
    const passwordDoc = await getDoc(
      doc(db, `${USERS_COLLECTION}/${userId}/credentials`, "password")
    );

    if (!passwordDoc.exists()) {
      throw new Error("Password not found");
    }

    const { verifyPassword, hashPassword } = await import("./auth-service");
    const passwordData = passwordDoc.data();

    if (!verifyPassword(oldPassword, passwordData.hash)) {
      throw new Error("Incorrect current password");
    }

    // Update password
    await setDoc(
      doc(db, `${USERS_COLLECTION}/${userId}/credentials`, "password"),
      {
        hash: hashPassword(newPassword),
        updatedAt: new Date().toISOString(),
      }
    );

    // Log activity
    await logActivity(userId, "PASSWORD_CHANGED", "User changed password");
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to change password");
  }
};

/**
 * Deactivate user account
 */
export const deactivateUserAccount = async (userId: string) => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      status: "inactive",
      updatedAt: new Date().toISOString(),
    });

    await logActivity(userId, "ACCOUNT_DEACTIVATED", "User deactivated account");
  } catch (error) {
    throw new Error("Failed to deactivate account");
  }
};

/**
 * Delete user account (soft delete)
 */
export const deleteUserAccount = async (userId: string) => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      status: "deleted",
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await logActivity(userId, "ACCOUNT_DELETED", "User deleted account");
  } catch (error) {
    throw new Error("Failed to delete account");
  }
};

/**
 * Log user activity
 */
export const logActivity = async (
  userId: string,
  action: string,
  details: string
) => {
  try {
    await setDoc(doc(collection(db, ACTIVITY_LOGS_COLLECTION)), {
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: typeof window !== "undefined" ? "client" : "server",
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

/**
 * Get user activity logs
 */
export const getUserActivityLogs = async (userId: string, limit = 50) => {
  try {
    const logsRef = collection(db, ACTIVITY_LOGS_COLLECTION);
    const q = query(
      logsRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Failed to get activity logs:", error);
    return [];
  }
};

/**
 * Search users
 */
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where("name", ">=", searchTerm));
    const snapshot = await getDocs(q);
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
  } catch (error) {
    console.error("Failed to search users:", error);
    return [];
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(usersRef);

    const roles: Record<UserRole, number> = {
      admin: 0,
      moderator: 0,
      user: 0,
    };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.role in roles) {
        roles[data.role as UserRole]++;
      }
    });

    return {
      total: snapshot.size,
      ...roles,
    };
  } catch (error) {
    console.error("Failed to get user stats:", error);
    return { total: 0, admin: 0, moderator: 0, user: 0 };
  }
};
