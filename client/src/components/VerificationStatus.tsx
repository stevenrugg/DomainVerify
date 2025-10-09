import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface VerificationStatusProps {
  status: "pending" | "verified" | "failed";
  domain: string;
  onReset?: () => void;
}

export function VerificationStatus({ status, domain, onReset }: VerificationStatusProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      title: "Verification Pending",
      message: "We're checking your verification. This may take a few moments.",
    },
    verified: {
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      title: "Domain Verified!",
      message: `Successfully verified ownership of ${domain}`,
    },
    failed: {
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      title: "Verification Failed",
      message: "We couldn't verify your domain. Please check your setup and try again.",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className="p-8 max-w-md mx-auto text-center">
      <div className="space-y-6">
        <div className={`inline-flex h-20 w-20 items-center justify-center rounded-full ${config.bgColor}`}>
          <Icon className={`h-10 w-10 ${config.color}`} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold" data-testid={`text-status-${status}`}>
            {config.title}
          </h2>
          <p className="text-muted-foreground">{config.message}</p>
        </div>
        {(status === "verified" || status === "failed") && onReset && (
          <Button
            onClick={onReset}
            variant={status === "verified" ? "default" : "outline"}
            className="w-full"
            data-testid="button-verify-another"
          >
            Verify Another Domain
          </Button>
        )}
      </div>
    </Card>
  );
}
