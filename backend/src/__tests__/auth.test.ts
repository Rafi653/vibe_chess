import request from 'supertest';
import express, { Express } from 'express';
import authRoutes from '../routes/auth';
import { connectTestDB, closeTestDB, clearTestDB } from './testDb';
import { User } from '../models/User';

describe('Auth Routes', () => {
  let app: Express;

  beforeAll(async () => {
    await connectTestDB();
    
    // Set up Express app with auth routes
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  afterAll(async () => {
    await closeTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/auth/register', () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe(validUser.username);
      expect(response.body.user.email).toBe(validUser.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.message).toBe('User created successfully');
    });

    it('should return error if username is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(400);

      expect(response.body.error).toBe('All fields are required');
    });

    it('should return error if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password123' })
        .expect(400);

      expect(response.body.error).toBe('All fields are required');
    });

    it('should return error if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@example.com' })
        .expect(400);

      expect(response.body.error).toBe('All fields are required');
    });

    it('should return error if password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', email: 'test@example.com', password: '12345' })
        .expect(400);

      expect(response.body.error).toBe('Password must be at least 6 characters');
    });

    it('should return error if email is already registered', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(400);

      expect(response.body.error).toBe('Email already registered');
    });

    it('should return error if username is already taken', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: validUser.username,
          email: 'different@example.com',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.error).toBe('Username already taken');
    });

    it('should hash password before saving', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const user = await User.findOne({ email: validUser.email });
      expect(user?.password).not.toBe(validUser.password);
      expect(user?.password.length).toBeGreaterThan(20); // bcrypt hashes are longer
    });

    it('should initialize user stats to zero', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser)
        .expect(201);

      expect(response.body.user.stats).toEqual({
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        gamesDrawn: 0,
      });
    });
  });

  describe('POST /api/auth/login', () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    beforeEach(async () => {
      // Register a user before each login test
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(validUser.email);
      expect(response.body.message).toBe('Login successful');
    });

    it('should return error if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: validUser.password })
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });

    it('should return error if password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email })
        .expect(400);

      expect(response.body.error).toBe('Email and password are required');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return error for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'wrongpassword' })
        .expect(401);

      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return user without password field', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      expect(response.body.user).not.toHaveProperty('password');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token: string;
    let userId: string;

    beforeEach(async () => {
      // Register and login to get token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
      
      token = registerResponse.body.token;
      userId = registerResponse.body.user.id;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.username).toBe('testuser');
      expect(response.body.email).toBe('test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token: string;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
      
      token = registerResponse.body.token;
    });

    it('should update username', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'newusername' })
        .expect(200);

      expect(response.body.user.username).toBe('newusername');
      expect(response.body.message).toBe('Profile updated successfully');
    });

    it('should update avatar', async () => {
      const newAvatar = 'https://example.com/avatar.png';
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ avatar: newAvatar })
        .expect(200);

      expect(response.body.user.avatar).toBe(newAvatar);
    });

    it('should not allow duplicate username', async () => {
      // Register another user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123',
        });

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'existinguser' })
        .expect(400);

      expect(response.body.error).toBe('Username already taken');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({ username: 'newusername' })
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });
  });

  describe('GET /api/auth/user/:userId', () => {
    let userId: string;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
      
      userId = registerResponse.body.user.id;
    });

    it('should get public user profile', async () => {
      const response = await request(app)
        .get(`/api/auth/user/${userId}`)
        .expect(200);

      expect(response.body.username).toBe('testuser');
      expect(response.body).toHaveProperty('stats');
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('email'); // Email should not be public
    });

    it('should return error for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/auth/user/${fakeId}`)
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });

    it('should return error for invalid user ID format', async () => {
      const response = await request(app)
        .get('/api/auth/user/invalid-id')
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });
});
