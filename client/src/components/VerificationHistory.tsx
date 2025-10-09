import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VerificationRecord {
  id: string;
  domain: string;
  method: "dns" | "file";
  status: "pending" | "verified" | "failed";
  createdAt: Date;
}

interface VerificationHistoryProps {
  records: VerificationRecord[];
}

export function VerificationHistory({ records }: VerificationHistoryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "verified":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Verification History</h2>
      <div className="space-y-3">
        {records.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No verification records yet
          </p>
        ) : (
          records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
              data-testid={`record-${record.id}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getStatusIcon(record.status)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" data-testid={`text-domain-${record.id}`}>
                    {record.domain}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(record.createdAt, { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-xs">
                  {record.method.toUpperCase()}
                </Badge>
                <Badge variant={getStatusVariant(record.status)} className="text-xs capitalize">
                  {record.status}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
