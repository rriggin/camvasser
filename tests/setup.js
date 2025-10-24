// Test setup file
// This runs before all tests

import { beforeAll, afterAll } from 'vitest';

// Mock environment variables for tests
beforeAll(() => {
  process.env.BUDROOFING_COMPANYCAM_TOKEN = 'test-token-123';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
});

afterAll(() => {
  // Cleanup if needed
});
