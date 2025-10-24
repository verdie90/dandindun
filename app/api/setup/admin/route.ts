/**
 * API Route: Setup Admin User
 * 
 * POST /api/setup/admin
 * 
 * Creates an initial admin user with full access permissions
 * Should only be accessible when no admin exists (protection can be added)
 * 
 * Request body (optional):
 * {
 *   "email": "admin@example.com",
 *   "password": "Admin123!@#",
 *   "name": "System Administrator"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "userId": "user-id",
 *   "email": "admin@example.com",
 *   "name": "System Administrator",
 *   "permissions": { ... }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { hashPassword } from "@/lib/auth-service";

const USERS_COLLECTION = "users";
const ROLES_COLLECTION = "roles";
const PAGE_PERMISSIONS_COLLECTION = "page_permissions";
const OPERATION_PERMISSIONS_COLLECTION = "operation_permissions";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let adminData = {
      email: "admin@example.com",
      password: "Admin123!@#",
      name: "System Administrator",
    };

    try {
      const body = await request.json();
      if (body.email) adminData.email = body.email;
      if (body.password) adminData.password = body.password;
      if (body.name) adminData.name = body.name;
    } catch (e) {
      // Use defaults if no body
    }

    console.log("🚀 [SETUP] Starting Admin User Setup...");

    // Step 1: Check if admin already exists
    console.log("📋 [SETUP] Checking if admin exists...");
    const usersRef = collection(db, USERS_COLLECTION);
    const adminQuery = query(usersRef, where("role", "==", "admin"));
    const adminSnapshot = await getDocs(adminQuery);

    if (!adminSnapshot.empty) {
      console.log("⚠️  [SETUP] Admin user already exists");
      return NextResponse.json(
        {
          success: false,
          message: "Admin user already exists",
          existingAdminCount: adminSnapshot.size,
        },
        { status: 400 }
      );
    }

    console.log("✅ [SETUP] No admin exists. Proceeding...");

    // Step 2: Create admin role with permissions
    console.log("📋 [SETUP] Setting up admin role...");
    const adminRoleId = "admin";
    const adminRoleRef = doc(db, ROLES_COLLECTION, adminRoleId);

    await setDoc(
      adminRoleRef,
      {
        id: adminRoleId,
        name: "Administrator",
        description: "Full system access with all permissions",
        permissions: [
          "view_dashboard",
          "manage_users",
          "manage_roles",
          "manage_permissions",
          "manage_content",
          "moderate_content",
          "view_analytics",
          "manage_settings",
        ],
        isSystemRole: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log("✅ [SETUP] Admin role ready");

    // Step 3: Setup page permissions
    console.log("📋 [SETUP] Setting up page permissions...");
    const adminPages = [
      "/admin/users",
      "/admin/roles",
      "/admin/settings",
      "/admin/logs",
      "/admin/permissions",
      "/admin/role-permissions",
      "/dashboard",
      "/profile",
    ];

    const pagePerms = [];
    for (const pagePath of adminPages) {
      const permId = `${adminRoleId}_${pagePath.replace(/\//g, "_")}_page`;
      pagePerms.push({
        id: permId,
        roleId: adminRoleId,
        pagePath,
        operations: ["CREATE", "READ", "UPDATE", "DELETE"],
        canAccess: true,
      });
    }
    console.log(`✅ [SETUP] ${adminPages.length} page permissions configured`);

    // Step 4: Setup operation permissions
    console.log("📋 [SETUP] Setting up operation permissions...");
    const adminOperations = [
      "deleteUser",
      "banUser",
      "unbanUser",
      "resetPassword",
      "changeRole",
      "editProfile",
      "exportData",
      "viewLogs",
      "createRole",
      "editRole",
      "deleteRole",
      "createPermission",
      "editPermission",
      "deletePermission",
      "managePagePermissions",
      "manageOperationPermissions",
    ];

    const operationPerms = [];
    for (const operationName of adminOperations) {
      const permId = `${adminRoleId}_${operationName}_op`;
      operationPerms.push({
        id: permId,
        roleId: adminRoleId,
        operationName,
        allowed: true,
      });
    }
    console.log(`✅ [SETUP] ${adminOperations.length} operation permissions configured`);

    // Step 5: Create admin user with batch write
    console.log("📋 [SETUP] Creating admin user...");
    const userId = doc(collection(db, USERS_COLLECTION)).id;
    const timestamp = new Date().toISOString();
    const passwordHash = hashPassword(adminData.password);

    const batch = writeBatch(db);

    // User document
    batch.set(doc(db, USERS_COLLECTION, userId), {
      id: userId,
      email: adminData.email,
      name: adminData.name,
      role: "admin",
      isActive: true,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Password document
    batch.set(
      doc(db, `${USERS_COLLECTION}/${userId}/credentials`, "password"),
      {
        hash: passwordHash,
        updatedAt: timestamp,
      }
    );

    // Page permissions
    for (const perm of pagePerms) {
      batch.set(
        doc(db, PAGE_PERMISSIONS_COLLECTION, perm.id),
        {
          roleId: perm.roleId,
          pagePath: perm.pagePath,
          operations: perm.operations,
          canAccess: perm.canAccess,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        { merge: true }
      );
    }

    // Operation permissions
    for (const perm of operationPerms) {
      batch.set(
        doc(db, OPERATION_PERMISSIONS_COLLECTION, perm.id),
        {
          roleId: perm.roleId,
          operationName: perm.operationName,
          allowed: perm.allowed,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        { merge: true }
      );
    }

    await batch.commit();
    console.log("✅ [SETUP] Admin user created successfully");

    // Return success response
    console.log("📊 [SETUP] Setup Complete!");
    return NextResponse.json(
      {
        success: true,
        userId,
        email: adminData.email,
        name: adminData.name,
        role: "admin",
        permissions: {
          pages: adminPages,
          operations: adminOperations,
        },
        message: "Admin user created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ [SETUP] Setup failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        error: "Setup failed",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// GET request to check setup status
export async function GET() {
  try {
    console.log("🔍 [SETUP] Checking admin user status...");

    // Check if any admin exists
    const usersRef = collection(db, USERS_COLLECTION);
    const adminQuery = query(usersRef, where("role", "==", "admin"));
    const adminSnapshot = await getDocs(adminQuery);

    const adminExists = !adminSnapshot.empty;
    const adminCount = adminSnapshot.size;

    if (adminExists) {
      const admins = adminSnapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        name: doc.data().name,
        createdAt: doc.data().createdAt,
      }));

      return NextResponse.json({
        adminExists: true,
        adminCount,
        admins,
        status: "Admin user(s) already configured",
      });
    }

    return NextResponse.json({
      adminExists: false,
      adminCount: 0,
      status: "Ready for admin setup - POST to create admin user",
    });
  } catch (error) {
    console.error("❌ [SETUP] Check failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: "Check failed",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
