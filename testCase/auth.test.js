const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../Models/User');

const getDynamicEmail = (role) => `test_${role}_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;

describe('Auth & Profile Endpoints', () => {
    let parentEmail = getDynamicEmail('parent');
    let mentorEmail = getDynamicEmail('mentor');
    let studentEmail = getDynamicEmail('student');

    let parentToken, mentorToken;
    let studentId;

    // CLEANUP: Wipe all test users after the suite ends
    afterAll(async () => {
        await User.deleteMany({ email: { $regex: /test_.*@example\.com/ } });
        if (studentId) await User.findByIdAndDelete(studentId);
        await mongoose.connection.close();
    });

    describe('POST /auth/signup', () => {
        it('should signup a new parent successfully', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send({
                    name: 'Test Parent',
                    email: parentEmail,
                    password: 'password123',
                    role: 'parent'
                });
            expect(res.statusCode).toBe(201);
            expect(res.body.user.role).toBe('parent');
        });

        it('should signup a new mentor successfully', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send({
                    name: 'Test Mentor',
                    email: mentorEmail,
                    password: 'password123',
                    role: 'mentor'
                });
            expect(res.statusCode).toBe(201);
            expect(res.body.user.role).toBe('mentor');
        });

        it('should fail to signup a student directly', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send({
                    name: 'Test Student',
                    email: studentEmail,
                    password: 'password123',
                    role: 'student'
                });
            expect([400, 403]).toContain(res.statusCode);
        });
    });

    describe('POST /auth/login', () => {
        it('should login parent and return token', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: parentEmail, password: 'password123' });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            parentToken = res.body.token;
        });

        it('should login mentor and return token', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: mentorEmail, password: 'password123' });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            mentorToken = res.body.token;
        });

        it('should fail to login a student directly', async () => {
            // Manual injection to test login restriction
            // Bypassing User schema validation because 'student' is not a valid enum for User.role
            const studentInsert = await mongoose.connection.collection('users').insertOne({
                name: 'Direct Student',
                email: studentEmail,
                password: 'password123',
                role: 'student'
            });
            studentId = studentInsert.insertedId;

            const res = await request(app)
                .post('/auth/login')
                .send({ email: studentEmail, password: 'password123' });

            expect(res.statusCode).toBe(403);
            expect(res.body.error).toMatch(/students cannot login/i);
        });
    });

    describe('PUT /me (Profile Updates)', () => {
        it('should update parent profile name', async () => {
            const newName = 'Updated Parent Name';
            const res = await request(app)
                .put('/me')
                .set('Authorization', `Bearer ${parentToken}`)
                .send({ name: newName });

            expect(res.statusCode).toBe(200);
            // Matches our 'data' response structure
            expect(res.body.data.name).toBe(newName);
        });

        // SECURITY RESEARCHER TEST: Privilege Escalation Check
        it('should NOT allow a parent to change their role to mentor', async () => {
            const res = await request(app)
                .put('/me')
                .set('Authorization', `Bearer ${parentToken}`)
                .send({ role: 'mentor' });

            const userInDb = await User.findOne({ email: parentEmail });
            expect(userInDb.role).toBe('parent'); // Role should NOT have changed
        });

        it('should update password and return success message', async () => {
            const res = await request(app)
                .put('/me')
                .set('Authorization', `Bearer ${parentToken}`)
                .send({ password: 'newpassword123' });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toMatch(/password has been updated/i);
        });
    });

    describe('DELETE /me', () => {
        it('should delete account and verify user is gone', async () => {
            const res = await request(app)
                .delete('/me')
                .set('Authorization', `Bearer ${mentorToken}`);

            expect(res.statusCode).toBe(200);

            const checkUser = await User.findOne({ email: mentorEmail });
            expect(checkUser).toBeNull();
        });
    });
});