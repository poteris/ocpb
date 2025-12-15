'use client';
import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';

interface BrandingData {
  logoUrl?: string;
  primaryColor: string;
}

interface TenantContextType {
  organisationId: string;
  branding: BrandingData;
  refreshBranding: () => Promise<void>;
  updateBranding: (branding: Partial<BrandingData>) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ 
  children, 
  organisationId 
}: { 
  children: ReactNode; 
  organisationId: string;
}) {
  const [branding, setBranding] = useState<BrandingData>({
    primaryColor: '#1e3a8a',
  });

  const refreshBranding = useCallback(async () => {
    try {
      const response = await fetch(`/api/organizations/${organisationId}/branding`);
      if (response.ok) {
        const data = await response.json();
        setBranding({
          logoUrl: data.logoUrl,
          primaryColor: data.primaryColor || '#1e3a8a',
        });
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    }
  }, [organisationId]);

  const updateBranding = (newBranding: Partial<BrandingData>) => {
    setBranding(prev => ({ ...prev, ...newBranding }));
  };

  useEffect(() => {
    refreshBranding();
  }, [organisationId, refreshBranding]);

  // Apply CSS custom properties for dynamic theming
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--org-primary', branding.primaryColor);
    }
  }, [branding]);

  return (
    <TenantContext.Provider value={{ 
      organisationId, 
      branding, 
      refreshBranding, 
      updateBranding 
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}
