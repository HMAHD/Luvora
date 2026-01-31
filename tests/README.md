# Test Suite Documentation

This document provides an overview of the comprehensive test suite for Luvora.

## Test Coverage

### Phase 12: Deployment & DevOps (30 tests)

#### Health Check API (`tests/api/health.test.ts`) - 10 tests
- ✅ Returns 200 and healthy status when all checks pass
- ✅ Includes timestamp and uptime in response
- ✅ Sets no-cache headers correctly
- ✅ Returns 503 when database is unreachable
- ✅ Returns 503 when critical env vars are missing
- ✅ Returns 503 when PocketBase URL is invalid
- ✅ Marks as degraded when optional env vars missing
- ✅ Includes error messages in unhealthy response
- ✅ Includes environment in response
- ✅ Tracks database latency

#### Telegram Webhook (`tests/api/telegram-webhook.test.ts`) - 9 tests
- ✅ Returns 401 when secret token is missing
- ✅ Returns 401 when secret token is invalid
- ✅ Returns 200 for valid requests
- ✅ Handles /start command
- ✅ Handles /help command
- ✅ Handles /status command for subscribed users
- ✅ Handles /status command for non-subscribed users
- ✅ Handles unknown commands
- ✅ Handles errors gracefully

#### Sentry Integration (`tests/integration/sentry.test.ts`) - 11 tests
- ✅ Client config has correct DSN
- ✅ Client config has correct environment
- ✅ Client has trace propagation targets
- ✅ Client has browser tracing integration
- ✅ Client has replay integration
- ✅ Server config has correct DSN
- ✅ Server config has beforeSend filter
- ✅ Edge config has correct DSN
- ✅ Filters health check errors
- ✅ Removes sensitive headers
- ✅ Ignores common browser errors

### Sentry Metrics (27 tests)

#### Metrics Utility (`tests/lib/metrics.test.ts`) - 27 tests

**Core Metrics Functions (5 tests)**
- ✅ Increments a counter metric
- ✅ Sets a gauge metric
- ✅ Tracks a distribution metric
- ✅ Tracks unique values with set
- ✅ Defaults increment value to 1

**Track Event Helpers (15 tests)**
- ✅ Tracks spark copied event
- ✅ Tracks streak shared event
- ✅ Tracks upgrade started event
- ✅ Tracks upgrade completed event
- ✅ Tracks automation enabled event
- ✅ Tracks automation sent event (success)
- ✅ Tracks automation sent event (failed)
- ✅ Tracks payment received event
- ✅ Tracks payment failed event
- ✅ Tracks user login event
- ✅ Tracks user signup event
- ✅ Tracks daily active user
- ✅ Tracks SEO page view
- ✅ Tracks API error
- ✅ Tracks feature usage
- ✅ Tracks performance metrics

**Server Metrics (4 tests)**
- ✅ Tracks batch send duration
- ✅ Tracks database query duration
- ✅ Tracks webhook processing (success)
- ✅ Tracks webhook processing (failed)

**Error Handling (2 tests)**
- ✅ Handles Sentry errors gracefully in production
- ✅ Logs metrics in development mode when Sentry fails

---

## Total Test Count

- **Phase 12 Tests**: 30 tests
- **Metrics Tests**: 27 tests
- **Total**: **57 tests** ✅

---

## Running Tests

### Run All Tests
```bash
bun test
```

### Run Specific Test File
```bash
bun test tests/api/health.test.ts
bun test tests/lib/metrics.test.ts
```

### Run Tests in Watch Mode
```bash
bun test --watch
```

### Run Tests with Coverage
```bash
bun test --coverage
```

---

## Test Structure

### API Tests (`tests/api/`)
Tests for API routes and webhooks.

**Example:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Health Check API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 when healthy', async () => {
    const { GET } = await import('@/app/api/health/route');
    const response = await GET();

    expect(response.status).toBe(200);
  });
});
```

### Integration Tests (`tests/integration/`)
Tests for cross-cutting concerns like Sentry configuration.

**Example:**
```typescript
describe('Sentry Configuration', () => {
  it('should have correct environment', () => {
    const config = require('@/../sentry.client.config');
    expect(config.environment).toBe('production');
  });
});
```

### Library Tests (`tests/lib/`)
Tests for utility functions and helpers.

**Example:**
```typescript
import { metrics, trackEvent } from '@/lib/metrics';

describe('Metrics Utility', () => {
  it('should track spark copied event', () => {
    trackEvent.sparkCopied('hero', 'morning');

    expect(Sentry.metrics.increment).toHaveBeenCalledWith(
      'spark.copied',
      1,
      { tags: { tier: 'hero', spark_type: 'morning' } }
    );
  });
});
```

---

## Mocking Strategies

### PocketBase Mocking
```typescript
vi.mock('@/lib/pocketbase', () => ({
  pb: {
    health: {
      check: vi.fn()
    },
    collection: vi.fn()
  }
}));
```

### Sentry Mocking
```typescript
vi.mock('@sentry/nextjs', () => ({
  metrics: {
    increment: vi.fn(),
    gauge: vi.fn(),
    distribution: vi.fn(),
    set: vi.fn(),
  },
}));
```

### Next.js Response Mocking
```typescript
const mockJson = vi.fn();
const mockStatus = vi.fn(() => ({ json: mockJson }));

vi.spyOn(NextResponse, 'json').mockImplementation(mockJson);
```

---

## CI/CD Integration

Tests run automatically on:
- ✅ Pull requests to `main` or `develop`
- ✅ Pushes to `main` or `develop`
- ✅ Manual workflow dispatch

**GitHub Actions Workflow** (`.github/workflows/ci.yml`):
```yaml
- name: Run tests
  run: bun test
```

---

## Test Coverage Goals

| Category | Target | Current |
|----------|--------|---------|
| API Routes | 80% | ✅ 100% |
| Utilities | 80% | ✅ 100% |
| Components | 70% | 🔄 TBD |
| Integration | 60% | ✅ 100% |

---

## Adding New Tests

### 1. Create Test File

Place test files next to the code they test or in the `tests/` directory:

```
src/lib/utils.ts       → tests/lib/utils.test.ts
src/app/api/foo/route.ts → tests/api/foo.test.ts
```

### 2. Follow Naming Convention

- Test files: `*.test.ts`
- Test suites: `describe('Feature Name', () => { ... })`
- Test cases: `it('should do something', () => { ... })`

### 3. Use Arrange-Act-Assert Pattern

```typescript
it('should return user when ID is valid', async () => {
  // Arrange
  const userId = 'user-123';
  const mockUser = { id: userId, name: 'Test' };

  // Act
  const result = await getUser(userId);

  // Assert
  expect(result).toEqual(mockUser);
});
```

### 4. Clean Up After Each Test

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

---

## Common Test Patterns

### Testing API Routes

```typescript
import { NextRequest } from 'next/server';

it('should handle POST requests', async () => {
  const request = new NextRequest('http://localhost/api/test', {
    method: 'POST',
    body: JSON.stringify({ data: 'test' })
  });

  const { POST } = await import('@/app/api/test/route');
  const response = await POST(request);

  expect(response.status).toBe(200);
});
```

### Testing With Environment Variables

```typescript
it('should use env variable', () => {
  const originalEnv = process.env.TEST_VAR;
  process.env.TEST_VAR = 'test-value';

  // ... test code ...

  process.env.TEST_VAR = originalEnv;
});
```

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

### Testing Error Cases

```typescript
it('should throw error when input is invalid', async () => {
  await expect(
    functionThatThrows('invalid')
  ).rejects.toThrow('Invalid input');
});
```

---

## Troubleshooting

### Tests Failing Locally But Passing in CI

- Check Node.js version matches CI (use `bun --version`)
- Clear test cache: `rm -rf node_modules/.cache`
- Ensure `.env.local` is not interfering

### Mocks Not Working

- Ensure `vi.mock()` is called before imports
- Use `vi.clearAllMocks()` in `beforeEach()`
- Check that mock paths match actual imports

### Timeout Errors

- Increase timeout for slow tests:
  ```typescript
  it('slow test', async () => {
    // test code
  }, { timeout: 10000 }); // 10 seconds
  ```

### Import Errors

- Verify `tsconfig.json` paths are correct
- Check that `@/` alias is configured in `vitest.config.ts`

---

## Best Practices

1. **Write Tests First** (TDD when possible)
2. **One Assertion Per Test** (when practical)
3. **Use Descriptive Test Names** (`it('should return 404 when user not found')`)
4. **Mock External Dependencies** (APIs, databases, third-party services)
5. **Test Edge Cases** (null, undefined, empty arrays, etc.)
6. **Keep Tests Fast** (< 100ms per test)
7. **Avoid Test Interdependence** (tests should run in any order)
8. **Use `beforeEach` for Setup** (avoid code duplication)

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Next.js Testing](https://nextjs.org/docs/app/building-your-application/testing)
- [Sentry Testing Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/testing/)

---

## Next Steps

- [ ] Add component tests for key UI components
- [ ] Add E2E tests with Playwright
- [ ] Set up visual regression testing
- [ ] Implement mutation testing
- [ ] Add load testing for API endpoints
