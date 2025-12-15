/**
 * Utilities for multi-tenant functionality
 * Extracts organization context from request headers/hostnames
 */

export function getTenantFromHost(host: string): string {
  if (!host) return 'default';
  
  // Extract subdomain from host
  const parts = host.split('.');
  if (parts.length < 2) return 'default';
  
  const subdomain = parts[0];
  
  // Handle common development scenarios
  if (subdomain === 'www' || subdomain === 'app') {
    return 'default';
  }
  
  // Handle plain localhost (no subdomain)
  if (subdomain === 'localhost' || host === '127.0.0.1' || host.startsWith('127.0.0.1:')) {
    return 'default';
  }
  
  return subdomain;
}

export function getTenantFromRequest(request: Request): string {
  const host = request.headers.get('host') || '';
  return getTenantFromHost(host);
}

/**
 * Get organization ID from Next.js headers (server components)
 */
export function getTenantFromHeaders(headers: Headers): string {
  const host = headers.get('host') || '';
  return getTenantFromHost(host);
}
