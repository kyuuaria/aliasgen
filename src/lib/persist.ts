import { type Config, configSchema, DEFAULTS } from './config';

const STORAGE_KEY = 'alias-gen-config';

export function loadConfig(hash: string): Config {
  return parseBase64(stripHash(hash)) ?? parseJSON(readStorage()) ?? { ...DEFAULTS };
}

export function saveConfig(cfg: Config): string {
  const obj = toPlainObject(cfg);
  writeStorage(JSON.stringify(obj));
  return btoa(JSON.stringify(obj));
}

// --- Internals ---

function toPlainObject(cfg: Config): Record<string, unknown> {
  const obj: Record<string, unknown> = { domain: cfg.domain, mode: cfg.mode };
  if (cfg.mode === 'alpha') obj.length = cfg.length ?? DEFAULTS.length;
  if (cfg.mode === 'word') obj.wordCount = cfg.wordCount ?? DEFAULTS.wordCount;
  return obj;
}

function parseBase64(encoded: string): Config | null {
  if (!encoded) return null;
  try {
    return parseJSON(atob(encoded));
  } catch {
    return null;
  }
}

function parseJSON(json: string): Config | null {
  if (!json) return null;
  try {
    return validateConfig(JSON.parse(json));
  } catch {
    return null;
  }
}

function validateConfig(raw: unknown): Config | null {
  const result = configSchema.safeParse(raw);
  if (result.success) return result.data;

  const partial = raw as Partial<Config>;
  return {
    domain: configSchema.shape.domain.safeParse(partial.domain).success ? (partial.domain as string) : DEFAULTS.domain,
    mode: configSchema.shape.mode.safeParse(partial.mode).success ? (partial.mode as Config['mode']) : DEFAULTS.mode,
    length:
      partial.mode === 'alpha' && configSchema.shape.length.safeParse(partial.length).success
        ? (partial.length as number)
        : DEFAULTS.length,
    wordCount:
      partial.mode === 'word' && configSchema.shape.wordCount.safeParse(partial.wordCount).success
        ? (partial.wordCount as number)
        : DEFAULTS.wordCount
  };
}

function stripHash(s: string): string {
  return s.startsWith('#') ? s.substring(1) : s;
}

function readStorage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function writeStorage(json: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, json);
  } catch {}
}
