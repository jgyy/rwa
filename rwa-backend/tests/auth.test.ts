import { FastifyInstance } from 'fastify';
import { build } from '../src/app';
import * as bcrypt from 'bcryptjs';

describe('Authentication Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = build({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'newuser@test.com',
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('user');
      expect(body.user.email).toBe('newuser@test.com');
      expect(body).toHaveProperty('token');
    });

    it('should reject duplicate email', async () => {
      // First registration
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'duplicate@test.com',
          password: 'SecurePass123!',
        },
      });

      // Duplicate registration
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'duplicate@test.com',
          password: 'AnotherPass123!',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('already exists');
    });

    it('should validate password strength', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'weak@test.com',
          password: '123', // Weak password
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('password');
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('TestPass123!', 10);
      // Mock user creation in database
      // await prisma.user.create({ ... })
    });

    it('should login with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'existing@test.com',
          password: 'TestPass123!',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('token');
      expect(body).toHaveProperty('refreshToken');
      expect(body).toHaveProperty('user');
    });

    it('should reject invalid password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'existing@test.com',
          password: 'WrongPassword!',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'nonexistent@test.com',
          password: 'AnyPass123!',
        },
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Invalid credentials');
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      // First login to get tokens
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'existing@test.com',
          password: 'TestPass123!',
        },
      });

      const { refreshToken } = JSON.parse(loginResponse.body);

      const response = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: { refreshToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('token');
      expect(body).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/refresh',
        payload: {
          refreshToken: 'invalid-refresh-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Protected Routes', () => {
    let authToken: string;

    beforeAll(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'existing@test.com',
          password: 'TestPass123!',
        },
      });
      const body = JSON.parse(response.body);
      authToken = body.token;
    });

    it('should access protected route with valid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/user/profile',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should reject access without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/user/profile',
      });

      expect(response.statusCode).toBe(401);
    });

    it('should reject access with invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/user/profile',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});