/**
 * Test users. Override via env for CI / other envs:
 *   TEST_USER=foo TEST_PASS=bar npx playwright test
 */
export const testUser = {
  username: process.env.TEST_USER || 'vtr.uv',
  password: process.env.TEST_PASS || '9841021333',
};
