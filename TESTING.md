# XpenseGem Backend Testing

This document describes the unit testing setup and comprehensive tests implemented for the XpenseGem backend application.

## Test Configuration

The project uses **Jest** as the test runner. Configuration is located in `jest.config.js`.

### Key Configuration:

- **Test Environment**: `node`
- **Root Directory**: `src`
- **Test Regex**: `.*\.spec\.ts$`
- **Path Mapping**: `@/(.*)` -> `src/$1` (configured via `moduleNameMapper`)

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test src/modules/transactions/services/transactions.service.spec.ts

# Run with coverage
pnpm test:cov
```

## Comprehensive Unit Tests

### 1. Transactions Service (`src/modules/transactions/services/transactions.service.spec.ts`)

**Tests:**

- **Create**: Verifies transaction creation with correct repository insertion.
- **Find All**: Tests pagination, sorting, and search filtering.
- **Find One**: Tests retrieval by ID with ownership validation.
- **Update**: Tests modification with ownership check.
- **Remove**: Tests deletion with ownership check.

**Mocking Strategy:**

- `TransactionEntity` repository is mocked using `getRepositoryToken`.
- All repository methods (`insert`, `findAndCount`, `findOneOrFail`, `update`, `delete`) are mocked.

### 2. Auth Service (`src/modules/auth/auth.service.spec.ts`)

**Tests:**

- **Sign In**: Validates credentials and token generation.
- **Sign Up**: Tests user creation and email notification.
- **Refresh Token**: Validates refresh token matching and new token generation.
- **Forgot Password**: Tests reset token generation and email sending.
- **Reset Password**: Tests password update with valid token.
- **Continue With Provider**: Tests Google OAuth integration (existing user and new user creation).

**Mocking Strategy:**

- `UserEntity` repository, `TokenService`, `EmailService`, `AwsS3Service`, and `ConfigService` are mocked.
- `axios` is mocked to prevent real HTTP calls during provider image download.

### 3. Transaction Summary Service (`src/modules/transaction-summary/services/transaction-summary.service.spec.ts`)

**Tests:**

- **Get Summary**: Verifies summary calculation for the current month.
- **Account Filtering**: Tests filtering by specific account ID.
- **Date Range**: Tests custom date range handling.

**Mocking Strategy:**

- `TransactionEntity` repository is mocked.
- Query builder methods (`createQueryBuilder`, `select`, `andWhere`, `getRawOne`, `getRawMany`) are mocked to simulate database queries.

### 4. Transactions Controller (`src/modules/transactions/controllers/transactions.controller.spec.ts`)

**Tests:**

- **Create**: Tests HTTP request handling for transaction creation.
- **Find All**: Tests pagination query handling.
- **Find One**: Tests single transaction retrieval.
- **Update**: Tests update request handling.
- **Remove**: Tests delete request handling.

**Mocking Strategy:**

- `TransactionsService` is mocked entirely.
- `IJwtPayload` is used to simulate authenticated requests.

### 5. App Controller (`src/app.controller.spec.ts`)

**Tests:**

- **Health Check**: Verifies the health-check endpoint returns success.

## Bug Fixes

During testing, a bug was identified and fixed in `src/modules/auth/services/auth.service.ts`:

**Issue**: In `continueWithProvider`, when a new user is created, the code attempted to access `user.id` where `user` was `null`.

**Fix**: The service now correctly captures the inserted user's ID from the `InsertResult` and uses it for token generation.

```typescript
// Before (buggy)
if (!user) {
  await this.userRepository.insert({...});
  // user is still null here
}
return this.tokenService.generateAuthTokens({ id: user.id, ... }); // Crashes

// After (fixed)
if (!user) {
  const insertResult = await this.userRepository.insert({...});
  user = { id: insertResult.raw[0].id, email: userJwt.email } as UserEntity;
}
return this.tokenService.generateAuthTokens({ id: user.id, ... });
```

## Testing Best Practices

1. **Isolation**: Each test should be independent. Use `beforeEach` to reset mocks.
2. **Mocking Dependencies**: All external dependencies (repositories, services, config) should be mocked.
3. **Coverage**: Aim for high coverage on business logic (services) and critical controllers.
4. **Error Handling**: Test both success and failure paths (e.g., `DocumentNotFoundException`).

## Future Improvements

- Add E2E tests for API endpoints using `supertest`.
- Increase coverage for controller layers.
- Add integration tests for database operations (using a test database).
