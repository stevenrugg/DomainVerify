import { useQuery } from "@tanstack/react-query";

export interface AppConfig {
  appName: string;
  branding: {
    primaryColor: string;
    accentColor: string;
    companyName: string;
    companyWebsite: string;
    supportEmail: string;
    logoUrl: string;
    logoDarkUrl: string;
  };
  features: {
    enableWebhooks: boolean;
    enableAnalytics: boolean;
  };
}

export function useConfig() {
  return useQuery<AppConfig>({
    queryKey: ['/api/config'],
    staleTime: 1000 * 60 * 60, // Cache for 1 hour (config rarely changes)
  });
}
