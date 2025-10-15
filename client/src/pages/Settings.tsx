import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Bell, Shield, Trash2, Mail, Webhook } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [webhookNotifications, setWebhookNotifications] = useState(true);
  const [verificationAlerts, setVerificationAlerts] = useState(true);
  const [apiKeyAlerts, setApiKeyAlerts] = useState(false);

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/account", {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully.",
      });
      setTimeout(() => {
        window.location.href = "/api/logout";
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !user) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-settings-title">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>Configure how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your account activity
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
              data-testid="switch-email-notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="verification-alerts">Verification Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when domain verification status changes
              </p>
            </div>
            <Switch
              id="verification-alerts"
              checked={verificationAlerts}
              onCheckedChange={setVerificationAlerts}
              data-testid="switch-verification-alerts"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="webhook-notifications">Webhook Activity</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about webhook delivery status
              </p>
            </div>
            <Switch
              id="webhook-notifications"
              checked={webhookNotifications}
              onCheckedChange={setWebhookNotifications}
              data-testid="switch-webhook-notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="api-key-alerts">API Key Security Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get alerted when API keys are created or used from new locations
              </p>
            </div>
            <Switch
              id="api-key-alerts"
              checked={apiKeyAlerts}
              onCheckedChange={setApiKeyAlerts}
              data-testid="switch-api-key-alerts"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Preferences</CardTitle>
          </div>
          <CardDescription>Manage your email communication preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="product-updates"
                defaultChecked
                className="h-4 w-4 rounded border-input"
                data-testid="checkbox-product-updates"
              />
              <Label htmlFor="product-updates" className="text-sm font-normal">
                Product updates and new features
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="security-updates"
                defaultChecked
                className="h-4 w-4 rounded border-input"
                data-testid="checkbox-security-updates"
              />
              <Label htmlFor="security-updates" className="text-sm font-normal">
                Security updates and announcements
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="marketing-emails"
                className="h-4 w-4 rounded border-input"
                data-testid="checkbox-marketing"
              />
              <Label htmlFor="marketing-emails" className="text-sm font-normal">
                Marketing emails and newsletters
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            <CardTitle>API Preferences</CardTitle>
          </div>
          <CardDescription>Configure API and integration settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="rate-limit">Rate Limit Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Alert when approaching API rate limits
              </p>
            </div>
            <Switch
              id="rate-limit"
              defaultChecked
              data-testid="switch-rate-limit"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Default Webhook Retry</Label>
              <p className="text-sm text-muted-foreground">
                Automatically retry failed webhook deliveries
              </p>
            </div>
            <Switch
              defaultChecked
              data-testid="switch-webhook-retry"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-destructive/20 p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-sm">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    data-testid="button-delete-account"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account,
                      all organizations, API keys, webhooks, and verification history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-testid="button-cancel-delete">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteAccountMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      data-testid="button-confirm-delete"
                    >
                      {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
