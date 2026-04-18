import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./database/schema";

const getDb = () => drizzle(env.DB, { schema });

export const createAuth = (baseURL: string) =>
  betterAuth({
    database: drizzleAdapter(getDb(), { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
    secret: (env.BETTER_AUTH_SECRET as string) || "voiceos-dev-secret-change-in-prod",
    baseURL,
    trustedOrigins: async (request) => {
      const origin = request?.headers.get("origin");
      if (origin) return [origin];
      return [];
    },
  });

export const auth = createAuth("http://localhost:5682");
