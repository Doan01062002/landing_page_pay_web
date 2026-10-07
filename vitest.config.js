// Test máy chủ (API, database, SSR): chạy tuần tự vì dùng chung database test.
// Cần PostgreSQL: TEST_DATABASE_URL (mặc định postgres://postgres@localhost:55432/chungauto_test). Chạy: npm test
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 120000,
  },
})
