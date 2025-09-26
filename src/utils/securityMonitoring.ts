/**
 * Security monitoring and alerting utilities
 */

import { safeLog } from './dataMasking';

interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details: any;
  timestamp: string;
}

interface SecurityMetrics {
  failedLogins: Map<string, number>;
  suspiciousActivity: Map<string, SecurityEvent[]>;
  rateLimitViolations: Map<string, number>;
  lastReset: number;
}

class SecurityMonitor {
  private metrics: SecurityMetrics = {
    failedLogins: new Map(),
    suspiciousActivity: new Map(),
    rateLimitViolations: new Map(),
    lastReset: Date.now()
  };

  private readonly MAX_FAILED_LOGINS = 5;
  private readonly MONITORING_WINDOW = 60 * 60 * 1000; // 1 hour
  private readonly SUSPICIOUS_THRESHOLD = 10;

  /**
   * Log a security event
   */
  logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    // Log the event safely
    safeLog.warn(`Security event: ${event.type}`, {
      severity: event.severity,
      userId: event.userId ? `user_${event.userId.substring(0, 8)}***` : undefined,
      details: event.details
    });

    // Track suspicious activity
    if (event.severity === 'high' || event.severity === 'critical') {
      this.trackSuspiciousActivity(event.userId || 'anonymous', securityEvent);
    }

    // Handle specific event types
    switch (event.type) {
      case 'failed_login':
        this.handleFailedLogin(event.userId || event.ip || 'unknown');
        break;
      case 'rate_limit_exceeded':
        this.handleRateLimitViolation(event.userId || event.ip || 'unknown');
        break;
      case 'suspicious_form_submission':
        this.handleSuspiciousFormSubmission(event);
        break;
    }

    // Check if we need to trigger alerts
    this.checkAlertThresholds();
  }

  /**
   * Track failed login attempts
   */
  private handleFailedLogin(identifier: string): void {
    const current = this.metrics.failedLogins.get(identifier) || 0;
    this.metrics.failedLogins.set(identifier, current + 1);

    if (current + 1 >= this.MAX_FAILED_LOGINS) {
      this.triggerAlert({
        type: 'multiple_failed_logins',
        severity: 'high',
        details: {
          identifier,
          attemptCount: current + 1,
          threshold: this.MAX_FAILED_LOGINS
        }
      });
    }
  }

  /**
   * Track rate limit violations
   */
  private handleRateLimitViolation(identifier: string): void {
    const current = this.metrics.rateLimitViolations.get(identifier) || 0;
    this.metrics.rateLimitViolations.set(identifier, current + 1);
  }

  /**
   * Handle suspicious form submissions
   */
  private handleSuspiciousFormSubmission(event: Omit<SecurityEvent, 'timestamp'>): void {
    safeLog.error('Suspicious form submission detected', {
      type: event.type,
      details: event.details
    });

    // Could trigger additional security measures here
    // like temporary IP blocking or enhanced monitoring
  }

  /**
   * Track suspicious activity patterns
   */
  private trackSuspiciousActivity(identifier: string, event: SecurityEvent): void {
    const activities = this.metrics.suspiciousActivity.get(identifier) || [];
    activities.push(event);
    
    // Keep only recent activities (within monitoring window)
    const recent = activities.filter(
      activity => Date.now() - new Date(activity.timestamp).getTime() < this.MONITORING_WINDOW
    );
    
    this.metrics.suspiciousActivity.set(identifier, recent);

    if (recent.length >= this.SUSPICIOUS_THRESHOLD) {
      this.triggerAlert({
        type: 'suspicious_activity_pattern',
        severity: 'critical',
        details: {
          identifier,
          eventCount: recent.length,
          timeWindow: this.MONITORING_WINDOW,
          events: recent.map(e => ({ type: e.type, severity: e.severity }))
        }
      });
    }
  }

  /**
   * Check if any alert thresholds have been exceeded
   */
  private checkAlertThresholds(): void {
    // Reset metrics if monitoring window has passed
    if (Date.now() - this.metrics.lastReset > this.MONITORING_WINDOW) {
      this.resetMetrics();
    }
  }

  /**
   * Trigger a security alert
   */
  private triggerAlert(alert: Omit<SecurityEvent, 'timestamp'>): void {
    safeLog.error(`SECURITY ALERT: ${alert.type}`, {
      severity: alert.severity,
      details: alert.details
    });

    // In a production environment, this could:
    // - Send notifications to administrators
    // - Log to external security monitoring systems
    // - Trigger automated responses (rate limiting, blocking, etc.)
    
    // For now, we'll dispatch a custom event that the app can listen to
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('securityAlert', {
        detail: { ...alert, timestamp: new Date().toISOString() }
      }));
    }
  }

  /**
   * Reset monitoring metrics
   */
  private resetMetrics(): void {
    this.metrics.failedLogins.clear();
    this.metrics.rateLimitViolations.clear();
    this.metrics.suspiciousActivity.clear();
    this.metrics.lastReset = Date.now();
  }

  /**
   * Get current security metrics (for monitoring dashboards)
   */
  getMetrics(): {
    failedLoginCount: number;
    suspiciousActivityCount: number;
    rateLimitViolationCount: number;
    monitoringWindow: number;
  } {
    return {
      failedLoginCount: Array.from(this.metrics.failedLogins.values()).reduce((a, b) => a + b, 0),
      suspiciousActivityCount: Array.from(this.metrics.suspiciousActivity.values()).reduce((a, b) => a + b.length, 0),
      rateLimitViolationCount: Array.from(this.metrics.rateLimitViolations.values()).reduce((a, b) => a + b, 0),
      monitoringWindow: this.MONITORING_WINDOW
    };
  }

  /**
   * Check if an identifier is currently flagged as suspicious
   */
  isSuspicious(identifier: string): boolean {
    const failedLogins = this.metrics.failedLogins.get(identifier) || 0;
    const suspiciousActivities = this.metrics.suspiciousActivity.get(identifier) || [];
    
    return failedLogins >= this.MAX_FAILED_LOGINS || 
           suspiciousActivities.length >= this.SUSPICIOUS_THRESHOLD;
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor();

/**
 * Helper functions for common security monitoring tasks
 */
export const logFailedLogin = (userId?: string, ip?: string) => {
  securityMonitor.logSecurityEvent({
    type: 'failed_login',
    severity: 'medium',
    userId,
    ip,
    details: { reason: 'invalid_credentials' }
  });
};

export const logRateLimitExceeded = (formType: string, userId?: string, ip?: string) => {
  securityMonitor.logSecurityEvent({
    type: 'rate_limit_exceeded',
    severity: 'medium',
    userId,
    ip,
    details: { formType }
  });
};

export const logSuspiciousFormSubmission = (formType: string, reason: string, details: any) => {
  securityMonitor.logSecurityEvent({
    type: 'suspicious_form_submission',
    severity: 'high',
    details: { formType, reason, ...details }
  });
};

export const logSessionTimeout = (userId: string, reason: string) => {
  securityMonitor.logSecurityEvent({
    type: 'session_timeout',
    severity: 'low',
    userId,
    details: { reason }
  });
};
