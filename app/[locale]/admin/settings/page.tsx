"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { AdminLayout } from "@/components/AdminLayout";
import {
  getAppSettings,
  updateAppSettings,
  AppSettings,
} from "@/lib/settings-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, AlertCircle, CheckCircle, Settings } from "lucide-react";

function SettingsPageContent() {
  const router = useRouter();
  const { session } = useAuth();
  const { checkRole } = usePermission();

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    siteName: "",
    siteDescription: "",
    siteUrl: "",
    supportEmail: "",
    maintenanceMode: false,
    maintenanceMessage: "",
    maxSessionDuration: 7,
    passwordMinLength: 6,
    requireEmailVerification: false,
    allowRegistration: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setError(null);
        let appSettings = await getAppSettings();

        // Initialize with defaults if not found
        if (!appSettings) {
          appSettings = {
            id: "default",
            siteName: "Dandindun",
            siteDescription: "Multi-language Application with RBAC",
            siteUrl: "https://dandindun.local",
            supportEmail: "support@dandindun.local",
            maintenanceMode: false,
            maxSessionDuration: 7,
            passwordMinLength: 6,
            requireEmailVerification: false,
            allowRegistration: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }

        setSettings(appSettings);
        setFormData({
          siteName: appSettings.siteName,
          siteDescription: appSettings.siteDescription,
          siteUrl: appSettings.siteUrl,
          supportEmail: appSettings.supportEmail,
          maintenanceMode: appSettings.maintenanceMode,
          maintenanceMessage: appSettings.maintenanceMessage || "",
          maxSessionDuration: appSettings.maxSessionDuration,
          passwordMinLength: appSettings.passwordMinLength,
          requireEmailVerification: appSettings.requireEmailVerification,
          allowRegistration: appSettings.allowRegistration,
        });
      } catch (err) {
        setError("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    if (session.isAuthenticated) {
      loadSettings();
    }
  }, [session.isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      await updateAppSettings({
        siteName: formData.siteName,
        siteDescription: formData.siteDescription,
        siteUrl: formData.siteUrl,
        supportEmail: formData.supportEmail,
        maintenanceMode: formData.maintenanceMode,
        maintenanceMessage: formData.maintenanceMessage,
        maxSessionDuration: formData.maxSessionDuration,
        passwordMinLength: formData.passwordMinLength,
        requireEmailVerification: formData.requireEmailVerification,
        allowRegistration: formData.allowRegistration,
      });

      setSuccess("Settings saved successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Application Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure application behavior and preferences
            </p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Site Information */}
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>
                Basic details about your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={formData.siteName}
                  onChange={(e) =>
                    setFormData({ ...formData, siteName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDesc">Site Description</Label>
                <Textarea
                  id="siteDesc"
                  value={formData.siteDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      siteDescription: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  type="url"
                  value={formData.siteUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, siteUrl: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, supportEmail: e.target.value })
                  }
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance</CardTitle>
              <CardDescription>
                Control application availability
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="maintenanceMode" className="font-semibold">
                    Maintenance Mode
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    When enabled, only admins can access the application
                  </p>
                </div>
                <input
                  id="maintenanceMode"
                  type="checkbox"
                  checked={formData.maintenanceMode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenanceMode: e.target.checked,
                    })
                  }
                  className="h-5 w-5"
                />
              </div>

              {formData.maintenanceMode && (
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMsg">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMsg"
                    placeholder="Message shown to users during maintenance..."
                    value={formData.maintenanceMessage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenanceMessage: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session & Security */}
          <Card>
            <CardHeader>
              <CardTitle>Session & Security</CardTitle>
              <CardDescription>
                Configure session and password policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionDuration">
                  Max Session Duration (days)
                </Label>
                <Input
                  id="sessionDuration"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.maxSessionDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxSessionDuration: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordMin">
                  Minimum Password Length
                </Label>
                <Input
                  id="passwordMin"
                  type="number"
                  min="4"
                  max="32"
                  value={formData.passwordMinLength}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passwordMinLength: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label
                    htmlFor="emailVerification"
                    className="font-semibold"
                  >
                    Require Email Verification
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Users must verify their email before using the application
                  </p>
                </div>
                <input
                  id="emailVerification"
                  type="checkbox"
                  checked={formData.requireEmailVerification}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requireEmailVerification: e.target.checked,
                    })
                  }
                  className="h-5 w-5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Registration */}
          <Card>
            <CardHeader>
              <CardTitle>Registration</CardTitle>
              <CardDescription>
                Control user registration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="allowRegistration" className="font-semibold">
                    Allow User Registration
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    When disabled, only administrators can create user accounts
                  </p>
                </div>
                <input
                  id="allowRegistration"
                  type="checkbox"
                  checked={formData.allowRegistration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allowRegistration: e.target.checked,
                    })
                  }
                  className="h-5 w-5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AdminLayout>
      <SettingsPageContent />
    </AdminLayout>
  );
}
