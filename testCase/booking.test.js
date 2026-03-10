const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../Models/User');
const Student = require('../Models/Student');
const Lesson = require('../Models/Lesson');
const Booking = require('../Models/Booking');

const getDynamicEmail = (prefix) => `test_${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;

describe('Booking Endpoints', () => {
    let parent1Email = getDynamicEmail('parent1');
    let parent2Email = getDynamicEmail('parent2');
    let mentorEmail = getDynamicEmail('mentor');

    let parent1Token, parent2Token, mentorToken;
    let student1Id, lessonId, bookingId;

    beforeAll(async () => {
        // 1. Create Users via Signup
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

        parent1Token = loginP1.body.token;
        parent2Token = loginP2.body.token;
        mentorToken = loginM.body.token;

        if (!parent1Token) throw new Error('SETUP FAIL: parent1Token not generated.');

        // 3. Create a Student belonging to Parent 1 directly via Mongoose
        const parent1User = await User.findOne({ email: parent1Email });
        const student1 = await Student.create({
            name: 'Booking Test Student 1',
            email: getDynamicEmail('stu1'),
            password: 'password123',
            parent: parent1User._id
        });
        student1Id = student1._id;

        // 4. Create a Lesson via the API (mentor only)
        const lessonRes = await request(app)
            .post('/lessons')
            .set('Authorization', `Bearer ${mentorToken}`)
            .send({
                title: `Booking Test Lesson ${Date.now()}`,
                description: 'Created for booking tests'
            });

        const lessonBody = lessonRes.body.Lesson || lessonRes.body.data || lessonRes.body;
        lessonId = lessonBody.id || lessonBody._id;

        if (!lessonId) throw new Error('SETUP FAIL: lessonId not captured.');
    });

    afterAll(async () => {
        await User.deleteMany({ email: { $regex: /test_.*@example\.com/ } });
        await Student.deleteMany({ name: /Booking Test Student/ });
        await Lesson.deleteMany({ title: /Booking Test Lesson/ });
        await Booking.deleteMany({ lesson: lessonId });
        await mongoose.connection.close();
    });

    // ───────────────────────────────────────────
    describe('POST /bookings', () => {
        it('should allow a parent to book a lesson for their student', async () => {
            const res = await request(app)
                .post('/bookings')
                .set('Authorization', `Bearer ${parent1Token}`)
                .send({ studentId: student1Id.toString(), lessonId: lessonId.toString() });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            bookingId = res.body.id;
        });

        it('should reject a duplicate booking for the same student + lesson', async () => {
            const res = await request(app)
                .post('/bookings')
                .set('Authorization', `Bearer ${parent1Token}`)
                .send({ studentId: student1Id.toString(), lessonId: lessonId.toString() });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toMatch(/exists|already/i);
        });

        it('should return 404 for a non-existent student', async () => {
            const fakeStudentId = new mongoose.Types.ObjectId().toString();
            const res = await request(app)
                .post('/bookings')
                .set('Authorization', `Bearer ${parent1Token}`)
                .send({ studentId: fakeStudentId, lessonId: lessonId.toString() });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/student not found/i);
        });

        it('should return 404 for a non-existent lesson', async () => {
            const fakeLessonId = new mongoose.Types.ObjectId().toString();
            const res = await request(app)
                .post('/bookings')
                .set('Authorization', `Bearer ${parent1Token}`)
                .send({ studentId: student1Id.toString(), lessonId: fakeLessonId });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toMatch(/lesson not found/i);
        });

        it('should NOT allow a mentor to create a booking (RBAC)', async () => {
            const res = await request(app)
                .post('/bookings')
                .set('Authorization', `Bearer ${mentorToken}`)
                .send({ studentId: student1Id.toString(), lessonId: lessonId.toString() });

            expect(res.statusCode).toBe(403);
        });

        it('should fail if called without a token', async () => {
            const res = await request(app)
                .post('/bookings')
                .send({ studentId: student1Id.toString(), lessonId: lessonId.toString() });

            expect(res.statusCode).toBe(401);
        });
    });

    // ───────────────────────────────────────────
    describe('GET /bookings/:bookingId', () => {
        it('should return the booking details for any authenticated user', async () => {
            const res = await request(app)
                .get(`/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${parent1Token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data._id.toString()).toBe(bookingId.toString());
        });

        it('should return the booking when accessed by mentor too', async () => {
            const res = await request(app)
                .get(`/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${mentorToken}`);

            expect(res.statusCode).toBe(200);
        });

        it('should return 404 for a non-existent booking ID', async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request(app)
                .get(`/bookings/${fakeId}`)
                .set('Authorization', `Bearer ${parent1Token}`);

            expect(res.statusCode).toBe(404);
        });
    });

    // ───────────────────────────────────────────
    describe('DELETE /bookings/:bookingId', () => {
        it('should NOT allow a different parent to cancel the booking (BOLA)', async () => {
            const res = await request(app)
                .delete(`/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${parent2Token}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.error).toMatch(/not authorized/i);
        });

        it('should allow the owner parent to cancel the booking', async () => {
            const res = await request(app)
                .delete(`/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${parent1Token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify deleted in DB
            const check = await Booking.findById(bookingId);
            expect(check).toBeNull();
        });

        it('should return 404 when trying to delete an already-deleted booking', async () => {
            const res = await request(app)
                .delete(`/bookings/${bookingId}`)
                .set('Authorization', `Bearer ${parent1Token}`);

            expect(res.statusCode).toBe(404);
        });
    });
});
