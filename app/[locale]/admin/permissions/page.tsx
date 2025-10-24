"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { AdminLayout } from "@/components/AdminLayout";
import {
  getAllPermissions,
  createPermission,
  deletePermission,
} from "@/lib/role-permission-service";
import { Permission } from "@/lib/role-permission-service";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";

const PERMISSION_CATEGORIES = [
  "users",
  "roles",
  "permissions",
  "sessions",
  "settings",
  "content",
  "analytics",
  "system",
];

function PermissionsContent() {
  const router = useRouter();
  const { session } = useAuth();
  const { checkRole } = usePermission();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "system",
  });

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const permsData = await getAllPermissions();
        setPermissions(permsData);
      } catch (err) {
        setError("Failed to load permissions");
      } finally {
        setIsLoading(false);
      }
    };

    if (session.isAuthenticated) {
      loadPermissions();
    }
  }, [session.isAuthenticated]);

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const newPermission = await createPermission({
        name: formData.name,
        description: formData.description,
        category: formData.category,
      });

      setPermissions([...permissions, newPermission]);
      setFormData({ name: "", description: "", category: "system" });
      setOpenDialog(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create permission"
      );
    }
  };

  const handleDeletePermission = async (permId: string) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;

    try {
      await deletePermission(permId);
      setPermissions(permissions.filter((p) => p.id !== permId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete permission");
    }
  };

  // Group permissions by category
  const permissionsByCategory = PERMISSION_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = permissions.filter((p) => p.category === cat);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

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
              <h1 className="text-3xl font-bold">Permissions</h1>
              <p className="text-muted-foreground mt-1">
                Manage system permissions
              </p>
            </div>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Permission
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Permission</DialogTitle>
                <DialogDescription>
                  Add a new permission to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePermission} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="perm-name">Permission Name</Label>
                  <Input
                    id="perm-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., delete_users"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perm-desc">Description</Label>
                  <Textarea
                    id="perm-desc"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="What does this permission allow?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perm-category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger id="perm-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERMISSION_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full">
                  Create Permission
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

        {/* Permissions by Category */}
        {PERMISSION_CATEGORIES.map((category) => {
          const categoryPerms = permissionsByCategory[category];
          if (categoryPerms.length === 0) return null;

          return (
            <Card key={category} className="mb-6">
              <CardHeader>
                <CardTitle className="capitalize">{category}</CardTitle>
                <CardDescription>
                  {categoryPerms.length} permission
                  {categoryPerms.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryPerms.map((perm) => (
                        <TableRow key={perm.id}>
                          <TableCell className="font-mono text-sm">
                            {perm.name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {perm.description}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePermission(perm.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {permissions.length === 0 && (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No permissions found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function PermissionsPage() {
  return (
    <AdminLayout>
      <PermissionsContent />
    </AdminLayout>
  );
}
