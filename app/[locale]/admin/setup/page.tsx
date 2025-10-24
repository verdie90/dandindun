"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Copy } from "lucide-react";

interface AdminSetupResponse {
  success: boolean;
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  permissions?: {
    pages: string[];
    operations: string[];
  };
  message?: string;
  error?: string;
  details?: string;
  adminExists?: boolean;
  adminCount?: number;
  admins?: Array<{
    id: string;
    email: string;
    name: string;
    createdAt: string;
  }>;
  status?: string;
}

export default function AdminSetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "checking" | "checked" | "creating" | "created" | "error"
  >("idle");
  const [adminExists, setAdminExists] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState<AdminSetupResponse | null>(null);

  const [formData, setFormData] = useState({
    email: "admin@example.com",
    password: "Admin123!@#",
    name: "System Administrator",
  });

  const checkAdminStatus = async () => {
    try {
      setStatus("checking");
      setError("");

      const response = await fetch("/api/setup/admin");
      const data: AdminSetupResponse = await response.json();

      if (data.adminExists) {
        setAdminExists(true);
        setError(`Admin user(s) already exist (${data.adminCount}). ${data.status}`);
      } else {
        setStatus("checked");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Failed to check status: ${errorMsg}`);
      setStatus("error");
    }
  };

  const createAdmin = async () => {
    try {
      setStatus("creating");
      setError("");
      setSuccess(false);

      // Validate form
      if (!formData.email || !formData.password || !formData.name) {
        throw new Error("All fields are required");
      }

      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const response = await fetch("/api/setup/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: AdminSetupResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to create admin");
      }

      setCreatedAdmin(data);
      setSuccess(true);
      setStatus("created");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setStatus("error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-slate-700 bg-slate-800">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-white">🔐 Admin User Setup</CardTitle>
          <CardDescription className="text-slate-300">
            Create the initial admin user for full system access
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Check Status Button */}
          {status === "idle" && (
            <Button
              onClick={checkAdminStatus}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Check Admin Status
            </Button>
          )}

          {/* Checking Status */}
          {status === "checking" && (
            <div className="flex items-center justify-center space-x-2 text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking admin status...</span>
            </div>
          )}

          {/* Admin Already Exists */}
          {adminExists && (
            <Alert className="border-amber-600 bg-amber-950">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-200 ml-2">
                Admin user(s) already exist in the system.
                <button
                  onClick={() => router.push("/admin/users")}
                  className="ml-2 underline hover:no-underline"
                >
                  Go to Users Management →
                </button>
              </AlertDescription>
            </Alert>
          )}

          {/* Setup Form */}
          {status === "checked" && !success && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-200">Admin Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1.5 bg-slate-700 border-slate-600 text-white"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-200">Admin Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5 bg-slate-700 border-slate-600 text-white"
                    placeholder="System Administrator"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-200">Password</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1.5 bg-slate-700 border-slate-600 text-white"
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-slate-400 mt-1">Min. 6 characters recommended</p>
                </div>
              </div>

              {error && (
                <Alert className="border-red-600 bg-red-950">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-200 ml-2">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button
                  onClick={createAdmin}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {status === "checked" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Admin...
                    </>
                  ) : (
                    "Create Admin User"
                  )}
                </Button>

                <Button
                  onClick={() => setStatus("idle")}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
                  size="lg"
                >
                  Back
                </Button>
              </div>
            </>
          )}

          {/* Success Message */}
          {success && createdAdmin && (
            <>
              <Alert className="border-green-600 bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-200 ml-2">
                  ✅ Admin user created successfully!
                </AlertDescription>
              </Alert>

              {/* Credentials Summary */}
              <div className="space-y-4 bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Credentials</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <div className="flex items-center justify-between bg-slate-800 rounded p-2 mt-1">
                        <code className="text-sm text-green-400">{createdAdmin.email}</code>
                        <button
                          onClick={() => copyToClipboard(createdAdmin.email || "")}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">User ID</p>
                      <div className="flex items-center justify-between bg-slate-800 rounded p-2 mt-1">
                        <code className="text-sm text-blue-400 font-mono">{createdAdmin.userId}</code>
                        <button
                          onClick={() => copyToClipboard(createdAdmin.userId || "")}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Role</p>
                      <div className="bg-slate-800 rounded p-2 mt-1">
                        <span className="text-sm text-yellow-400 font-semibold">
                          {createdAdmin.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions Summary */}
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase mb-2">Access Level</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-slate-500">Pages ({createdAdmin.permissions?.pages.length})</p>
                      <div className="grid grid-cols-2 gap-1 mt-1">
                        {createdAdmin.permissions?.pages.slice(0, 4).map((page) => (
                          <span key={page} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                            {page}
                          </span>
                        ))}
                      </div>
                      {(createdAdmin.permissions?.pages.length || 0) > 4 && (
                        <p className="text-xs text-slate-500 mt-1">
                          +{(createdAdmin.permissions?.pages.length || 0) - 4} more pages
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Operations ({createdAdmin.permissions?.operations.length})
                      </p>
                      <p className="text-xs text-slate-400 mt-1">All operations allowed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <Alert className="border-amber-600 bg-amber-950">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-200 ml-2 text-sm">
                  <strong>⚠️ Important:</strong> Change your password after first login!
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Go to Login →
                </Button>

                <Button
                  onClick={() => router.push("/admin")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Go to Admin Panel →
                </Button>
              </div>
            </>
          )}

          {/* Error State */}
          {status === "error" && !adminExists && (
            <>
              <Alert className="border-red-600 bg-red-950">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-200 ml-2">{error}</AlertDescription>
              </Alert>

              <Button
                onClick={() => {
                  setStatus("idle");
                  setError("");
                }}
                className="w-full bg-slate-700 hover:bg-slate-600"
                size="lg"
              >
                Try Again
              </Button>
            </>
          )}

          {/* Info Section */}
          <div className="text-xs text-slate-400 space-y-2 border-t border-slate-700 pt-4">
            <p>
              <strong>What is admin user?</strong> The admin user has full access to all system features including
              user management, roles, permissions, and settings.
            </p>
            <p>
              <strong>How many admins can I create?</strong> After this initial setup, you can create more admin users
              from the admin panel.
            </p>
            <p>
              <strong>Can I delete this admin?</strong> Yes, but only if another admin exists. Always keep at least one
              admin!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
