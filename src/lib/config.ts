import { z } from 'zod';

export const configSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain is required')
    .regex(/^[a-z0-9.-]+\.[a-z]{2,}$/, 'Invalid domain'),
  mode: z.enum(['alpha', 'word']),
  length: z.number().int().min(3).max(12).optional(),
  wordCount: z.number().int().min(1).max(3).optional()
});

export type Config = z.infer<typeof configSchema>;

export const DEFAULTS = {
  domain: 'example.com',
  mode: 'alpha',
  length: 5,
  wordCount: 1
} as const satisfies Config;

export const MODE_OPTIONS = [
  { value: 'alpha', label: 'Random characters' },
  { value: 'word', label: 'Random words' }
] as const;

export const serviceSchema = z
  .string()
  .min(1, 'Service name is required')
  .regex(/^[a-z0-9 _-]+$/i, 'Only letters, numbers, spaces, hyphens and underscores');
