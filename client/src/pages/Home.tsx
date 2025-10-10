import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { DomainInput } from "@/components/DomainInput";
import { VerificationMethodCard } from "@/components/VerificationMethodCard";
import { ProgressSteps } from "@/components/ProgressSteps";
import { VerificationInstructions } from "@/components/VerificationInstructions";
import { VerificationStatus } from "@/components/VerificationStatus";
import { VerificationHistory } from "@/components/VerificationHistory";
import { FileText, Upload } from "lucide-react";
import type { Verification } from "@shared/schema";

const STEPS = [
  { id: 1, label: "Input" },
  { id: 2, label: "Method" },
  { id: 3, label: "Verify" },
  { id: 4, label: "Complete" },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [domain, setDomain] = useState("");
  const [method, setMethod] = useState<"dns" | "file" | null>(null);
  const [currentVerification, setCurrentVerification] = useState<Verification | null>(null);

  // Fetch verification history
  const { data: verifications = [] } = useQuery<Verification[]>({
    queryKey: ["/api/verifications"],
  });

  // Create verification mutation
  const createVerificationMutation = useMutation({
    mutationFn: async (data: { domain: string; method: "dns" | "file" }) => {
      return apiRequest<Verification>("/api/verifications", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (data) => {
      setCurrentVerification(data);
      queryClient.invalidateQueries({ queryKey: ["/api/verifications"] });
    },
  });

  // Check verification mutation
  const checkVerificationMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest<Verification>(`/api/verifications/${id}/check`, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      setCurrentVerification(data);
      setCurrentStep(4);
      queryClient.invalidateQueries({ queryKey: ["/api/verifications"] });
    },
  });

  const handleDomainSubmit = (submittedDomain: string) => {
    setDomain(submittedDomain);
    setCurrentStep(2);
  };

  const handleMethodSelect = async (selectedMethod: "dns" | "file") => {
    setMethod(selectedMethod);
    await createVerificationMutation.mutateAsync({
      domain,
      method: selectedMethod,
    });
    setCurrentStep(3);
  };

  const handleVerify = async () => {
    if (currentVerification?.id) {
      await checkVerificationMutation.mutateAsync(currentVerification.id);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setDomain("");
    setMethod(null);
    setCurrentVerification(null);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Hero Section */}
          {currentStep === 1 && (
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Verify Domain Ownership
                </h1>
                <p className="text-lg text-muted-foreground">
                  Secure and instant domain verification through DNS records or file uploads
                </p>
              </div>
              <DomainInput onSubmit={handleDomainSubmit} />
            </div>
          )}

          {/* Progress Steps */}
          {currentStep > 1 && (
            <div className="py-8">
              <ProgressSteps currentStep={currentStep} steps={STEPS} />
            </div>
          )}

          {/* Method Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold mb-2">Choose Verification Method</h2>
                <p className="text-muted-foreground">
                  Select how you'd like to verify ownership of {domain}
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <VerificationMethodCard
                  icon={FileText}
                  title="DNS TXT Record"
                  description="Add a TXT record to your domain's DNS settings"
                  onSelect={() => handleMethodSelect("dns")}
                  selected={method === "dns"}
                />
                <VerificationMethodCard
                  icon={Upload}
                  title="HTML File Upload"
                  description="Upload a verification file to your website's root directory"
                  onSelect={() => handleMethodSelect("file")}
                  selected={method === "file"}
                />
              </div>
            </div>
          )}

          {/* Verification Instructions */}
          {currentStep === 3 && method && currentVerification && (
            <div>
              <VerificationInstructions
                method={method}
                domain={domain}
                token={currentVerification.token}
                onVerify={handleVerify}
                isVerifying={checkVerificationMutation.isPending}
              />
            </div>
          )}

          {/* Verification Status */}
          {currentStep === 4 && currentVerification && (
            <div>
              <VerificationStatus
                status={currentVerification.status as "pending" | "verified" | "failed"}
                domain={domain}
                onReset={handleReset}
              />
            </div>
          )}

          {/* Verification History */}
          {currentStep === 1 && (
            <div className="max-w-3xl mx-auto pt-8">
              <VerificationHistory records={verifications} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
