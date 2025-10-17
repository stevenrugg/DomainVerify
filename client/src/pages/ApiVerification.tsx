import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Copy, RefreshCw, Key, Globe, FileText } from "lucide-react";

type VerificationMethod = "dns" | "file";

interface Verification {
  id: string;
  domain: string;
  method: VerificationMethod;
  token: string;
  status: "pending" | "verified" | "failed";
  verifiedAt?: string;
  createdAt: string;
}

export default function ApiVerification() {
  const [apiKey, setApiKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [domain, setDomain] = useState("");
  const [method, setMethod] = useState<VerificationMethod>("dns");
  const [currentVerification, setCurrentVerification] = useState<Verification | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Test the API key by making a request
    try {
      const response = await fetch("/api/v1/verifications", {
        headers: {
          "X-API-Key": apiKey
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        toast({
          title: "API Key Authenticated",
          description: "You can now set up domain verification.",
        });
      } else if (response.status === 401) {
        toast({
          title: "Invalid API Key",
          description: "Please check your API key and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to authenticate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch("/api/v1/verifications", {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ domain, method })
      });

      if (response.ok) {
        const verification = await response.json();
        setCurrentVerification(verification);
        toast({
          title: "Verification Created",
          description: `Follow the ${method === 'dns' ? 'DNS' : 'file upload'} instructions below.`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Failed to Create Verification",
          description: error.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create verification.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!currentVerification) return;
    
    setIsChecking(true);
    try {
      const response = await fetch(`/api/v1/verifications/${currentVerification.id}/check`, {
        method: "POST",
        headers: {
          "X-API-Key": apiKey
        }
      });

      if (response.ok) {
        const updated = await response.json();
        setCurrentVerification(updated);
        
        if (updated.status === "verified") {
          toast({
            title: "Domain Verified!",
            description: `${updated.domain} has been successfully verified.`,
          });
        } else {
          toast({
            title: "Verification Pending",
            description: "The verification record was not found. Please ensure you've added the correct record and try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Check Failed",
        description: "Failed to check verification status.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Value copied to clipboard.",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              <CardTitle>API Key Authentication</CardTitle>
            </div>
            <CardDescription>
              Enter your API key to begin domain verification
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleApiKeySubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="api-key" className="text-sm font-medium">
                  API Key
                </label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="dvk_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  data-testid="input-api-key"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from the dashboard
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" data-testid="button-authenticate">
                Authenticate
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  if (!currentVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <CardTitle>Domain Verification Setup</CardTitle>
            </div>
            <CardDescription>
              Enter your domain and choose a verification method
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateVerification}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="domain" className="text-sm font-medium">
                  Domain to Verify
                </label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  data-testid="input-domain"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Method</label>
                <Tabs value={method} onValueChange={(v) => setMethod(v as VerificationMethod)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="dns" data-testid="tab-dns">
                      DNS TXT Record
                    </TabsTrigger>
                    <TabsTrigger value="file" data-testid="tab-file">
                      File Upload
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="dns" className="mt-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You'll add a TXT record to your domain's DNS settings. This is the most secure method.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  <TabsContent value="file" className="mt-4">
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        You'll upload a verification file to your domain's root directory. Use this if you can't modify DNS.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCreating}
                data-testid="button-create-verification"
              >
                {isCreating ? "Creating..." : "Generate Verification Instructions"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Verification Instructions</CardTitle>
                <CardDescription>
                  Complete the steps below to verify ownership of {currentVerification.domain}
                </CardDescription>
              </div>
              <Badge variant={currentVerification.status === "verified" ? "default" : "secondary"}>
                {currentVerification.status === "verified" && <CheckCircle className="w-3 h-3 mr-1" />}
                {currentVerification.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentVerification.method === "dns" ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">General Instructions</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-2">
                      <span className="font-semibold">1.</span>
                      <span>Sign in to the website where you manage your domain. This is where you can change your domain's DNS records.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">2.</span>
                      <span>Go to your domain's DNS settings. Look for something like <strong>DNS Records</strong>, <strong>Domain Management</strong>, or <strong>Name Server Management</strong>.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">3.</span>
                      <span>Find the TXT records section.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">4.</span>
                      <span>Add a new TXT record using the following values:</span>
                    </li>
                  </ol>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 pr-4 font-medium bg-muted/50 pl-4">Type</td>
                          <td className="py-3 pl-4">
                            <Badge variant="secondary">TXT</Badge>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 pr-4 font-medium bg-muted/50 pl-4 align-top">
                            <div>Name /</div>
                            <div>Host / Alias</div>
                          </td>
                          <td className="py-3 pl-4">
                            <div className="space-y-2">
                              <p>Leave this blank, or enter <strong>@</strong></p>
                              <p className="text-sm text-muted-foreground">
                                If you're adding a subdomain to a domain verification service, enter the subdomain value in this field. 
                                (Example: if the subdomain is <code>_domainverify.example.com</code>, you would enter <strong>_domainverify</strong>)
                              </p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 pr-4 font-medium bg-muted/50 pl-4 align-top">
                            <div>Value /</div>
                            <div>Answer /</div>
                            <div>Destination</div>
                          </td>
                          <td className="py-3 pl-4">
                            <div className="space-y-3">
                              <p>Enter your unique verification token:</p>
                              <div className="flex items-center gap-2">
                                <code className="flex-1 px-3 py-2 bg-muted rounded text-xs break-all">
                                  {currentVerification.token}
                                </code>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => copyToClipboard(currentVerification.token)}
                                  data-testid="button-copy-token"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <ol start={5} className="space-y-3 text-sm">
                    <li className="flex gap-2">
                      <span className="font-semibold">5.</span>
                      <span>Save your new TXT record.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">6.</span>
                      <span>Wait for the changes to take effect. It can take up to 72 hours for the new TXT records to propagate, although it typically happens much faster.</span>
                    </li>
                  </ol>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>DNS propagation timing:</strong> Most domain registrars will update DNS records in 10-15 minutes. However, full DNS propagation can take up to 48 hours depending on your provider and network conditions.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">File Upload Instructions</h3>
                  <ol className="space-y-3 text-sm">
                    <li className="flex gap-2">
                      <span className="font-semibold">1.</span>
                      <span>Create a new file named <code className="px-1 py-0.5 bg-muted rounded">domain-verification.txt</code></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">2.</span>
                      <span>Add the following verification token as the file content:</span>
                    </li>
                  </ol>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-muted rounded text-sm break-all">
                        {currentVerification.token}
                      </code>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(currentVerification.token)}
                        data-testid="button-copy-file-token"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <ol start={3} className="space-y-3 text-sm">
                    <li className="flex gap-2">
                      <span className="font-semibold">3.</span>
                      <span>Upload the file to the root directory of your website</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold">4.</span>
                      <span>The file should be accessible at:</span>
                    </li>
                  </ol>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <code className="block px-3 py-2 bg-muted rounded text-sm break-all">
                        https://{currentVerification.domain}/domain-verification.txt
                      </code>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Make sure the file is publicly accessible and returns the exact token without any additional HTML or formatting.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              onClick={handleCheckVerification}
              disabled={isChecking || currentVerification.status === "verified"}
              className="w-full"
              data-testid="button-complete-verification"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking Verification...
                </>
              ) : currentVerification.status === "verified" ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verified
                </>
              ) : (
                "Complete Verification"
              )}
            </Button>
            
            {currentVerification.status === "verified" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Domain successfully verified on {new Date(currentVerification.verifiedAt!).toLocaleString()}
                </AlertDescription>
              </Alert>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}