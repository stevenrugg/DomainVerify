import { CodeBlock } from "./CodeBlock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface VerificationInstructionsProps {
  method: "dns" | "file";
  domain: string;
  token: string;
  onVerify: () => void;
  isVerifying?: boolean;
}

export function VerificationInstructions({
  method,
  domain,
  token,
  onVerify,
  isVerifying = false,
}: VerificationInstructionsProps) {
  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">
            {method === "dns" ? "DNS TXT Record Verification" : "HTML File Upload Verification"}
          </h2>
          <p className="text-muted-foreground">
            Follow these steps to verify ownership of {domain}
          </p>
        </div>

        {method === "dns" ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Step 1: Add TXT Record</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Add the following TXT record to your domain's DNS settings:
              </p>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Name/Host:</label>
                  <CodeBlock code="_domainverify" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Value:</label>
                  <CodeBlock code={token} />
                </div>
              </div>
            </div>

            <div className="bg-accent/50 border border-accent-border rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-accent-foreground">DNS propagation timing</p>
                <p className="text-accent-foreground/80 mt-1">
                  Most domain registrars will update DNS records in 10-15 minutes. However, full DNS propagation can take up to 48 hours depending on your provider and network conditions.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Step 2: Verify</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Once you've added the TXT record, click the button below to verify.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Step 1: Create Verification File</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Create a file named <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">domain-verification.txt</code> with the following content:
              </p>
              <CodeBlock code={token} />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Step 2: Upload to Root Directory</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Upload this file to the root directory of your website so it's accessible at:
              </p>
              <CodeBlock code={`https://${domain}/domain-verification.txt`} />
            </div>

            <div className="bg-accent/50 border border-accent-border rounded-lg p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-accent-foreground">Important</p>
                <p className="text-accent-foreground/80 mt-1">
                  Make sure the file is publicly accessible and returns a 200 status code.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Step 3: Verify</h3>
              <p className="text-sm text-muted-foreground mb-3">
                After uploading the file, click the button below to verify.
              </p>
            </div>
          </div>
        )}

        <Button
          onClick={onVerify}
          className="w-full h-12"
          disabled={isVerifying}
          data-testid="button-check-verification"
        >
          {isVerifying ? "Checking..." : "Check Verification"}
        </Button>
      </div>
    </Card>
  );
}
