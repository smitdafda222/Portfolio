const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('GET /api/tasks', () => {
  afterAll(async () => {
    // Close the MongoDB connection after tests to prevent Jest from hanging
    await mongoose.connection.close();
  });

  it('should return a 200 OK status code', async () => {
    const response = await request(app).get('/api/tasks');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
