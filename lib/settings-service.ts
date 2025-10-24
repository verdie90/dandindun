import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

const SETTINGS_COLLECTION = "app_settings";
const LANGUAGES_COLLECTION = "languages";
const USER_PREFERENCES_COLLECTION = "user_preferences";

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
  isDefault: boolean;
  flag?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  logo?: string;
  favicon?: string;
  supportEmail: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  maxSessionDuration: number; // in days
  passwordMinLength: number;
  requireEmailVerification: boolean;
  allowRegistration: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  userId: string;
  language: string;
  theme: "light" | "dark" | "system";
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
  updatedAt: Date;
}

/**
 * Get app settings
 */
export const getAppSettings = async (): Promise<AppSettings | null> => {
  try {
    const settingsDoc = await getDoc(doc(db, SETTINGS_COLLECTION, "default"));
    if (!settingsDoc.exists()) {
      return null;
    }

    const data = settingsDoc.data() as Omit<AppSettings, "id"> & {
      createdAt: string;
      updatedAt: string;
    };

    return {
      id: settingsDoc.id,
      siteName: data.siteName,
      siteDescription: data.siteDescription,
      siteUrl: data.siteUrl,
      logo: data.logo,
      favicon: data.favicon,
      supportEmail: data.supportEmail,
      maintenanceMode: data.maintenanceMode,
      maintenanceMessage: data.maintenanceMessage,
      maxSessionDuration: data.maxSessionDuration,
      passwordMinLength: data.passwordMinLength,
      requireEmailVerification: data.requireEmailVerification,
      allowRegistration: data.allowRegistration,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  } catch (error) {
    return null;
  }
};

/**
 * Update app settings
 */
export const updateAppSettings = async (
  settingsData: Partial<Omit<AppSettings, "id" | "createdAt">>
): Promise<void> => {
  try {
    await setDoc(
      doc(db, SETTINGS_COLLECTION, "default"),
      {
        ...settingsData,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    throw new Error("Failed to update settings");
  }
};

/**
 * Initialize default app settings
 */
export const initializeAppSettings = async (): Promise<void> => {
  try {
    const existing = await getAppSettings();
    if (existing) return;

    const defaultSettings: Omit<AppSettings, "id" | "createdAt" | "updatedAt"> =
      {
        siteName: "Dandindun",
        siteDescription: "Multi-language Application with RBAC",
        siteUrl: "https://dandindun.local",
        supportEmail: "support@dandindun.local",
        maintenanceMode: false,
        maxSessionDuration: 7,
        passwordMinLength: 6,
        requireEmailVerification: false,
        allowRegistration: true,
      };

    await setDoc(doc(db, SETTINGS_COLLECTION, "default"), {
      ...defaultSettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to initialize app settings:", error);
  }
};

/**
 * Get all languages
 */
export const getAllLanguages = async (): Promise<Language[]> => {
  try {
    const langRef = collection(db, LANGUAGES_COLLECTION);
    const snapshot = await getDocs(langRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Language, "id"> & {
        createdAt: string;
        updatedAt: string;
      };
      return {
        id: doc.id,
        code: data.code,
        name: data.name,
        nativeName: data.nativeName,
        isActive: data.isActive,
        isDefault: data.isDefault,
        flag: data.flag,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  } catch (error) {
    return [];
  }
};

/**
 * Get active languages
 */
export const getActiveLanguages = async (): Promise<Language[]> => {
  try {
    const langRef = collection(db, LANGUAGES_COLLECTION);
    const q = query(langRef, where("isActive", "==", true));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Language, "id"> & {
        createdAt: string;
        updatedAt: string;
      };
      return {
        id: doc.id,
        code: data.code,
        name: data.name,
        nativeName: data.nativeName,
        isActive: data.isActive,
        isDefault: data.isDefault,
        flag: data.flag,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    });
  } catch (error) {
    return [];
  }
};

/**
 * Get default language
 */
export const getDefaultLanguage = async (): Promise<Language | null> => {
  try {
    const langRef = collection(db, LANGUAGES_COLLECTION);
    const q = query(langRef, where("isDefault", "==", true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data() as Omit<Language, "id"> & {
      createdAt: string;
      updatedAt: string;
    };

    return {
      id: doc.id,
      code: data.code,
      name: data.name,
      nativeName: data.nativeName,
      isActive: data.isActive,
      isDefault: data.isDefault,
      flag: data.flag,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  } catch (error) {
    return null;
  }
};

/**
 * Add language
 */
export const addLanguage = async (languageData: {
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
  isDefault?: boolean;
  flag?: string;
}): Promise<Language> => {
  try {
    // If setting as default, unset other defaults
    if (languageData.isDefault) {
      const langRef = collection(db, LANGUAGES_COLLECTION);
      const q = query(langRef, where("isDefault", "==", true));
      const snapshot = await getDocs(q);
      for (const doc of snapshot.docs) {
        await updateDoc(doc.ref, { isDefault: false });
      }
    }

    const langId = doc(collection(db, LANGUAGES_COLLECTION)).id;
    const language: Language = {
      id: langId,
      code: languageData.code,
      name: languageData.name,
      nativeName: languageData.nativeName,
      isActive: languageData.isActive,
      isDefault: languageData.isDefault || false,
      flag: languageData.flag,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, LANGUAGES_COLLECTION, langId), {
      ...language,
      createdAt: language.createdAt.toISOString(),
      updatedAt: language.updatedAt.toISOString(),
    });

    return language;
  } catch (error) {
    throw new Error("Failed to add language");
  }
};

/**
 * Update language
 */
export const updateLanguage = async (
  languageId: string,
  languageData: Partial<Omit<Language, "id" | "createdAt">>
): Promise<void> => {
  try {
    if (languageData.isDefault) {
      const langRef = collection(db, LANGUAGES_COLLECTION);
      const q = query(langRef, where("isDefault", "==", true));
      const snapshot = await getDocs(q);
      for (const doc of snapshot.docs) {
        if (doc.id !== languageId) {
          await updateDoc(doc.ref, { isDefault: false });
        }
      }
    }

    await updateDoc(doc(db, LANGUAGES_COLLECTION, languageId), {
      ...languageData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error("Failed to update language");
  }
};

/**
 * Delete language
 */
export const deleteLanguage = async (languageId: string): Promise<void> => {
  try {
    const langDoc = await getDoc(doc(db, LANGUAGES_COLLECTION, languageId));
    if (!langDoc.exists()) {
      throw new Error("Language not found");
    }

    const langData = langDoc.data() as Language;
    if (langData.isDefault) {
      throw new Error("Cannot delete the default language");
    }

    await updateDoc(doc(db, LANGUAGES_COLLECTION, languageId), {
      isActive: false,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error("Failed to delete language");
  }
};

/**
 * Set default language
 */
export const setDefaultLanguage = async (languageId: string): Promise<void> => {
  try {
    // Unset all other defaults
    const langRef = collection(db, LANGUAGES_COLLECTION);
    const q = query(langRef, where("isDefault", "==", true));
    const snapshot = await getDocs(q);
    for (const doc of snapshot.docs) {
      if (doc.id !== languageId) {
        await updateDoc(doc.ref, { isDefault: false });
      }
    }

    // Set new default
    await updateDoc(doc(db, LANGUAGES_COLLECTION, languageId), {
      isDefault: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error("Failed to set default language");
  }
};

/**
 * Get user preferences
 */
export const getUserPreferences = async (
  userId: string
): Promise<UserPreferences | null> => {
  try {
    const prefDoc = await getDoc(
      doc(db, USER_PREFERENCES_COLLECTION, userId)
    );
    if (!prefDoc.exists()) {
      return null;
    }

    const data = prefDoc.data() as Omit<UserPreferences, "updatedAt"> & {
      updatedAt: string;
    };

    return {
      ...data,
      updatedAt: new Date(data.updatedAt),
    };
  } catch (error) {
    return null;
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<Omit<UserPreferences, "userId">>
): Promise<void> => {
  try {
    await setDoc(
      doc(db, USER_PREFERENCES_COLLECTION, userId),
      {
        userId,
        ...preferences,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    throw new Error("Failed to update preferences");
  }
};

/**
 * Initialize default languages
 */
export const initializeDefaultLanguages = async (): Promise<void> => {
  try {
    const existing = await getAllLanguages();
    if (existing.length > 0) return;

    const defaultLanguages = [
      {
        code: "en",
        name: "English",
        nativeName: "English",
        isActive: true,
        isDefault: true,
        flag: "🇬🇧",
      },
      {
        code: "id",
        name: "Indonesian",
        nativeName: "Bahasa Indonesia",
        isActive: true,
        isDefault: false,
        flag: "🇮🇩",
      },
    ];

    for (const lang of defaultLanguages) {
      await addLanguage(lang);
    }
  } catch (error) {
    console.error("Failed to initialize languages:", error);
  }
};
