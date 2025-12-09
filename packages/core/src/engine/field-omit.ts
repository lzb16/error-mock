// packages/core/src/engine/field-omit.ts
import type { FieldOmitConfig } from '../types';

/**
 * Mulberry32 - High quality 32-bit seeded PRNG
 * Produces deterministic, evenly distributed random numbers
 */
function mulberry32(seed: number): () => number {
  return function() {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Deep clone with structuredClone fallback for older environments
 */
function deepClone<T>(obj: T): T {
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(obj);
    }
  } catch (e) {
    console.warn('[ErrorMock] structuredClone failed, using JSON fallback:', e);
  }

  try {
    // Fallback for environments without structuredClone
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.warn('[ErrorMock] JSON clone failed, returning original (may cause mutation):', e);
    return obj; // Last resort
  }
}

/**
 * Collect all field paths in an object up to a certain depth
 */
function collectAllPaths(
  obj: unknown,
  prefix: string,
  depthLimit: number,
  currentDepth: number
): string[] {
  const paths: string[] = [];

  if (currentDepth >= depthLimit) return paths;
  if (obj === null || obj === undefined || typeof obj !== 'object') return paths;

  const entries = Array.isArray(obj)
    ? obj.map((v, i) => [String(i), v] as const)
    : Object.entries(obj as Record<string, unknown>);

  for (const [key, value] of entries) {
    const path = prefix ? `${prefix}.${key}` : key;
    paths.push(path);

    if (value && typeof value === 'object') {
      paths.push(...collectAllPaths(value, path, depthLimit, currentDepth + 1));
    }
  }

  return paths;
}

/**
 * Apply omission to a field by path
 */
function applyOmit(
  obj: unknown,
  path: string,
  mode: 'delete' | 'undefined' | 'null'
): void {
  const parts = path.split('.');
  let current = obj as Record<string, unknown>;

  // Navigate to parent
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (current[part] === undefined || current[part] === null) {
      return; // Path doesn't exist, skip silently
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];
  if (current && typeof current === 'object' && lastPart in current) {
    switch (mode) {
      case 'delete':
        delete current[lastPart];
        break;
      case 'undefined':
        current[lastPart] = undefined;
        break;
      case 'null':
        current[lastPart] = null;
        break;
    }
  }
}

/**
 * Omit fields in manual mode
 */
function omitManual<T>(data: T, fields: string[]): T {
  for (const fieldPath of fields) {
    applyOmit(data, fieldPath, 'delete');
  }
  return data;
}

/**
 * Fisher-Yates shuffle with seeded RNG for deterministic results
 */
function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Omit fields in random mode
 */
function omitRandom<T>(data: T, config: FieldOmitConfig['random']): T {
  const rng = config.seed !== undefined
    ? mulberry32(config.seed)
    : Math.random;

  const allPaths = collectAllPaths(data, '', config.depthLimit, 0);

  // Filter out protected fields and their children
  const eligiblePaths = allPaths.filter(path => {
    return !config.excludeFields.some(excluded =>
      path === excluded || path.startsWith(`${excluded}.`)
    );
  });

  // Shuffle for more even distribution using Fisher-Yates
  const shuffled = shuffleArray(eligiblePaths, rng);

  // Select fields to omit based on probability
  let omitCount = 0;
  const toOmit: string[] = [];

  for (const path of shuffled) {
    if (omitCount >= config.maxOmitCount) break;
    if (rng() * 100 < config.probability) {
      toOmit.push(path);
      omitCount++;
    }
  }

  // Apply omissions
  for (const path of toOmit) {
    applyOmit(data, path, config.omitMode);
  }

  return data;
}

/**
 * Main entry point for field omission
 */
export function omitFields<T>(data: T, config: FieldOmitConfig): T {
  if (!config.enabled) {
    return data;
  }

  // Always deep clone to avoid mutating original
  const cloned = deepClone(data);

  if (config.mode === 'manual') {
    return omitManual(cloned, config.fields);
  }

  return omitRandom(cloned, config.random);
}
