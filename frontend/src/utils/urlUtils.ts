/**
 * URL utility functions for Government Application Portals
 * Cleans up and parses multiple URLs, text annotations, and malformed links
 * commonly found in government scheme datasets.
 */

export interface ApplicationChannel {
  name: string;
  url: string;
  isPrimary?: boolean;
}

/**
 * Extracts clean, valid HTTP/HTTPS URLs from a raw link string.
 * Handles patterns such as:
 * - "https://nha.gov.in / https://beneficiary.nha.gov.in"
 * - "https://scholarships.gov.in (National Scholarship Portal - NSP)"
 * - "https://www.indiapost.gov.in / Any Nationalised Bank"
 * - "nha.gov.in"
 */
export function parseApplicationUrls(rawLink?: string | null): ApplicationChannel[] {
  if (!rawLink || typeof rawLink !== 'string') return [];

  const text = rawLink.trim();
  if (!text) return [];

  // Match all potential URL sequences starting with http:// or https://
  const urlRegex = /(https?:\/\/[^\s\)\],"'<>]+)/gi;
  const matches = text.match(urlRegex);
  const channels: ApplicationChannel[] = [];
  const seenUrls = new Set<string>();

  if (matches && matches.length > 0) {
    matches.forEach((matchedUrl, index) => {
      // Clean trailing punctuation
      const cleanUrl = matchedUrl.replace(/[)\]/.,;:!]+$/, '').trim();
      if (cleanUrl && !seenUrls.has(cleanUrl.toLowerCase())) {
        seenUrls.add(cleanUrl.toLowerCase());

        let name = 'Official Portal';
        try {
          const parsed = new URL(cleanUrl);
          const hostname = parsed.hostname.replace(/^www\./, '');
          
          if (hostname.includes('beneficiary')) {
            name = 'Beneficiary Self-Service Portal';
          } else if (hostname.includes('pmkisan')) {
            name = 'PM-KISAN Portal';
          } else if (hostname.includes('sevasindhu')) {
            name = 'Seva Sindhu Portal (Karnataka)';
          } else if (hostname.includes('scholarships')) {
            name = 'National Scholarship Portal (NSP)';
          } else if (hostname.includes('nha.gov')) {
            name = 'National Health Authority (NHA)';
          } else {
            name = hostname;
          }
        } catch {
          name = cleanUrl;
        }

        channels.push({
          name,
          url: cleanUrl,
          isPrimary: index === 0
        });
      }
    });
  }

  // Fallback if no http:// or https:// was found but domain exists (e.g. "nha.gov.in")
  if (channels.length === 0) {
    const domainMatch = text.match(/([a-zA-Z0-9.-]+\.[a-z]{2,})/);
    if (domainMatch) {
      const host = domainMatch[1].replace(/^[./]+|[./]+$/g, '');
      channels.push({
        name: host,
        url: `https://${host}`,
        isPrimary: true
      });
    }
  }

  // Absolute fallback to national portal if empty
  if (channels.length === 0) {
    channels.push({
      name: 'National Government Portal (india.gov.in)',
      url: 'https://www.india.gov.in',
      isPrimary: true
    });
  }

  return channels;
}

/**
 * Returns the primary clean URL suitable for direct <a href> without browser navigation errors.
 */
export function getPrimaryApplicationUrl(rawLink?: string | null): string {
  const channels = parseApplicationUrls(rawLink);
  return channels[0]?.url || 'https://www.india.gov.in';
}
