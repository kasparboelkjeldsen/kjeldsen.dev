/**
 * Normalizes and sanitizes client IP addresses for Umbraco Engage.
 * 
 * Handles:
 * - IPv6-mapped IPv4 addresses (::ffff:192.168.1.1 → 192.168.1.1)
 * - IPv4 with port numbers (192.168.1.1:8080 → 192.168.1.1)
 * - IPv6 localhost (::1 → 127.0.0.1)
 * - Empty/invalid fallback (uses 127.0.0.1 instead of 0.0.0.0)
 * - Trims whitespace and validates format
 */

const IPV4_MAPPED_PREFIX = '::ffff:'

/**
 * Normalizes a client IP address to a format acceptable by Umbraco Engage.
 * 
 * @param ip - Raw IP address string (may include IPv6-mapped format)
 * @returns Normalized IPv4 address string
 */
export function normalizeClientIp(ip: string | undefined | null): string {
  if (!ip || typeof ip !== 'string') {
    return '127.0.0.1'
  }

  let normalized = ip.trim()

  // Empty after trim
  if (!normalized) {
    return '127.0.0.1'
  }

  // Handle IPv6-mapped IPv4 (::ffff:192.168.1.1 → 192.168.1.1)
  if (normalized.toLowerCase().startsWith(IPV4_MAPPED_PREFIX)) {
    normalized = normalized.substring(IPV4_MAPPED_PREFIX.length)
  }

  // Strip port number if present (e.g., 192.168.1.1:8080 → 192.168.1.1)
  const portIndex = normalized.lastIndexOf(':')
  if (portIndex > 0 && !normalized.includes('[')) {
    // Only strip if it looks like a port (after the last colon is digits)
    const potentialPort = normalized.substring(portIndex + 1)
    if (/^\d+$/.test(potentialPort)) {
      normalized = normalized.substring(0, portIndex)
    }
  }

  // Handle IPv6 localhost
  if (normalized === '::1') {
    return '127.0.0.1'
  }

  // Reject 0.0.0.0 as it's commonly invalid
  if (normalized === '0.0.0.0') {
    return '127.0.0.1'
  }

  // Basic IPv4 validation - must have at least one dot and numbers
  // This is a loose check; Engage will do stricter validation
  const ipv4Pattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
  if (!ipv4Pattern.test(normalized)) {
    // Could be a valid IPv6 we can't handle, or garbage - use fallback
    console.warn(`[engage/ip] Non-IPv4 address, using fallback: ${normalized}`)
    return '127.0.0.1'
  }

  return normalized
}

/**
 * Extracts and normalizes the client IP from request headers and socket.
 * 
 * @param headers - Request headers object
 * @param socketAddress - Optional socket remote address
 * @returns Normalized client IP address
 */
export function getRemoteClientAddress(
  headers: { 'x-forwarded-for'?: string | string[] },
  socketAddress?: string
): string {
  const forwardedFor = headers['x-forwarded-for']
  const forwardedIp = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(',')[0]?.trim()
  
  return normalizeClientIp(forwardedIp || socketAddress)
}
