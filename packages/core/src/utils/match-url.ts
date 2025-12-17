import type { GlobalConfig } from '../types';

function normalizePrefix(prefix: string): string {
  const trimmed = prefix.trim();
  if (!trimmed) return '';

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  // Remove trailing slash (except for root)
  return withLeadingSlash.length > 1 && withLeadingSlash.endsWith('/')
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

export function applyMatchConfig(url: string, config: GlobalConfig): string {
  const prefixes = config.match?.stripPrefixes;
  if (!prefixes || prefixes.length === 0) return url;

  // Preserve query/hash segments; only rewrite pathname.
  const hashIndex = url.indexOf('#');
  const urlWithoutHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : '';

  const queryIndex = urlWithoutHash.indexOf('?');
  const pathname = queryIndex >= 0 ? urlWithoutHash.slice(0, queryIndex) : urlWithoutHash;
  const search = queryIndex >= 0 ? urlWithoutHash.slice(queryIndex) : '';

  let nextPathname = pathname;

  for (const rawPrefix of prefixes) {
    if (typeof rawPrefix !== 'string') continue;
    const prefix = normalizePrefix(rawPrefix);
    if (!prefix || prefix === '/') continue;

    if (nextPathname === prefix) {
      nextPathname = '/';
      continue;
    }

    if (nextPathname.startsWith(prefix + '/')) {
      nextPathname = nextPathname.slice(prefix.length);
    }
  }

  return `${nextPathname}${search}${hash}`;
}

