import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "text" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg bg-muted/50 border">
      <div className="absolute right-2 top-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-8 w-8"
          data-testid="button-copy-code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 pr-12">
        <code className="font-mono text-sm" data-testid="text-code-content">
          {code}
        </code>
      </pre>
    </div>
  );
}
