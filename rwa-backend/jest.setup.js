// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db'
process.env.JWT_SECRET = 'test_jwt_secret'
process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret'

// Increase timeout for database operations
jest.setTimeout(10000)