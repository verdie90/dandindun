"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { ProtectedPage } from "@/components/ProtectedPage";
import { AdminLayout } from "@/components/AdminLayout";
import {
  getAllRoles,
  getAllPermissions,
  getRolePermissions,
  createRole,
  updateRole,
  deleteRole,
} from "@/lib/role-permission-service";
import { Role, Permission } from "@/lib/role-permission-service";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Edit2, 
  Search,
  MoreHorizontal,
  Copy,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function RolesContent() {
  const router = useRouter();
  const { session } = useAuth();
  const { checkRole, canCreate, canUpdate, canDelete } = usePermission();

  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const rolesData = await getAllRoles();
        const permsData = await getAllPermissions();
        setRoles(rolesData);
        setFilteredRoles(rolesData);
        setPermissions(permsData);
        setError(null);
      } catch (err) {
        setError("Failed to load data");
        console.error("Load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (session.isAuthenticated) {
      loadData();
    }
  }, [session.isAuthenticated]);

  // Search filter
  useEffect(() => {
    const filtered = roles.filter((role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoles(filtered);
  }, [searchTerm, roles]);

  // Clear messages
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const resetForm = () => {
    setFormData({ name: "", description: "", permissions: [] });
    setEditingRole(null);
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.name.trim()) {
        setError("Role name is required");
        return;
      }

      if (!formData.description.trim()) {
        setError("Description is required");
        return;
      }

      if (editingRole) {
        // Update existing role
        if (!canUpdate("/admin/roles")) {
          setError("You don't have permission to update roles");
          return;
        }

        await updateRole(editingRole.id, {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });

        const updatedRoles = roles.map((r) =>
          r.id === editingRole.id
            ? {
                ...r,
                name: formData.name,
                description: formData.description,
                permissions: formData.permissions,
              }
            : r
        );
        setRoles(updatedRoles);
        setSuccess(`Role "${formData.name}" updated successfully`);
      } else {
        // Create new role
        if (!canCreate("/admin/roles")) {
          setError("You don't have permission to create roles");
          return;
        }

        const newRole = await createRole({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });

        setRoles([...roles, newRole]);
        setSuccess(`Role "${formData.name}" created successfully`);
      }

      handleCloseDialog();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Operation failed";
      setError(errorMsg);
      console.error("Form error:", err);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteTarget) return;

    try {
      if (!canDelete("/admin/roles")) {
        setError("You don't have permission to delete roles");
        return;
      }

      const roleToDelete = roles.find((r) => r.id === deleteTarget);
      const roleName = roleToDelete?.name || "Unknown";

      await deleteRole(deleteTarget);
      setRoles(roles.filter((r) => r.id !== deleteTarget));
      setSuccess(`Role "${roleName}" deleted successfully`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to delete role";
      setError(errorMsg);
      console.error("Delete error:", err);
    } finally {
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    }
  };

  const handleCopyRoleData = async (role: Role) => {
    try {
      const data = JSON.stringify(role, null, 2);
      await navigator.clipboard.writeText(data);
      setSuccess("Role data copied to clipboard");
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-2" />
          <p className="text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Roles Management</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Create and manage system roles with custom permissions
              </p>
            </div>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button
                className="gap-2 w-full sm:w-auto"
                disabled={!canCreate("/admin/roles")}
                title={
                  !canCreate("/admin/roles")
                    ? "You don't have permission to create roles"
                    : ""
                }
              >
                <Plus className="h-4 w-4" />
                New Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? `Edit Role: ${editingRole.name}` : "Create New Role"}
                </DialogTitle>
                <DialogDescription>
                  {editingRole
                    ? "Update role details and permissions"
                    : "Add a new role to the system"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitForm} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="role-name">Role Name *</Label>
                  <Input
                    id="role-name"
                    placeholder="e.g., Content Manager"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={editingRole?.isSystemRole}
                  />
                  {editingRole?.isSystemRole && (
                    <p className="text-xs text-muted-foreground">
                      System roles cannot be renamed
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="role-desc">Description *</Label>
                  <Textarea
                    id="role-desc"
                    placeholder="Describe the purpose of this role"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    disabled={editingRole?.isSystemRole}
                    rows={3}
                  />
                  {editingRole?.isSystemRole && (
                    <p className="text-xs text-muted-foreground">
                      System roles cannot be modified
                    </p>
                  )}
                </div>

                {/* Permissions */}
                <div className="space-y-3">
                  <Label>Permissions ({formData.permissions.length})</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4 bg-muted/50">
                    {permissions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No permissions available
                      </p>
                    ) : (
                      permissions.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-start gap-3 p-2 rounded hover:bg-background cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  permissions: [
                                    ...formData.permissions,
                                    perm.id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  permissions: formData.permissions.filter(
                                    (p) => p !== perm.id
                                  ),
                                });
                              }
                            }}
                            disabled={editingRole?.isSystemRole}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{perm.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {perm.description}
                            </p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={
                      !canCreate("/admin/roles") || 
                      editingRole?.isSystemRole ||
                      !formData.name.trim() ||
                      !formData.description.trim()
                    }
                  >
                    {editingRole ? "Update Role" : "Create Role"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Messages */}
        {error && (
          <Alert variant="destructive" className="mb-4 animate-in fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 animate-in fade-in">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search roles by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Roles ({filteredRoles.length}/{roles.length})
            </CardTitle>
            <CardDescription>
              Total roles in system: {roles.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRoles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {roles.length === 0 ? (
                  <>
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No roles found. Create your first role!</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No roles match your search criteria</p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead className="text-right">Permissions</TableHead>
                      <TableHead className="text-right">Type</TableHead>
                      <TableHead className="text-right w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoles.map((role) => (
                      <TableRow key={role.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div>
                            <p>{role.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">
                              {role.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs">
                          {role.description}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">
                            {role.permissions.length}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {role.isSystemRole ? (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              System
                            </Badge>
                          ) : (
                            <Badge variant="outline">Custom</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleOpenDialog(role)}
                                disabled={!canUpdate("/admin/roles") || role.isSystemRole}
                                className="gap-2"
                              >
                                <Edit2 className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCopyRoleData(role)}
                                className="gap-2"
                              >
                                <Copy className="h-4 w-4" />
                                Copy
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setDeleteTarget(role.id);
                                  setShowDeleteDialog(true);
                                }}
                                disabled={!canDelete("/admin/roles") || role.isSystemRole}
                                className="gap-2 text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
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

        {/* Permissions Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Available Permissions Reference</CardTitle>
            <CardDescription>
              All permissions available for role assignment ({permissions.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {permissions.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No permissions available
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm">{perm.name}</h4>
                      <Badge className="text-xs">{perm.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {perm.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                      ID: {perm.id}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
              Any users with this role will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteRole}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Role
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function RolesPage() {
  return (
    <ProtectedPage 
      requiredPage="/admin/roles"
      requiredOperations={["READ"]}
    >
      <AdminLayout>
        <RolesContent />
      </AdminLayout>
    </ProtectedPage>
  );
}
