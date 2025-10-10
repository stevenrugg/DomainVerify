import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { VerificationHistory } from "@/components/VerificationHistory";
import { CodeBlock } from "@/components/CodeBlock";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrganizationSchema, insertApiKeySchema, insertWebhookSchema } from "@shared/schema";
import type { Organization, ApiKey, Webhook, Verification } from "@shared/schema";
import { z } from "zod";
import { Plus, Copy, Check, Trash2, Eye, EyeOff, Key, Webhook as WebhookIcon, Building2, Code } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [createKeyOpen, setCreateKeyOpen] = useState(false);
  const [createWebhookOpen, setCreateWebhookOpen] = useState(false);

  // Fetch organizations
  const { data: organizations = [], isLoading: orgsLoading } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
    enabled: !!user,
  });

  // Select first org by default
  if (organizations.length > 0 && !selectedOrgId) {
    setSelectedOrgId(organizations[0].id);
  }

  // Fetch API keys for selected org
  const { data: apiKeys = [], isLoading: keysLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/organizations", selectedOrgId, "api-keys"],
    enabled: !!selectedOrgId,
  });

  // Fetch webhooks for selected org
  const { data: webhooks = [], isLoading: webhooksLoading } = useQuery<Webhook[]>({
    queryKey: ["/api/organizations", selectedOrgId, "webhooks"],
    enabled: !!selectedOrgId,
  });

  // Fetch verifications
  const { data: verifications = [], isLoading: verificationsLoading } = useQuery<Verification[]>({
    queryKey: ["/api/dashboard/verifications"],
    enabled: !!user,
  });

  // Create organization mutation
  const orgForm = useForm({
    resolver: zodResolver(insertOrganizationSchema),
    defaultValues: { name: "" },
  });

  const createOrgMutation = useMutation({
    mutationFn: async (values: z.infer<typeof insertOrganizationSchema>) => {
      return await apiRequest<Organization>("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
    },
    onSuccess: (newOrg) => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations"] });
      setSelectedOrgId(newOrg.id);
      setCreateOrgOpen(false);
      orgForm.reset();
      toast({ title: "Organization created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create organization", variant: "destructive" });
    },
  });

  // Create API key mutation
  const keyForm = useForm({
    resolver: zodResolver(insertApiKeySchema),
    defaultValues: { name: "" },
  });

  const createKeyMutation = useMutation({
    mutationFn: async (values: z.infer<typeof insertApiKeySchema>) => {
      return await apiRequest<any>(`/api/organizations/${selectedOrgId}/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
    },
    onSuccess: (data) => {
      // Save the newly created key for display in code examples
      if (data.key) {
        setNewlyCreatedKey(data.key);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", selectedOrgId, "api-keys"] });
      setCreateKeyOpen(false);
      keyForm.reset();
      toast({ 
        title: "API key created successfully",
        description: "Make sure to copy your API key now. You won't be able to see it again!",
      });
    },
    onError: () => {
      toast({ title: "Failed to create API key", variant: "destructive" });
    },
  });

  // Delete API key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      return await apiRequest(`/api/api-keys/${keyId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", selectedOrgId, "api-keys"] });
      toast({ title: "API key deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete API key", variant: "destructive" });
    },
  });

  // Create webhook mutation
  const webhookForm = useForm({
    resolver: zodResolver(insertWebhookSchema),
    defaultValues: { 
      url: "", 
      events: [] as string[] 
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (values: z.infer<typeof insertWebhookSchema>) => {
      return await apiRequest<Webhook>(`/api/organizations/${selectedOrgId}/webhooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/organizations", selectedOrgId, "webhooks"] });
      setCreateWebhookOpen(false);
      webhookForm.reset();
      toast({ title: "Webhook created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create webhook", variant: "destructive" });
    },
  });

  // Helper functions
  const toggleKeyVisibility = (keyId: string) => {
    setRevealedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const maskKey = (apiKey: any) => {
    if (apiKey.key) {
      // Full key available (just created)
      return apiKey.key.slice(0, 7) + "..." + apiKey.key.slice(-4);
    }
    // Use stored prefix/suffix
    return apiKey.keyPrefix + "..." + apiKey.keySuffix;
  };
  
  const displayKey = (apiKey: any, revealed: boolean) => {
    if (apiKey.key && revealed) {
      // Full key available (just created) and user wants to see it
      return apiKey.key;
    }
    if (apiKey.key) {
      // Full key available but masked
      return apiKey.key.slice(0, 7) + "..." + apiKey.key.slice(-4);
    }
    // Use stored prefix/suffix (key no longer available)
    return apiKey.keyPrefix + "..." + apiKey.keySuffix;
  };

  // For code examples, use the newly created key or show placeholder
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const exampleApiKey = newlyCreatedKey || "YOUR_API_KEY";

  if (authLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Please sign in to access the dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Dashboard</h1>
          <p className="text-muted-foreground">Manage your organizations, API keys, and webhooks</p>
        </div>
        
        {/* Organization selector */}
        <div className="flex items-center gap-3">
          {organizations.length > 0 && (
            <div className="flex items-center gap-2">
              <Label htmlFor="org-select" className="text-sm text-muted-foreground">Organization:</Label>
              <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
                <SelectTrigger className="w-[200px]" id="org-select" data-testid="select-organization">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id} data-testid={`option-org-${org.id}`}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Dialog open={createOrgOpen} onOpenChange={setCreateOrgOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-organization">
                <Plus className="h-4 w-4 mr-2" />
                New Organization
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="dialog-create-organization">
              <DialogHeader>
                <DialogTitle>Create Organization</DialogTitle>
                <DialogDescription>Create a new organization to manage your domain verifications</DialogDescription>
              </DialogHeader>
              <Form {...orgForm}>
                <form onSubmit={orgForm.handleSubmit((values) => createOrgMutation.mutate(values))} className="space-y-4">
                  <FormField
                    control={orgForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="My Organization" data-testid="input-org-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={createOrgMutation.isPending} data-testid="button-submit-organization">
                    {createOrgMutation.isPending ? "Creating..." : "Create Organization"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Empty state */}
      {organizations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground mb-4">Create your first organization to get started with domain verification</p>
            <Button onClick={() => setCreateOrgOpen(true)} data-testid="button-create-first-organization">
              <Plus className="h-4 w-4 mr-2" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList data-testid="tabs-dashboard">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="api-keys" data-testid="tab-api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks" data-testid="tab-webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="docs" data-testid="tab-docs">Documentation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Keys</CardTitle>
                  <Key className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-api-keys-count">{apiKeys.length}</div>
                  <p className="text-xs text-muted-foreground">Active API keys</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
                  <WebhookIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-webhooks-count">{webhooks.length}</div>
                  <p className="text-xs text-muted-foreground">Active webhooks</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verifications</CardTitle>
                  <Check className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-verifications-count">{verifications.length}</div>
                  <p className="text-xs text-muted-foreground">Total verifications</p>
                </CardContent>
              </Card>
            </div>

            <VerificationHistory records={verifications} />
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage API keys for accessing the verification API</CardDescription>
                  </div>
                  <Dialog open={createKeyOpen} onOpenChange={setCreateKeyOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-api-key">
                        <Plus className="h-4 w-4 mr-2" />
                        Create API Key
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-testid="dialog-create-api-key">
                      <DialogHeader>
                        <DialogTitle>Create API Key</DialogTitle>
                        <DialogDescription>Create a new API key for this organization</DialogDescription>
                      </DialogHeader>
                      <Form {...keyForm}>
                        <form onSubmit={keyForm.handleSubmit((values) => createKeyMutation.mutate(values))} className="space-y-4">
                          <FormField
                            control={keyForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Key Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Production API Key" data-testid="input-api-key-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={createKeyMutation.isPending} data-testid="button-submit-api-key">
                            {createKeyMutation.isPending ? "Creating..." : "Create API Key"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {keysLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No API keys yet. Create one to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between gap-4 p-4 rounded-lg border hover-elevate"
                        data-testid={`api-key-${key.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium" data-testid={`text-key-name-${key.id}`}>{key.name}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded" data-testid={`text-key-value-${key.id}`}>
                              {revealedKeys.has(key.id) ? (
                                // Show the actual key if available and revealed
                                (key as any).key ? (key as any).key : `${key.keyPrefix}...${key.keySuffix}`
                              ) : (
                                // Show bullets when hidden
                                "••••••••••••••••••••••••••••••••"
                              )}
                            </code>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => toggleKeyVisibility(key.id)}
                                data-testid={`button-toggle-visibility-${key.id}`}
                              >
                                {revealedKeys.has(key.id) ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  const keyToCopy = (key as any).key || `${key.keyPrefix}...${key.keySuffix}`;
                                  copyToClipboard(keyToCopy, key.id);
                                }}
                                data-testid={`button-copy-key-${key.id}`}
                              >
                                {copiedKey === key.id ? (
                                  <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                            {key.lastUsedAt && ` • Last used ${formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true })}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deleteKeyMutation.mutate(key.id)}
                            disabled={deleteKeyMutation.isPending}
                            data-testid={`button-delete-key-${key.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>Configure webhooks to receive verification events</CardDescription>
                  </div>
                  <Dialog open={createWebhookOpen} onOpenChange={setCreateWebhookOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-webhook">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Webhook
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-testid="dialog-create-webhook">
                      <DialogHeader>
                        <DialogTitle>Create Webhook</DialogTitle>
                        <DialogDescription>Configure a webhook endpoint to receive verification events</DialogDescription>
                      </DialogHeader>
                      <Form {...webhookForm}>
                        <form onSubmit={webhookForm.handleSubmit((values) => createWebhookMutation.mutate(values))} className="space-y-4">
                          <FormField
                            control={webhookForm.control}
                            name="url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Webhook URL</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="https://api.example.com/webhooks" data-testid="input-webhook-url" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={webhookForm.control}
                            name="events"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Events</FormLabel>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="event-completed"
                                      checked={field.value?.includes("verification.completed")}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, "verification.completed"]);
                                        } else {
                                          field.onChange(current.filter((e) => e !== "verification.completed"));
                                        }
                                      }}
                                      data-testid="checkbox-event-completed"
                                    />
                                    <Label htmlFor="event-completed" className="text-sm font-normal">
                                      verification.completed
                                    </Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      id="event-failed"
                                      checked={field.value?.includes("verification.failed")}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, "verification.failed"]);
                                        } else {
                                          field.onChange(current.filter((e) => e !== "verification.failed"));
                                        }
                                      }}
                                      data-testid="checkbox-event-failed"
                                    />
                                    <Label htmlFor="event-failed" className="text-sm font-normal">
                                      verification.failed
                                    </Label>
                                  </div>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={createWebhookMutation.isPending} data-testid="button-submit-webhook">
                            {createWebhookMutation.isPending ? "Creating..." : "Create Webhook"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {webhooksLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : webhooks.length === 0 ? (
                  <div className="text-center py-8">
                    <WebhookIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No webhooks configured yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {webhooks.map((webhook) => (
                      <div
                        key={webhook.id}
                        className="p-4 rounded-lg border hover-elevate"
                        data-testid={`webhook-${webhook.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium font-mono text-sm break-all" data-testid={`text-webhook-url-${webhook.id}`}>
                              {webhook.url}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {webhook.events.map((event) => (
                                <Badge key={event} variant="secondary" className="text-xs" data-testid={`badge-event-${webhook.id}-${event}`}>
                                  {event}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Created {formatDistanceToNow(new Date(webhook.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge variant={webhook.isActive ? "default" : "secondary"} data-testid={`badge-webhook-status-${webhook.id}`}>
                            {webhook.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Documentation
                </CardTitle>
                <CardDescription>Quick start guide to integrate domain verification into your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">Create an API key first to see code examples</p>
                    <Button onClick={() => setCreateKeyOpen(true)} data-testid="button-create-key-from-docs">
                      <Plus className="h-4 w-4 mr-2" />
                      Create API Key
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">1. Create a Verification</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Initiate a domain verification by specifying the domain and method (DNS or file-based).
                      </p>
                      <CodeBlock
                        code={`curl -X POST https://api.example.com/api/v1/verifications \\
  -H "X-API-Key: ${exampleApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "domain": "example.com",
    "method": "dns"
  }'`}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">2. Check Verification Status</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Verify that the DNS record or file has been set up correctly.
                      </p>
                      <CodeBlock
                        code={`curl -X POST https://api.example.com/api/v1/verifications/{id}/check \\
  -H "X-API-Key: ${exampleApiKey}"`}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">3. List Verifications</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Retrieve all verifications for your organization.
                      </p>
                      <CodeBlock
                        code={`curl https://api.example.com/api/v1/verifications \\
  -H "X-API-Key: ${exampleApiKey}"`}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">JavaScript Example</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Using the Fetch API in Node.js or the browser.
                      </p>
                      <CodeBlock
                        code={`const response = await fetch('https://api.example.com/api/v1/verifications', {
  method: 'POST',
  headers: {
    'X-API-Key': '${exampleApiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    domain: 'example.com',
    method: 'dns'
  })
});

const verification = await response.json();
console.log(verification);`}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">Response Format</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        All API responses follow this JSON structure.
                      </p>
                      <CodeBlock
                        code={`{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "organizationId": "550e8400-e29b-41d4-a716-446655440001",
  "domain": "example.com",
  "method": "dns",
  "token": "verify-domain-abc123xyz",
  "status": "pending",
  "verifiedAt": null,
  "createdAt": "2024-01-01T00:00:00.000Z"
}`}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
