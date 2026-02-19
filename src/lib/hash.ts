import { type Config, configSchema, DEFAULTS } from './config';

export function serializeConfig(cfg: Config): string {
  const obj: Record<string, unknown> = { domain: cfg.domain, mode: cfg.mode };
  if (cfg.mode === 'alpha') obj.length = cfg.length ?? DEFAULTS.length;
  if (cfg.mode === 'word') obj.wordCount = cfg.wordCount ?? DEFAULTS.wordCount;
  return btoa(JSON.stringify(obj));
}

export function deserializeConfig(hash: string): Config {
  if (!hash) return { ...DEFAULTS };
  try {
    const raw = JSON.parse(atob(hash.substring(1)));
    const result = configSchema.safeParse(raw);
    if (result.success) return result.data;

    const partial = raw as Partial<Config>;
    return {
      domain: configSchema.shape.domain.safeParse(partial.domain).success
        ? (partial.domain as string)
        : DEFAULTS.domain,
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
  } catch {
    return { ...DEFAULTS };
  }
}
