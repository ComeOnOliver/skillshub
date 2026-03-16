import { z } from "zod";

export const skillSearchSchema = z.object({
  q: z.string().optional(),
  tags: z
    .string()
    .transform((s) => s.split(",").filter(Boolean))
    .optional(),
  sort: z.enum(["stars", "downloads", "recent"]).default("stars"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const createSkillSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  readme: z.string().max(50000).optional(),
  manifest: z.record(z.unknown()).optional(),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

export const updateSkillSchema = createSkillSchema.partial();

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
});

export const agentRegisterSchema = z.object({
  username: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9_-]+$/),
  displayName: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
});

export const donateSchema = z.object({
  amount: z.coerce.number().positive(),
  token: z.enum(["USDT", "USDC"]).default("USDT"),
});


