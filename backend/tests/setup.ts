// Test setup file
// Add any global test configuration here

// Set test environment
process.env.NODE_ENV = 'test';

// Increase test timeout for async operations
jest.setTimeout(10000);

// Clean up after all tests
afterAll(async () => {
  // Add any global cleanup here
});
