---
title: "Type-safe .env files"
pubDate: "2026-02-21"
excerpt: "While there are dedicated packages like t3-env for type safe environment variables I've been quite happy using this pattern with Zod"
---

While TS has tons of libraries like [t3-env](https://github.com/t3-oss/t3-env) for type safe environment variables I've been quite happy using this pattern with [Zod](https://zod.dev/):

`env.ts`:

```typescript
import { ZodError, z } from "zod";
const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.coerce.number(),
  DB_MAX_CONNECTIONS: z.number().default(10),
  DATABASE_URL: z.string(),
});

export type EnvSchema = z.infer<typeof EnvSchema>;
let env: EnvSchema;
try {
  env = EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = "Missing required values in .env:\n";
    error.issues.forEach((issue) => {
      message += `${String(issue.path[0])}\n`;
    });
    throw new Error(message);
  }
  throw error;
}
export default env;
```

then access the `env` object elsewhere:

```typescript
import { Pool } from "pg";
import env from "@/env";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.DB_MAX_CONNECTIONS,
});
```
