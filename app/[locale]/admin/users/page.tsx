"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { ProtectedPage } from "@/components/ProtectedPage";
import { AdminLayout } from "@/components/AdminLayout";
import {
  getAllUsersForAdmin,
  searchUsersForAdmin,
  updateUserRoleAsAdmin,
  deactivateUserAsAdmin,
  activateUserAsAdmin,
  banUserAsAdmin,
  unbanUserAsAdmin,
  deleteUserAsAdmin,
  getUserStatsForAdmin,
  getAvailableRoles,
  bulkUpdateUserRoles,
  bulkActivateUsers,
  bulkDeactivateUsers,
  bulkBanUsers,
  bulkDeleteUsers,
  UserManagementData,
} from "@/lib/admin-service";
import { UserRole } from "@/lib/types/auth";
import type { Role } from "@/lib/role-permission-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  MoreHorizontal,
  Search,
  AlertCircle,
  CheckCircle,
  Ban,
  Trash2,
  Eye,
  EyeOff,
  Plus,
} from "lucide-react";

function AdminUsersContent() {
  const router = useRouter();
  const { session } = useAuth();
  const { canCreate, canUpdate, canDelete, isOperationAllowed } = usePermission();
  const [users, setUsers] = useState<UserManagementData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserManagementData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, banned: 0, deleted: 0, byRole: { admin: 0, moderator: 0, user: 0 } });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "banned" | "deleted">("all");
  
  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserManagementData | null>(null);
  const [banReason, setBanReason] = useState("");
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [bulkActionDialog, setBulkActionDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<"role" | "activate" | "deactivate" | "ban" | "delete" | null>(null);
  const [bulkRoleTarget, setBulkRoleTarget] = useState<UserRole>("user");
  const [bulkReason, setBulkReason] = useState("");
  
  // New user dialog states
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as UserRole,
  });

  // Load users and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [allUsers, userStats, availableRoles] = await Promise.all([
          getAllUsersForAdmin(),
          getUserStatsForAdmin(),
          getAvailableRoles(),
        ]);
        setUsers(allUsers);
        setFilteredUsers(allUsers);
        setStats(userStats);
        setRoles(availableRoles);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session.isAuthenticated) {
      loadData();
    }
  }, [session.isAuthenticated]);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => (user.status || "active") === filterStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterStatus]);

  const handleRoleChange = async (userId: string, roleName: string) => {
    setProcessingId(userId);
    try {
      const toastId = toast.loading("Updating user role...");

      // Map role name to standard UserRole (user, moderator, admin)
      let userRole: UserRole = "user"; // default
      const lowerRoleName = roleName.toLowerCase();

      if (lowerRoleName.includes("admin")) {
        userRole = "admin";
      } else if (lowerRoleName.includes("moderator") || lowerRoleName.includes("mod")) {
        userRole = "moderator";
      } else {
        userRole = "user";
      }

      // Update role with audit log
      await updateUserRoleAsAdmin(
        session.user!.id, 
        userId, 
        userRole, 
        `Role changed to: ${roleName}`
      );
      
      // Update UI
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, role: userRole } : user
      );
      setUsers(updatedUsers);
      
      const user = updatedUsers.find(u => u.id === userId);
      toast.dismiss(toastId);
      toast.success(`${user?.name}'s role updated to ${roleName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update user role";
      toast.error(errorMessage);
      console.error("Failed to update user role:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeactivate = async (user: UserManagementData) => {
    setProcessingId(user.id);
    try {
      const toastId = toast.loading("Deactivating user...");
      
      await deactivateUserAsAdmin(session.user!.id, user.id);
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, status: "inactive", isActive: false } : u
        )
      );
      
      toast.dismiss(toastId);
      toast.success(`${user.name} has been deactivated`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to deactivate user";
      toast.error(errorMessage);
      console.error("Failed to deactivate user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleActivate = async (user: UserManagementData) => {
    setProcessingId(user.id);
    try {
      const toastId = toast.loading("Activating user...");
      
      await activateUserAsAdmin(session.user!.id, user.id);
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, status: "active", isActive: true } : u
        )
      );
      
      toast.dismiss(toastId);
      toast.success(`${user.name} has been activated`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to activate user";
      toast.error(errorMessage);
      console.error("Failed to activate user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleBan = async (user: UserManagementData) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmBan = async () => {
    if (!selectedUser) return;
    setProcessingId(selectedUser.id);
    try {
      const toastId = toast.loading("Banning user...");
      
      await banUserAsAdmin(session.user!.id, selectedUser.id, banReason);
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "banned", isActive: false } : u
        )
      );
      
      toast.dismiss(toastId);
      toast.success(`${selectedUser.name} has been banned${banReason ? " - " + banReason : ""}`);
      
      setDeleteDialogOpen(false);
      setBanReason("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to ban user";
      toast.error(errorMessage);
      console.error("Failed to ban user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnban = async (user: UserManagementData) => {
    setProcessingId(user.id);
    try {
      const toastId = toast.loading("Unbanning user...");
      
      await unbanUserAsAdmin(session.user!.id, user.id);
      setUsers(
        users.map((u) =>
          u.id === user.id ? { ...u, status: "active", isActive: true } : u
        )
      );
      
      toast.dismiss(toastId);
      toast.success(`${user.name} has been unbanned`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to unban user";
      toast.error(errorMessage);
      console.error("Failed to unban user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (user: UserManagementData) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setProcessingId(selectedUser.id);
    try {
      const toastId = toast.loading("Deleting user...");
      
      await deleteUserAsAdmin(session.user!.id, selectedUser.id, "Deleted by admin");
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, status: "deleted", isActive: false } : u
        )
      );
      
      toast.dismiss(toastId);
      toast.success(`${selectedUser.name} has been deleted`);
      
      setDeleteDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
      toast.error(errorMessage);
      console.error("Failed to delete user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleEditUser = (user: UserManagementData) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email });
    setEditDialogOpen(true);
  };

  const confirmEditUser = async () => {
    if (!selectedUser || !editForm.name.trim() || !editForm.email.trim()) return;
    setProcessingId(selectedUser.id);
    try {
      const toastId = toast.loading("Updating user info...");

      // Call updateUserInfo from user-service
      const { updateUserInfo } = await import("@/lib/user-service");
      await updateUserInfo(selectedUser.id, {
        name: editForm.name,
        email: editForm.email,
      });

      // Log admin action
      const { logAdminAction } = await import("@/lib/admin-service");
      await logAdminAction(
        session.user!.id,
        "UPDATE_ROLE", // Using as generic update action
        selectedUser.id,
        editForm.email,
        { oldName: selectedUser.name, newName: editForm.name, oldEmail: selectedUser.email, newEmail: editForm.email },
        "User info edited"
      );

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? { ...u, name: editForm.name, email: editForm.email }
            : u
        )
      );
      
      toast.dismiss(toastId);
      toast.success(`${editForm.name}'s information updated successfully`);
      
      setEditDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to edit user";
      toast.error(errorMessage);
      console.error("Failed to edit user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangePassword = (user: UserManagementData) => {
    setSelectedUser(user);
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setPasswordDialogOpen(true);
  };

  const confirmChangePassword = async () => {
    if (!selectedUser || !passwordForm.newPassword.trim()) return;

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setProcessingId(selectedUser.id);
    try {
      const toastId = toast.loading("Changing password...");

      // Update password
      const { setDoc, doc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      const { hashPassword } = await import("@/lib/auth-service");

      const passwordHash = hashPassword(passwordForm.newPassword);
      await setDoc(
        doc(db, `users/${selectedUser.id}/credentials`, "password"),
        {
          hash: passwordHash,
          updatedAt: new Date().toISOString(),
        }
      );

      // Log admin action
      const { logAdminAction } = await import("@/lib/admin-service");
      await logAdminAction(
        session.user!.id,
        "UPDATE_ROLE",
        selectedUser.id,
        selectedUser.email,
        { action: "password_reset" },
        "Password changed by admin"
      );

      toast.dismiss(toastId);
      toast.success(`${selectedUser.name}'s password has been changed`);

      setPasswordDialogOpen(false);
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      toast.error(errorMessage);
      console.error("Failed to change password:", error);
    } finally {
      setProcessingId(null);
    }
  };

  // Bulk Operations
  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleBulkAction = async (action: typeof bulkAction) => {
    if (selectedUserIds.size === 0) return;
    setBulkAction(action);
    setBulkActionDialog(true);
  };

  const confirmBulkAction = async () => {
    const userIds = Array.from(selectedUserIds);
    if (userIds.length === 0) return;

    try {
      let result;
      const { bulkUpdateUserRoles, bulkActivateUsers, bulkDeactivateUsers, bulkBanUsers, bulkDeleteUsers } = await import("@/lib/admin-service");

      switch (bulkAction) {
        case "role":
          result = await bulkUpdateUserRoles(session.user!.id, userIds, bulkRoleTarget, bulkReason);
          break;
        case "activate":
          result = await bulkActivateUsers(session.user!.id, userIds, bulkReason);
          break;
        case "deactivate":
          result = await bulkDeactivateUsers(session.user!.id, userIds, bulkReason);
          break;
        case "ban":
          result = await bulkBanUsers(session.user!.id, userIds, bulkReason);
          break;
        case "delete":
          result = await bulkDeleteUsers(session.user!.id, userIds, bulkReason);
          break;
      }

      if (result && result.success > 0) {
        // Reload users
        const allUsers = await getAllUsersForAdmin();
        setUsers(allUsers);
        setSelectedUserIds(new Set());
        toast.success(`Bulk action completed: ${result.success} user(s) updated`);
      }

      // Show result
      if (result) {
        if (result.failed > 0) {
          toast.error(`${result.failed} user(s) failed to update`);
        }
      }

      setBulkActionDialog(false);
      setBulkReason("");
    } catch (error) {
      console.error("Bulk action failed:", error);
      toast.error("Failed to complete bulk action");
    }
  };

  const handleCreateNewUser = async () => {
    // Validate form
    if (!newUserForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!newUserForm.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!newUserForm.password) {
      toast.error("Password is required");
      return;
    }
    if (newUserForm.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newUserForm.password !== newUserForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setProcessingId("new-user");
    try {
      const toastId = toast.loading("Creating new user...");

      // Import register function
      const { registerUser } = await import("@/lib/auth-service");
      
      // Create the user
      const newUser = await registerUser({
        name: newUserForm.name,
        email: newUserForm.email,
        password: newUserForm.password,
      });

      // Update user role if not default
      if (newUserForm.role !== "user") {
        await updateUserRoleAsAdmin(
          session.user!.id,
          newUser.id,
          newUserForm.role,
          `User created with role: ${newUserForm.role}`
        );
      }

      // Reload users
      const allUsers = await getAllUsersForAdmin();
      const stats = await getUserStatsForAdmin();
      setUsers(allUsers);
      setStats(stats);

      toast.dismiss(toastId);
      toast.success(`User "${newUserForm.name}" created successfully`);

      // Reset form and close dialog
      setNewUserForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
      });
      setNewUserDialogOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create user";
      toast.error(errorMessage);
      console.error("Failed to create user:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status || "active") {
      case "active":
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-700"><EyeOff className="w-3 h-3 mr-1" /> Inactive</Badge>;
      case "banned":
        return <Badge className="bg-red-100 text-red-700"><Ban className="w-3 h-3 mr-1" /> Banned</Badge>;
      case "deleted":
        return <Badge className="bg-slate-100 text-slate-700"><Trash2 className="w-3 h-3 mr-1" /> Deleted</Badge>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roleColors: Record<UserRole, string> = {
      super_admin: "bg-purple-100 text-purple-700",
      admin: "bg-red-100 text-red-700",
      moderator: "bg-amber-100 text-amber-700",
      user: "bg-blue-100 text-blue-700",
    };
    // Find role details from firestore roles
    const roleDetails = roles.find(r => r.name.toLowerCase() === role.toLowerCase());
    return (
      <Badge className={roleColors[role]} title={roleDetails?.description}>
        {roleDetails?.name || role.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage all users, roles, and account statuses
            </p>
          </div>
          {canCreate("/admin/users") && (
            <Button
              onClick={() => setNewUserDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New User
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Banned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.banned}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byRole.admin}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedUserIds.size > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-900">
                  {selectedUserIds.size} user{selectedUserIds.size !== 1 ? 's' : ''} selected
                </span>
                {canUpdate("/admin/users") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600"
                    onClick={() => handleBulkAction("role")}
                  >
                    Change Role
                  </Button>
                )}
                {canUpdate("/admin/users") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600"
                    onClick={() => handleBulkAction("activate")}
                  >
                    Activate
                  </Button>
                )}
                {canUpdate("/admin/users") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-amber-600"
                    onClick={() => handleBulkAction("deactivate")}
                  >
                    Deactivate
                  </Button>
                )}
                {isOperationAllowed("banUser") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => handleBulkAction("ban")}
                  >
                    Ban
                  </Button>
                )}
                {canDelete("/admin/users") && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    onClick={() => handleBulkAction("delete")}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedUserIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Showing {filteredUsers.length} of {users.length} users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0}
                          onChange={toggleSelectAll}
                          className="cursor-pointer"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className={selectedUserIds.has(user.id) ? "bg-blue-50" : ""}>
                        <TableCell className="w-8">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.has(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                            className="cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(roleId) =>
                              handleRoleChange(user.id, roleId)
                            }
                            disabled={processingId === user.id || roles.length === 0}
                          >
                            <SelectTrigger className="w-40">
                              {processingId === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <SelectValue placeholder="Select role" />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {roles.length > 0 ? (
                                roles.map((role) => (
                                  <SelectItem key={role.id} value={role.name.toLowerCase()}>
                                    {role.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="user" disabled>
                                  No roles available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.createdAt?.toLocaleDateString?.() || "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={processingId === user.id}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canUpdate("/admin/users") && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleEditUser(user)}
                                    className="text-blue-600"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleChangePassword(user)}
                                    className="text-blue-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Change Password
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {user.status === "active" && (
                                <>
                                  {canUpdate("/admin/users") && (
                                    <DropdownMenuItem
                                      onClick={() => handleDeactivate(user)}
                                      className="text-amber-600"
                                    >
                                      <EyeOff className="w-4 h-4 mr-2" />
                                      Deactivate
                                    </DropdownMenuItem>
                                  )}
                                  {isOperationAllowed("banUser") && (
                                    <DropdownMenuItem
                                      onClick={() => handleBan(user)}
                                      className="text-red-600"
                                    >
                                      <Ban className="w-4 h-4 mr-2" />
                                      Ban
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              {user.status === "inactive" && (
                                <>
                                  {canUpdate("/admin/users") && (
                                    <DropdownMenuItem
                                      onClick={() => handleActivate(user)}
                                      className="text-green-600"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Activate
                                    </DropdownMenuItem>
                                  )}
                                  {isOperationAllowed("banUser") && (
                                    <DropdownMenuItem
                                      onClick={() => handleBan(user)}
                                      className="text-red-600"
                                    >
                                      <Ban className="w-4 h-4 mr-2" />
                                      Ban
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              {user.status === "banned" && (
                                <DropdownMenuItem
                                  onClick={() => handleUnban(user)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Unban
                                </DropdownMenuItem>
                              )}
                              {(canUpdate("/admin/users") || isOperationAllowed("banUser")) && <DropdownMenuSeparator />}
                              {canDelete("/admin/users") && (
                                <DropdownMenuItem
                                  onClick={() => handleDelete(user)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Dialogs */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.status === "banned"
                ? `Unban ${selectedUser?.name}?`
                : selectedUser?.status === "active"
                ? `Ban ${selectedUser?.name}? Enter reason (optional):`
                : `Delete ${selectedUser?.name}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedUser?.status === "active" && (
            <div className="py-4">
              <Input
                placeholder="Ban reason (optional)"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          )}
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              if (selectedUser?.status === "banned") {
                await handleUnban(selectedUser);
              } else if (selectedUser?.status === "active") {
                await confirmBan();
              } else {
                await confirmDelete();
              }
            }}
            className={
              selectedUser?.status === "banned" || selectedUser?.status === "deleted"
                ? ""
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {processingId ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Email address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmEditUser}
              disabled={processingId === selectedUser?.id}
            >
              {processingId === selectedUser?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                placeholder="Confirm password"
              />
            </div>
            {passwordForm.newPassword &&
              passwordForm.confirmPassword &&
              passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}
            {passwordForm.newPassword &&
              passwordForm.newPassword.length < 6 && (
                <p className="text-sm text-red-600">
                  Password must be at least 6 characters
                </p>
              )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmChangePassword}
              disabled={
                processingId === selectedUser?.id ||
                !passwordForm.newPassword ||
                passwordForm.newPassword !== passwordForm.confirmPassword ||
                passwordForm.newPassword.length < 6
              }
            >
              {processingId === selectedUser?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New User Dialog */}
      <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-name">Full Name</Label>
              <Input
                id="new-name"
                placeholder="Enter full name"
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-email">Email Address</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="Enter email address"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter password (min. 6 characters)"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="new-confirm-password">Confirm Password</Label>
              <Input
                id="new-confirm-password"
                type="password"
                placeholder="Confirm password"
                value={newUserForm.confirmPassword}
                onChange={(e) => setNewUserForm({ ...newUserForm, confirmPassword: e.target.value })}
              />
            </div>
            {newUserForm.password && newUserForm.confirmPassword && newUserForm.password !== newUserForm.confirmPassword && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">Passwords do not match</p>
            )}
            {newUserForm.password && newUserForm.password.length < 6 && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">Password must be at least 6 characters</p>
            )}
            <div>
              <Label htmlFor="new-role">Role</Label>
              <Select value={newUserForm.role} onValueChange={(value: any) => setNewUserForm({ ...newUserForm, role: value })}>
                <SelectTrigger id="new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateNewUser}
              disabled={
                processingId === "new-user" ||
                !newUserForm.name.trim() ||
                !newUserForm.email.trim() ||
                !newUserForm.password ||
                newUserForm.password !== newUserForm.confirmPassword ||
                newUserForm.password.length < 6
              }
            >
              {processingId === "new-user" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <AlertDialog open={bulkActionDialog} onOpenChange={setBulkActionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to perform an action on {selectedUserIds.size} user{selectedUserIds.size !== 1 ? 's' : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {bulkAction === "role" && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="bulk-role">Select New Role</Label>
                <Select value={bulkRoleTarget} onValueChange={(value: any) => setBulkRoleTarget(value)}>
                  <SelectTrigger id="bulk-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bulk-reason">Reason (optional)</Label>
                <Input
                  id="bulk-reason"
                  placeholder="Why are you making this change?"
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                />
              </div>
            </div>
          )}

          {(bulkAction === "deactivate" || bulkAction === "ban" || bulkAction === "delete") && (
            <div className="py-4">
              <Label htmlFor="bulk-reason-alt">Reason (optional)</Label>
              <Input
                id="bulk-reason-alt"
                placeholder="Why are you taking this action?"
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
              />
            </div>
          )}

          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmBulkAction}
            className={
              bulkAction === "delete" ? "bg-red-600 hover:bg-red-700" : ""
            }
          >
            Confirm {bulkAction}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <ProtectedPage 
      requiredPage="/admin/users"
      requiredOperations={["READ"]}
    >
      <AdminLayout>
        <AdminUsersContent />
      </AdminLayout>
    </ProtectedPage>
  );
}
