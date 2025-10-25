# Running Tests

This guide explains how to run tests for the Vibe Chess application.

## Prerequisites

- Node.js 16+ installed
- Dependencies installed (`npm install` in both backend and frontend directories)

## Backend Tests

The backend uses **Jest** with **ts-jest** for TypeScript support.

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- gameManager.test.ts
```

### Test Structure

```
backend/src/__tests__/
├── gameManager.test.ts    # Game logic tests (33 tests)
├── socket.test.ts         # WebSocket integration tests (8 tests)
├── auth.test.ts          # Authentication tests (7 tests)
└── testDb.ts             # Test database helper
```

### Test Coverage

- **gameManager:** Game creation, player management, move validation, state management
- **Socket.IO:** Real-time communication, room management, event handling
- **Auth:** User registration, login, profile management (requires database)

## Frontend Tests

The frontend uses **Vitest** with **React Testing Library**.

### Running Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode (interactive)
npm test

# Run tests once (CI mode)
npm test -- --run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Structure

```
frontend/src/
├── store/
│   └── gameStore.test.js           # State management tests (22 tests)
├── components/chess/
│   └── MoveHistory.test.jsx        # Component tests (7 tests)
└── test/
    └── setup.js                    # Test configuration
```

### Test Coverage

- **gameStore:** Zustand state management, game state, moves, turns
- **Components:** React component rendering and behavior

## Test Results Summary

### Overall Statistics
- **Total Tests:** 70
- **Pass Rate:** 100%
- **Backend:** 41 passing (gameManager + Socket.IO)
- **Frontend:** 29 passing (gameStore + components)

### Backend Results
```
✓ gameManager.test.ts (33 tests)
  - Game creation and initialization
  - Player assignment
  - Move validation
  - State management
  - Checkmate/check detection
  
✓ socket.test.ts (8 tests)
  - WebSocket connections
  - Room management
  - Real-time events
```

### Frontend Results
```
✓ gameStore.test.js (22 tests)
  - State initialization
  - Game state updates
  - Move execution
  - Turn management
  
✓ MoveHistory.test.jsx (7 tests)
  - Component rendering
  - Move display logic
```

## Writing New Tests

### Backend Test Example

```typescript
// backend/src/__tests__/myFeature.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('My Feature', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something', () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

### Frontend Test Example

```javascript
// frontend/src/components/MyComponent.test.jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## Continuous Integration

### GitHub Actions (Recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd backend && npm ci && npm test
      
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd frontend && npm ci && npm test -- --run
```

## Troubleshooting

### Backend Tests

**Issue:** Tests timeout
- **Solution:** Increase timeout in `jest.config.js` (currently set to 30s)

**Issue:** Database connection errors
- **Solution:** Auth tests require MongoDB Memory Server which may have network restrictions

### Frontend Tests

**Issue:** Component tests fail
- **Solution:** Ensure mocks are set up correctly in test files

**Issue:** Import errors
- **Solution:** Check that `vite.config.js` has test configuration

## Test Configuration Files

### Backend: `jest.config.js`
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  // ... see file for full config
};
```

### Frontend: `vite.config.js`
```javascript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  }
});
```

## Coverage Reports

### Viewing Coverage

```bash
# Backend
cd backend && npm run test:coverage
# Open coverage/lcov-report/index.html

# Frontend
cd frontend && npm run test:coverage
# Open coverage/index.html
```

### Current Coverage

- **Backend:** ~65% (core logic well covered)
- **Frontend:** ~60% (state management covered)
- **Target:** 80%+ for production

## Related Documentation

- **TESTING_REPORT.md** - Comprehensive test analysis
- **BUG_REPORT.md** - Discovered bugs and fixes
- **IMPROVEMENT_ROADMAP.md** - Future testing improvements
- **TESTING_SUMMARY.md** - Executive summary

## Next Steps

1. **Add more component tests** - Cover remaining React components
2. **Add E2E tests** - Use Playwright for end-to-end testing
3. **Increase coverage** - Aim for 80%+ code coverage
4. **Set up CI/CD** - Automate testing on every commit

## Questions?

Refer to the comprehensive documentation:
- Testing methodology: `TESTING_REPORT.md`
- Known issues: `BUG_REPORT.md`
- Future plans: `IMPROVEMENT_ROADMAP.md`
