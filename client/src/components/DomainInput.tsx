import { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DomainInputProps {
  onSubmit: (domain: string) => void;
}

export function DomainInput({ onSubmit }: DomainInputProps) {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");

  const validateDomain = (value: string) => {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    
    if (!cleanDomain) {
      setError("Please enter a domain");
      return;
    }
    
    if (!validateDomain(cleanDomain)) {
      setError("Please enter a valid domain (e.g., example.com)");
      return;
    }
    
    setError("");
    onSubmit(cleanDomain);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
    if (error) setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Globe className="h-5 w-5" />
          </div>
          <Input
            type="text"
            placeholder="yourdomain.com"
            value={domain}
            onChange={handleChange}
            className="h-14 pl-12 pr-4 text-lg"
            data-testid="input-domain"
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" data-testid="text-domain-error">
            {error}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="w-full h-12"
          data-testid="button-verify-domain"
        >
          Verify Domain
        </Button>
      </div>
    </form>
  );
}
