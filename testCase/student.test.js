const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../Models/User');
const Student = require('../Models/Student');

const getDynamicEmail = (prefix) => `test_${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;

describe('Student Endpoints', () => {
    let parent1Email = getDynamicEmail('parent1');
    let parent2Email = getDynamicEmail('parent2');
    let mentorEmail = getDynamicEmail('mentor');
    let studentEmail = getDynamicEmail('student');

    let parent1Token, parent2Token, mentorToken;
    let studentId;

    beforeAll(async () => {
        // 1. Create Users
        await request(app).post('/auth/signup').send({
            name: 'Parent One', email: parent1Email, password: 'password123', role: 'parent'
        });
        await request(app).post('/auth/signup').send({
            name: 'Parent Two', email: parent2Email, password: 'password123', role: 'parent'
        });
        await request(app).post('/auth/signup').send({
            name: 'Mentor User', email: mentorEmail, password: 'password123', role: 'mentor'
        });

        // 2. Login to capture tokens
        const loginP1 = await request(app).post('/auth/login').send({ email: parent1Email, password: 'password123' });
        const loginP2 = await request(app).post('/auth/login').send({ email: parent2Email, password: 'password123' });
        const loginM = await request(app).post('/auth/login').send({ email: mentorEmail, password: 'password123' });

        // Normalize token extraction
        parent1Token = loginP1.body.token || (loginP1.body.data && loginP1.body.data.token);
        parent2Token = loginP2.body.token || (loginP2.body.data && loginP2.body.data.token);
        mentorToken = loginM.body.token || (loginM.body.data && loginM.body.data.token);

        if (!parent1Token) throw new Error("SETUP FAIL: Tokens not generated. Check Auth logic.");
    });

    afterAll(async () => {
        // Final Cleanup
        await User.deleteMany({ email: { $regex: /test_.*@example\.com/ } });
        await Student.deleteMany({ email: { $regex: /test_.*@example\.com/ } });
        await mongoose.connection.close();
    });

    describe('POST /students', () => {
        it('should allow a parent to create a student', async () => {
            const res = await request(app)
                .post('/students')
                .set('Authorization', `Bearer ${parent1Token}`)
                .send({
                    name: 'Test Student',
                    email: studentEmail,
                    password: 'password123',
                    role: 'student'
                });

            expect(res.statusCode).toBe(201);
            // Support different response bodies
            const body = res.body.data || res.body.student || res.body;
            studentId = body.id || body._id;
            expect(studentId).toBeDefined();
        });
    });

    describe('GET /students', () => {
        it('should return students for the logged-in parent', async () => {
            const res = await request(app)
                .get('/students')
                .set('Authorization', `Bearer ${parent1Token}`);

            expect(res.statusCode).toBe(200);
            const students = res.body.data || res.body;
            expect(Array.isArray(students)).toBeTruthy();
            expect(students.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('PUT /students/:studentId', () => {
        it('should allow parent to update their student', async () => {
            const res = await request(app)
                .put(`/students/${studentId}`)
                .set('Authorization', `Bearer ${parent1Token}`)
                .send({ name: 'Updated Name' });

            expect(res.statusCode).toBe(200);
            const updatedData = res.body.data || res.body.student || res.body;

            expect(updatedData).not.toBeNull();
            expect(updatedData.name).toBe('Updated Name');
        });

        it('should NOT allow unauthorized parent to update student (BOLA)', async () => {
            const res = await request(app)
                .put(`/students/${studentId}`)
                .set('Authorization', `Bearer ${parent2Token}`)
                .send({ name: 'Hacker Name' });

            expect(res.statusCode).toBe(403);
        });
    });

    describe('DELETE /students/:studentId', () => {
        it('should allow owner to delete student', async () => {
            const res = await request(app)
                .delete(`/students/${studentId}`)
                .set('Authorization', `Bearer ${parent1Token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const check = await Student.findById(studentId);
            expect(check).toBeNull();
        });
    });
});
