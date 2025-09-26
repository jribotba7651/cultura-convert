/**
 * Security provider component for monitoring and managing application security
 */

import React, { useEffect } from 'react';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import { securityMonitor } from '@/utils/securityMonitoring';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { trackActivity } = useActivityTracker();
  const { toast } = useToast();
  const { language } = useLanguage();

  // Set up security event listeners
  useEffect(() => {
    const handleSecurityAlert = (event: Event) => {
      const securityEvent = (event as CustomEvent).detail;
      
      // Show user-friendly security notifications
      if (securityEvent.severity === 'high' || securityEvent.severity === 'critical') {
        toast({
          variant: "destructive",
          title: language === 'es' ? 'Alerta de Seguridad' : 'Security Alert',
          description: language === 'es' 
            ? 'Se ha detectado actividad sospechosa. Por favor, verifica tu cuenta.'
            : 'Suspicious activity detected. Please verify your account.',
        });
      }
    };

    const handleSessionTimeout = (event: Event) => {
      const timeoutEvent = (event as CustomEvent).detail;
      
      toast({
        variant: "destructive",
        title: language === 'es' ? 'Sesión Expirada' : 'Session Expired',
        description: language === 'es' 
          ? 'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.'
          : 'Your session has expired due to inactivity. Please sign in again.',
      });
    };

    // Listen for security events
    window.addEventListener('securityAlert', handleSecurityAlert);
    window.addEventListener('sessionTimeout', handleSessionTimeout);

    // Clean up expired security monitoring data periodically
    const cleanupInterval = setInterval(() => {
      // The security monitor handles its own cleanup
      securityMonitor.getMetrics(); // This triggers internal cleanup
    }, 15 * 60 * 1000); // Every 15 minutes

    return () => {
      window.removeEventListener('securityAlert', handleSecurityAlert);
      window.removeEventListener('sessionTimeout', handleSessionTimeout);
      clearInterval(cleanupInterval);
    };
  }, [toast, language]);

  return (
    <>
      {children}
    </>
  );
};