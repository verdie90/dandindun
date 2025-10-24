"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { AdminLayout } from "@/components/AdminLayout";
import {
  getAllLanguages,
  addLanguage,
  updateLanguage,
  deleteLanguage,
  setDefaultLanguage,
} from "@/lib/settings-service";
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
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Globe,
} from "lucide-react";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
  isDefault: boolean;
}

const LANGUAGE_OPTIONS = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
];

function LanguagesPageContent() {
  const router = useRouter();
  const { session } = useAuth();
  const { checkRole } = usePermission();

  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    nativeName: "",
  });

  const loadLanguages = async () => {
    try {
      setError(null);
      const langsData = await getAllLanguages();
      setLanguages(langsData);
    } catch (err) {
      setError("Failed to load languages");
    }
  };

  useEffect(() => {
    if (session.isAuthenticated) {
      loadLanguages();
      setIsLoading(false);
    }
  }, [session.isAuthenticated]);

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!formData.code || !formData.name || !formData.nativeName) {
        setError("Please fill in all fields");
        return;
      }

      // Check if language already exists
      if (languages.some((l) => l.code === formData.code)) {
        setError("This language already exists");
        return;
      }

      await addLanguage({
        code: formData.code,
        name: formData.name,
        nativeName: formData.nativeName,
        isActive: true,
      });

      setLanguages([
        ...languages,
        {
          code: formData.code,
          name: formData.name,
          nativeName: formData.nativeName,
          isActive: true,
          isDefault: false,
        },
      ]);

      setFormData({ code: "", name: "", nativeName: "" });
      setOpenDialog(false);
      setSuccess("Language added successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add language");
    }
  };

  const handleToggleActive = async (code: string, currentStatus: boolean) => {
    try {
      setError(null);
      await updateLanguage(code, { isActive: !currentStatus });

      setLanguages(
        languages.map((l) =>
          l.code === code ? { ...l, isActive: !currentStatus } : l
        )
      );

      setSuccess("Language updated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update language");
    }
  };

  const handleSetDefault = async (code: string) => {
    try {
      setError(null);
      await setDefaultLanguage(code);

      setLanguages(
        languages.map((l) => ({
          ...l,
          isDefault: l.code === code,
        }))
      );

      setSuccess("Default language set successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set default");
    }
  };

  const handleDeleteLanguage = async (code: string) => {
    const lang = languages.find((l) => l.code === code);
    if (lang?.isDefault) {
      setError("Cannot delete the default language");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${lang?.name}?`)) return;

    try {
      setError(null);
      await deleteLanguage(code);
      setLanguages(languages.filter((l) => l.code !== code));
      setSuccess("Language deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete language");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const availableLanguages = LANGUAGE_OPTIONS.filter(
    (opt) => !languages.some((l) => l.code === opt.code)
  );

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
              <h1 className="text-3xl font-bold">Languages</h1>
              <p className="text-muted-foreground mt-1">
                Manage system languages
              </p>
            </div>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Language
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Language</DialogTitle>
                <DialogDescription>
                  Add a new language to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddLanguage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lang-select">Select Language</Label>
                  <Select
                    value={formData.code}
                    onValueChange={(value) => {
                      const selected = LANGUAGE_OPTIONS.find(
                        (l) => l.code === value
                      );
                      if (selected) {
                        setFormData({
                          code: selected.code,
                          name: selected.name,
                          nativeName: selected.nativeName,
                        });
                      }
                    }}
                  >
                    <SelectTrigger id="lang-select">
                      <SelectValue placeholder="Choose a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name} ({lang.nativeName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.code && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="lang-name">Language Name</Label>
                      <Input
                        id="lang-name"
                        value={formData.name}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lang-native">Native Name</Label>
                      <Input
                        id="lang-native"
                        value={formData.nativeName}
                        disabled
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!formData.code}
                >
                  Add Language
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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

        {/* Languages Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Installed Languages
            </CardTitle>
            <CardDescription>
              Total languages: {languages.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {languages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No languages installed yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Native Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {languages.map((lang) => (
                      <TableRow key={lang.code}>
                        <TableCell className="font-mono text-sm">
                          {lang.code}
                        </TableCell>
                        <TableCell>{lang.name}</TableCell>
                        <TableCell>{lang.nativeName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleToggleActive(lang.code, lang.isActive)
                              }
                            >
                              {lang.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            {lang.isActive && (
                              <Badge>Active</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lang.isDefault ? (
                            <Badge variant="default">Default</Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(lang.code)}
                            >
                              Set Default
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLanguage(lang.code)}
                            disabled={lang.isDefault}
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
      </div>
    </div>
  );
}

export default function LanguagesPage() {
  return (
    <AdminLayout>
      <LanguagesPageContent />
    </AdminLayout>
  );
}
