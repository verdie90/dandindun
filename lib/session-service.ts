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
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

const SESSIONS_COLLECTION = "sessions";

export interface Session {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

/**
 * Get all active sessions for a user
 */
export const getUserSessions = async (userId: string): Promise<Session[]> => {
  try {
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const q = query(
      sessionsRef,
      where("userId", "==", userId),
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Session, "id"> & {
        createdAt: string;
        expiresAt: string;
        lastActivityAt: string;
      };
      return {
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        createdAt: new Date(data.createdAt),
        expiresAt: new Date(data.expiresAt),
        lastActivityAt: new Date(data.lastActivityAt),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        isActive: data.isActive,
      };
    });
  } catch (error) {
    console.error("Failed to get user sessions:", error);
    return [];
  }
};

/**
 * Get session details
 */
export const getSession = async (sessionId: string): Promise<Session | null> => {
  try {
    const sessionDoc = await getDoc(doc(db, SESSIONS_COLLECTION, sessionId));
    if (!sessionDoc.exists()) {
      return null;
    }

    const data = sessionDoc.data() as Omit<Session, "id"> & {
      createdAt: string;
      expiresAt: string;
      lastActivityAt: string;
    };

    return {
      id: sessionDoc.id,
      userId: data.userId,
      userEmail: data.userEmail,
      userName: data.userName,
      createdAt: new Date(data.createdAt),
      expiresAt: new Date(data.expiresAt),
      lastActivityAt: new Date(data.lastActivityAt),
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      isActive: data.isActive,
    };
  } catch (error) {
    return null;
  }
};

/**
 * Update session last activity
 */
export const updateSessionActivity = async (
  sessionId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, SESSIONS_COLLECTION, sessionId), {
      lastActivityAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to update session activity:", error);
  }
};

/**
 * Terminate session
 */
export const terminateSession = async (sessionId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, SESSIONS_COLLECTION, sessionId), {
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error("Failed to terminate session");
  }
};

/**
 * Terminate all user sessions
 */
export const terminateAllUserSessions = async (
  userId: string,
  excludeSessionId?: string
): Promise<void> => {
  try {
    const sessions = await getUserSessions(userId);
    
    for (const session of sessions) {
      if (excludeSessionId && session.id === excludeSessionId) {
        continue;
      }
      await terminateSession(session.id);
    }
  } catch (error) {
    throw new Error("Failed to terminate user sessions");
  }
};

/**
 * Get all active sessions (admin only)
 */
export const getAllActiveSessions = async (): Promise<Session[]> => {
  try {
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const q = query(
      sessionsRef,
      where("isActive", "==", true),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Session, "id"> & {
        createdAt: string;
        expiresAt: string;
        lastActivityAt: string;
      };
      return {
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        createdAt: new Date(data.createdAt),
        expiresAt: new Date(data.expiresAt),
        lastActivityAt: new Date(data.lastActivityAt),
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        isActive: data.isActive,
      };
    });
  } catch (error) {
    console.error("Failed to get all sessions:", error);
    return [];
  }
};

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = async (): Promise<number> => {
  try {
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const q = query(
      sessionsRef,
      where("isActive", "==", true),
      where("expiresAt", "<", new Date().toISOString())
    );
    const snapshot = await getDocs(q);

    let count = 0;
    for (const doc of snapshot.docs) {
      await terminateSession(doc.id);
      count++;
    }

    return count;
  } catch (error) {
    console.error("Failed to cleanup expired sessions:", error);
    return 0;
  }
};

/**
 * Get session statistics
 */
export const getSessionStats = async () => {
  try {
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const activeSnapshot = await getDocs(
      query(sessionsRef, where("isActive", "==", true))
    );

    const expiredSnapshot = await getDocs(
      query(
        sessionsRef,
        where("isActive", "==", true),
        where("expiresAt", "<", new Date().toISOString())
      )
    );

    return {
      total: activeSnapshot.size,
      active: activeSnapshot.size - expiredSnapshot.size,
      expired: expiredSnapshot.size,
    };
  } catch (error) {
    console.error("Failed to get session stats:", error);
    return { total: 0, active: 0, expired: 0 };
  }
};
