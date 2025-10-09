import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
}

interface ProgressStepsProps {
  currentStep: number;
  steps: Step[];
}

export function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  currentStep > step.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "border-primary bg-background text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
                data-testid={`step-${step.id}`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={`h-0.5 transition-all ${
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
