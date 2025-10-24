"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { usePermission } from "@/hooks/usePermission";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";

function RolesContent() {
  const router = useRouter();
  const { session } = useAuth();
  const { checkRole } = usePermission();

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const rolesData = await getAllRoles();
        const permsData = await getAllPermissions();
        setRoles(rolesData);
        setPermissions(permsData);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    if (session.isAuthenticated) {
      loadData();
    }
  }, [session.isAuthenticated]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const newRole = await createRole({
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      });

      setRoles([...roles, newRole]);
      setFormData({ name: "", description: "", permissions: [] });
      setOpenDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create role");
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      await deleteRole(roleId);
      setRoles(roles.filter((r) => r.id !== roleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete role");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
              <h1 className="text-3xl font-bold">Roles & Permissions</h1>
              <p className="text-muted-foreground mt-1">
                Manage system roles and their permissions
              </p>
            </div>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>
                  Create a new custom role and assign permissions
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRole} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role-desc">Description</Label>
                  <Textarea
                    id="role-desc"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="space-y-2">
                    {permissions.map((perm) => (
                      <label key={perm.id} className="flex items-center gap-2">
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
                        />
                        <span className="text-sm">{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Create Role
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>
              Total roles: {roles.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {roles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No roles found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>System</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {role.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((permId) => (
                              <Badge
                                key={permId}
                                variant="secondary"
                                className="text-xs"
                              >
                                {permissions.find((p) => p.id === permId)
                                  ?.name || permId}
                              </Badge>
                            ))}
                            {role.permissions.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{role.permissions.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {role.isSystemRole ? (
                            <Badge>System</Badge>
                          ) : (
                            <Badge variant="outline">Custom</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRole(role.id)}
                            disabled={role.isSystemRole}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions List */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Available Permissions</CardTitle>
            <CardDescription>
              Total permissions: {permissions.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {permissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No permissions found
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {permissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="border rounded-lg p-4 bg-card"
                  >
                    <h4 className="font-semibold text-sm">{perm.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {perm.description}
                    </p>
                    <Badge className="mt-2 text-xs">{perm.category}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RolesPage() {
  return (
    <AdminLayout>
      <RolesContent />
    </AdminLayout>
  );
}
