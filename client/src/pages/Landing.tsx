import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Code, Zap, CheckCircle2 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Domain Verification API
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Enterprise-grade domain verification for your applications. Verify domain ownership instantly through DNS or file upload methods.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="h-12 px-8"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-get-started"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8"
              data-testid="button-view-docs"
            >
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-lg">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Simple API</h3>
            <p className="text-muted-foreground">
              RESTful API with clear documentation. Integrate domain verification in minutes.
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-lg">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Real-time Verification</h3>
            <p className="text-muted-foreground">
              Instant DNS and file-based verification with webhook notifications.
            </p>
          </Card>

          <Card className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Secure & Reliable</h3>
            <p className="text-muted-foreground">
              Enterprise-grade security with API key management and access control.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Create an Account</h3>
                <p className="text-muted-foreground">
                  Sign up and get your organization set up in seconds.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Generate API Keys</h3>
                <p className="text-muted-foreground">
                  Create API keys from your dashboard to authenticate requests.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Integrate & Verify</h3>
                <p className="text-muted-foreground">
                  Use our API to verify domains in your application via DNS or file upload.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="p-12 text-center bg-primary/5 border-primary/20">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join developers who trust our platform for domain verification.
          </p>
          <Button 
            size="lg" 
            className="h-12 px-8"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-cta-signup"
          >
            Create Free Account
          </Button>
        </Card>
      </section>
    </div>
  );
}
