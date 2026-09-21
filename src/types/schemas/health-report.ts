import { z } from "zod";

// Public SEO Health Report input. `domain` accepts a bare domain or a full URL;
// it is normalized and SSRF-validated server-side before any crawl. `email` is
// optional and only captured/logged for the MVP (no email is sent).
export const healthReportRequestSchema = z.object({
  domain: z.string().min(1, "Alan adı gerekli").max(2048),
  email: z.string().email().max(320).optional().or(z.literal("")),
});

export type HealthReportRequest = z.infer<typeof healthReportRequestSchema>;
