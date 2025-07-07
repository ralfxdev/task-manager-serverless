// Jest setup file for test configuration
// This file is executed before each test file

// Set up global test environment
process.env.NODE_ENV = 'test';

// Mock console methods to avoid noise in test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Restore console methods after each test
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock AWS SDK if needed
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn()
  },
  PutCommand: jest.fn(),
  UpdateCommand: jest.fn(),
  DeleteCommand: jest.fn(),
  ScanCommand: jest.fn(),
  QueryCommand: jest.fn()
}));
