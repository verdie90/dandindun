"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { usePermission } from "@/hooks/usePermission";
import { ProtectedPage } from "@/components/ProtectedPage";
import { AdminLayout } from "@/components/AdminLayout";
import {
  getAllActiveSessions,
  getUserSessions,
  terminateSession,
  Session,
} from "@/lib/session-service";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, LogOut, AlertCircle, CheckCircle } from "lucide-react";

function SessionsContent() {
  const router = useRouter();
  const { session } = useAuth();
  const { checkRole, isOperationAllowed } = usePermission();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadSessions = async () => {
    try {
      setError(null);
      const sessionsData = await getAllActiveSessions();
      setSessions(sessionsData);
      setLastRefresh(new Date());
    } catch (err) {
      setError("Failed to load sessions");
    }
  };

  useEffect(() => {
    if (session.isAuthenticated) {
      loadSessions();
      setIsLoading(false);
    }
  }, [session.isAuthenticated]);

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to terminate this session?")) return;

    try {
      setError(null);
      await terminateSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
      setSuccess("Session terminated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to terminate session");
    }
  };

  const isSessionExpired = (expiresAt: Date) => {
    return expiresAt.getTime() < Date.now();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const getStatusBadge = (expiresAt: Date) => {
    if (isSessionExpired(expiresAt)) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const activeSessions = sessions.filter((s) => !isSessionExpired(s.expiresAt));
  const expiredSessions = sessions.filter((s) => isSessionExpired(s.expiresAt));

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
              <h1 className="text-3xl font-bold">Sessions</h1>
              <p className="text-muted-foreground mt-1">
                Manage active user sessions
              </p>
            </div>
          </div>
          <Button onClick={loadSessions} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {activeSessions.length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Active Sessions
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground">
                  {expiredSessions.length}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Expired Sessions
                </p>
              </div>
            </CardContent>
          </Card>
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

        {/* Active Sessions Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Last refreshed: {lastRefresh.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active sessions
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-sm">
                          {s.userId.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {s.id.substring(0, 12)}...
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(s.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(s.expiresAt)}
                        </TableCell>
                        <TableCell>{getStatusBadge(s.expiresAt)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTerminateSession(s.id)}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <LogOut className="h-4 w-4" />
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

        {/* Expired Sessions Table */}
        {expiredSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Expired Sessions</CardTitle>
              <CardDescription>
                These sessions have expired and will be cleaned up automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expired At</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiredSessions.map((s) => (
                      <TableRow key={s.id} className="opacity-50">
                        <TableCell className="font-mono text-sm">
                          {s.userId.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {s.id.substring(0, 12)}...
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(s.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(s.expiresAt)}
                        </TableCell>
                        <TableCell>{getStatusBadge(s.expiresAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SessionsPage() {
  return (
    <ProtectedPage 
      requiredPage="/admin/logs"
      requiredOperations={["READ"]}
    >
      <AdminLayout>
        <SessionsContent />
      </AdminLayout>
    </ProtectedPage>
  );
}
