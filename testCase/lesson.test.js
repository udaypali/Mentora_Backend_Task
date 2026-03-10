const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../Models/User');
const Lesson = require('../Models/Lesson');

const getDynamicEmail = (prefix) => `test_${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;

describe('Lesson Endpoints', () => {
    let mentor1Email = getDynamicEmail('mentor1');
    let mentor2Email = getDynamicEmail('mentor2');
    let parentEmail = getDynamicEmail('parent');

    let mentor1Token, mentor2Token, parentToken;
    let lessonId;
    let lessonTitle = `Test Lesson ${Date.now()}`;

    beforeAll(async () => {
        // 1. Create Users via Signup
        await request(app).post('/auth/signup').send({
            name: 'Mentor One', email: mentor1Email, password: 'password123', role: 'mentor'
        });
        await request(app).post('/auth/signup').send({
            name: 'Mentor Two', email: mentor2Email, password: 'password123', role: 'mentor'
        });
        await request(app).post('/auth/signup').send({
            name: 'Parent User', email: parentEmail, password: 'password123', role: 'parent'
        });

        // 2. Login to capture tokens (Normalizing for your specific response structure)
        const loginM1 = await request(app).post('/auth/login').send({ email: mentor1Email, password: 'password123' });
        const loginM2 = await request(app).post('/auth/login').send({ email: mentor2Email, password: 'password123' });
        const loginP = await request(app).post('/auth/login').send({ email: parentEmail, password: 'password123' });

        mentor1Token = loginM1.body.token || (loginM1.body.data && loginM1.body.data.token);
        mentor2Token = loginM2.body.token || (loginM2.body.data && loginM2.body.data.token);
        parentToken = loginP.body.token || (loginP.body.data && loginP.body.data.token);

        if (!mentor1Token) throw new Error("SETUP FAIL: Tokens not generated. Check login response structure.");
    });

    afterAll(async () => {
        await User.deleteMany({ email: { $regex: /test_.*@example\.com/ } });
        await Lesson.deleteMany({ title: { $regex: /Test Lesson/ } });
        await mongoose.connection.close();
    });

    describe('POST /lessons', () => {
        it('should allow a mentor to create a lesson', async () => {
            const res = await request(app)
                .post('/lessons')
                .set('Authorization', `Bearer ${mentor1Token}`)
                .send({
                    title: lessonTitle,
                    description: 'This is a test lesson'
                });

            expect(res.statusCode).toBe(201);
            // Support for different response shapes
            const body = res.body.data || res.body.Lesson || res.body.lesson || res.body;
            lessonId = body.id || body._id;
            expect(lessonId).toBeDefined();
        });

        it('should fail if parent tries to create a lesson (RBAC check)', async () => {
            const res = await request(app)
                .post('/lessons')
                .set('Authorization', `Bearer ${parentToken}`)
                .send({
                    title: `Parent Illegal Lesson ${Date.now()}`,
                    description: 'Parent test lesson'
                });
            expect(res.statusCode).toBe(403);
        });
    });

    describe('GET /lessons/:lessonId', () => {
        it('should return a specific lesson by ID', async () => {
            const res = await request(app)
                .get(`/lessons/${lessonId}`)
                .set('Authorization', `Bearer ${parentToken}`);

            expect(res.statusCode).toBe(200);
            const data = res.body.data || res.body.lesson || res.body;

            // Convert both to strings to ensure comparison works
            expect(data._id.toString()).toBe(lessonId.toString());
            expect(data.title).toBe(lessonTitle);
        });
    });

    describe('PUT /lessons/:lessonId', () => {
        it('should allow mentor to update their own lesson', async () => {
            const updatedTitle = `${lessonTitle} Updated`;
            const res = await request(app)
                .put(`/lessons/${lessonId}`)
                .set('Authorization', `Bearer ${mentor1Token}`)
                .send({
                    title: updatedTitle,
                    description: 'Updated Description'
                });

            expect(res.statusCode).toBe(200);
            const data = res.body.data || res.body.lesson || res.body;
            expect(data.title).toBe(updatedTitle);
        });

        it('should NOT allow Mentor 2 to update Mentor 1 lesson (BOLA Check)', async () => {
            const res = await request(app)
                .put(`/lessons/${lessonId}`)
                .set('Authorization', `Bearer ${mentor2Token}`)
                .send({ title: 'Hacked Title' });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('DELETE /lessons/:lessonId', () => {
        it('should allow owner mentor to delete their lesson', async () => {
            const res = await request(app)
                .delete(`/lessons/${lessonId}`)
                .set('Authorization', `Bearer ${mentor1Token}`);

            expect(res.statusCode).toBe(200);

            const check = await Lesson.findById(lessonId);
            expect(check).toBeNull();
        });
    });
});