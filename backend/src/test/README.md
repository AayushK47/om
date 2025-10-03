# Backend Testing

This directory contains comprehensive tests for the food order backend API using Vitest.

## Test Structure

### Integration Tests (`integration/`)
- **`api.test.ts`** - End-to-end API tests covering the complete order flow
  - Order creation with validation
  - Order management (status updates, payment updates)
  - Error handling and edge cases

### Validation Tests (`validation/`)
- **`validation.test.ts`** - Tests for class-validator DTOs
  - Phone number validation
  - Customer name validation
  - Order item validation
  - Payment mode validation

## Running Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI
npm run test:ui

# Run specific test files
npx vitest run src/test/integration/api.test.ts
npx vitest run src/test/validation/validation.test.ts
```

## Test Philosophy

These tests focus on **meaningful functionality** rather than maximizing code coverage:

1. **Integration Tests** - Test complete user workflows and API contracts
2. **Validation Tests** - Ensure data integrity and proper error handling
3. **Real Database** - Uses actual SQLite database for realistic testing
4. **Clean State** - Each test runs with a clean database state

## Key Features Tested

- ✅ Order creation with phone number validation
- ✅ Order status and payment updates
- ✅ Data validation with class-validator
- ✅ Error handling and edge cases
- ✅ Database operations and associations
- ✅ API response formats and status codes

## Test Data

Tests use the sample menu items created during database initialization, ensuring realistic test scenarios without requiring external test data setup.
