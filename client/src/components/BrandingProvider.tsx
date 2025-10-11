import { useEffect } from 'react';
import { useConfig } from '@/hooks/use-config';

// Convert hex color to HSL format
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { data: config } = useConfig();

  useEffect(() => {
    if (config?.branding) {
      const root = document.documentElement;
      
      // Apply primary color if configured
      if (config.branding.primaryColor) {
        try {
          const primaryHSL = hexToHSL(config.branding.primaryColor);
          root.style.setProperty('--primary', primaryHSL);
          root.style.setProperty('--sidebar-primary', primaryHSL);
          root.style.setProperty('--ring', primaryHSL);
          root.style.setProperty('--sidebar-ring', primaryHSL);
        } catch (error) {
          console.error('Failed to parse primary color:', error);
        }
      }
      
      // Apply accent color if configured
      if (config.branding.accentColor) {
        try {
          const accentHSL = hexToHSL(config.branding.accentColor);
          // You can use accent color for other UI elements if needed
          // For now, we'll keep it simple
        } catch (error) {
          console.error('Failed to parse accent color:', error);
        }
      }
    }
  }, [config]);

  return <>{children}</>;
}
