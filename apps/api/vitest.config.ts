import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      API_URL: 'http://localhost:4000',
      CLIENT_URL: 'http://localhost:5173',
      DATABASE_URL: 'postgresql://felix:felix@localhost:5432/felix_boilerplate_test?schema=public',
      JWT_ACCESS_SECRET: 'test_access_secret_min_32_characters_long',
      JWT_REFRESH_SECRET: 'test_refresh_secret_min_32_characters_long',
      STRIPE_SECRET_KEY: 'sk_test_placeholder',
      STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
    },
  },
});
