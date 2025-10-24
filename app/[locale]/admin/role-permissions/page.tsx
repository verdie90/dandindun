"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getAllRoles } from "@/lib/role-permission-service";
import {
  getPagePermissionsForRole,
  bulkSetPagePermissions,
  bulkSetOperationPermissions,
  getRolePermissionMatrix,
  CRUDOperation,
  PagePath,
  Role,
  RolePermissionMatrix,
} from "@/lib/role-permission-service";
import { Loader2 } from "lucide-react";

const PAGES: PagePath[] = [
  "/dashboard",
  "/admin",
  "/admin/users",
  "/admin/roles",
  "/admin/permissions",
  "/admin/settings",
  "/admin/logs",
  "/profile",
];

const CRUD_OPERATIONS: CRUDOperation[] = ["CREATE", "READ", "UPDATE", "DELETE"];

const OPERATIONS = [
  "deleteUser",
  "editProfile",
  "resetPassword",
  "banUser",
  "unbanUser",
  "changeRole",
  "exportData",
  "viewLogs",
];

function RolePermissionsContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [matrices, setMatrices] = useState<RolePermissionMatrix[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pagePerms, setPagePerms] = useState<Record<string, CRUDOperation[]>>({});
  const [operationPerms, setOperationPerms] = useState<Record<string, boolean>>({});

  // Load roles and permissions
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const allRoles = await getAllRoles();
        setRoles(allRoles);

        // Load permission matrices
        const allMatrices = await Promise.all(
          allRoles.map((role) => getRolePermissionMatrix(role.id))
        );
        setMatrices(allMatrices);
      } catch (error) {
        console.error("Failed to load permissions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleEditRole = async (role: Role) => {
    setSelectedRole(role);

    try {
      const pagePermsData = await getPagePermissionsForRole(role.id);
      const pagePermsMap: Record<string, CRUDOperation[]> = {};

      for (const perm of pagePermsData) {
        pagePermsMap[perm.pagePath] = perm.operations;
      }

      // Initialize all pages in map
      for (const page of PAGES) {
        if (!pagePermsMap[page]) {
          pagePermsMap[page] = [];
        }
      }

      setPagePerms(pagePermsMap);

      // Initialize operation permissions
      const opPerms: Record<string, boolean> = {};
      for (const op of OPERATIONS) {
        opPerms[op] = false;
      }
      setOperationPerms(opPerms);

      setEditDialogOpen(true);
    } catch (error) {
      console.error("Failed to load role permissions:", error);
    }
  };

  const handleToggleCRUD = (page: PagePath, operation: CRUDOperation) => {
    setPagePerms((prev) => {
      const current = prev[page] || [];
      const updated = current.includes(operation)
        ? current.filter((op) => op !== operation)
        : [...current, operation];

      return {
        ...prev,
        [page]: updated,
      };
    });
  };

  const handleToggleOperation = (operation: string) => {
    setOperationPerms((prev) => ({
      ...prev,
      [operation]: !prev[operation],
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);

      // Save page permissions
      const pagePermissions = PAGES.map((page) => ({
        pagePath: page,
        operations: pagePerms[page] || [],
      }));

      await bulkSetPagePermissions(selectedRole.id, pagePermissions);

      // Save operation permissions
      const operationPermissions = OPERATIONS.map((op) => ({
        operationName: op,
        allowed: operationPerms[op] || false,
      }));

      await bulkSetOperationPermissions(selectedRole.id, operationPermissions);

      // Reload data
      const allRoles = await getAllRoles();
      const allMatrices = await Promise.all(
        allRoles.map((role) => getRolePermissionMatrix(role.id))
      );
      setMatrices(allMatrices);

      setEditDialogOpen(false);
      setSelectedRole(null);
    } catch (error) {
      console.error("Failed to save permissions:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Role-Based Permissions</h1>
        <p className="text-muted-foreground">
          Manage permissions by role, page, and CRUD operations
        </p>
      </div>

      {/* Permission Matrix Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>CRUD operations per role and page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  {PAGES.map((page) => (
                    <TableHead key={page} className="text-xs text-center">
                      {page.split("/").pop()}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => {
                  const matrix = matrices.find((m) => m.roleId === role.id);
                  return (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        {role.name}
                        {role.isSystemRole && (
                          <Badge className="ml-2" variant="outline">
                            System
                          </Badge>
                        )}
                      </TableCell>
                      {PAGES.map((page) => {
                        const ops = matrix?.pagePermissions[page] || [];
                        return (
                          <TableCell key={page} className="text-xs text-center">
                            {ops.length > 0 ? (
                              <div className="flex flex-wrap gap-1 justify-center">
                                {ops.map((op) => (
                                  <Badge key={op} variant="secondary" className="text-xs">
                                    {op[0]}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditRole(role)}
                        >
                          Configure
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CRUD_OPERATIONS.map((op) => (
              <div key={op} className="flex items-center gap-2">
                <Badge variant="secondary">{op[0]}</Badge>
                <span className="text-sm">{op}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Role Permissions</DialogTitle>
            <DialogDescription>
              {selectedRole?.name} - Set page access and operations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Page-Based Permissions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Page Access (CRUD)</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {PAGES.map((page) => (
                  <div key={page} className="border rounded-lg p-4 bg-card">
                    <h4 className="font-medium mb-3 text-sm">{page}</h4>
                    <div className="grid grid-cols-4 gap-4">
                      {CRUD_OPERATIONS.map((op) => (
                        <label key={op} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={pagePerms[page]?.includes(op) || false}
                            onCheckedChange={() => handleToggleCRUD(page, op)}
                          />
                          <span className="text-sm">{op}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operation-Based Permissions */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Special Operations</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {OPERATIONS.map((op) => (
                  <label key={op} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={operationPerms[op] || false}
                      onCheckedChange={() => handleToggleOperation(op)}
                    />
                    <span className="text-sm">{op}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Permissions"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RolePermissionsPage() {
  return (
    <AdminLayout>
      <RolePermissionsContent />
    </AdminLayout>
  );
}
