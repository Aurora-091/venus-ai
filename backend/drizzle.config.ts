import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './backend/api/database/schema.ts',
  out: './backend/api/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
});
