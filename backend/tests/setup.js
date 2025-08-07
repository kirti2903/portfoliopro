// Test setup for backend
jest.mock('../config/database', () => ({
  pool: {
    execute: jest.fn().mockImplementation(() => {
      // Mock database error for validation tests
      if (global.mockDatabaseError) {
        throw new Error('Database validation error');
      }
      return [[], { insertId: 1, affectedRows: 1 }];
    }),
    end: jest.fn()
  }
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test setup
beforeAll(async () => {
  // Setup test database or mock connections
});

afterAll(async () => {
  // Cleanup after all tests
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});