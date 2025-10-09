import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface VerificationMethodCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onSelect: () => void;
  selected?: boolean;
}

export function VerificationMethodCard({
  icon: Icon,
  title,
  description,
  onSelect,
  selected = false,
}: VerificationMethodCardProps) {
  return (
    <Card
      className={`p-6 cursor-pointer transition-all hover-elevate ${
        selected ? "border-primary" : ""
      }`}
      onClick={onSelect}
      data-testid={`card-method-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`flex h-16 w-16 items-center justify-center rounded-lg ${
          selected ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}>
          <Icon className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          variant={selected ? "default" : "outline"}
          className="w-full"
          data-testid={`button-select-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {selected ? "Selected" : "Select Method"}
        </Button>
      </div>
    </Card>
  );
}
