const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../Models/User');
const Lesson = require('../Models/Lesson');
const Session = require('../Models/Session');
const Student = require('../Models/Student');
const Booking = require('../Models/Booking');

const getDynamicEmail = (prefix) => `test_${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;

describe('Session Endpoints', () => {
    let mentorEmail = getDynamicEmail('mentor');
    let parentEmail = getDynamicEmail('parent');
    let mentorToken, parentToken;
    let lessonId, sessionId, studentId;

    beforeAll(async () => {
        // 1. Create Users
        await request(app).post('/auth/signup').send({
            name: 'Mentor User', email: mentorEmail, password: 'password123', role: 'mentor'
        });
        await request(app).post('/auth/signup').send({
            name: 'Parent User', email: parentEmail, password: 'password123', role: 'parent'
        });

        // 2. Login to capture tokens
        const loginM = await request(app).post('/auth/login').send({ email: mentorEmail, password: 'password123' });
        const loginP = await request(app).post('/auth/login').send({ email: parentEmail, password: 'password123' });

        mentorToken = loginM.body.token || (loginM.body.data && loginM.body.data.token);
        parentToken = loginP.body.token || (loginP.body.data && loginP.body.data.token);

        if (!mentorToken || !parentToken) throw new Error("SETUP FAIL: Tokens not generated.");

        // 3. Create a Lesson
        const resLesson = await request(app)
            .post('/lessons')
            .set('Authorization', `Bearer ${mentorToken}`)
            .send({ title: `Session Test Lesson ${Date.now()}`, description: 'Test Description' });

        const resBody = resLesson.body.data || resLesson.body.Lesson || resLesson.body.lesson || resLesson.body;
        lessonId = resBody.id || resBody._id;

        // 4. Create a Student via Mongoose to bypass route requirements smoothly
        const parentUser = await User.findOne({ email: parentEmail });
        const student = await Student.create({
            name: 'Session Test Student',
            email: getDynamicEmail('student'),
            password: 'password123',
            parent: parentUser._id
        });
        studentId = student._id;

        // 5. Create a Booking directly for the Student and the Lesson
        await Booking.create({
            student: studentId,
            lesson: lessonId
        });
    });

    afterAll(async () => {
        // Cleanup all created test data
        await User.deleteMany({ email: { $regex: /test_.*@example\.com/ } });
        await Student.deleteMany({ name: 'Session Test Student' });
        await Lesson.deleteMany({ title: { $regex: /Session Test Lesson/ } });
        await Session.deleteMany({ topic: { $regex: /Test Topic/ } });
        await Booking.deleteMany({ student: studentId });
        await mongoose.connection.close();
    });

    describe('POST /sessions', () => {
        it('should allow a mentor to create a session', async () => {
            const res = await request(app)
                .post('/sessions')
                .set('Authorization', `Bearer ${mentorToken}`)
                .send({
                    lessonId: lessonId,
                    date: new Date().toISOString(),
                    topic: 'Test Topic 1',
                    summary: 'Intro to testing sessions'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            sessionId = res.body.id;
        });

        it('should fail if missing required fields', async () => {
            const res = await request(app)
                .post('/sessions')
                .set('Authorization', `Bearer ${mentorToken}`)
                .send({
                    date: new Date().toISOString(),
                    topic: 'Test Topic Missing Fields',
                });
            expect(res.statusCode).toBe(400);
        });

        it('should allow only one session per lesson (trigger Duplicate Error)', async () => {
            const res = await request(app)
                .post('/sessions')
                .set('Authorization', `Bearer ${mentorToken}`)
                .send({
                    lessonId: lessonId,
                    date: new Date().toISOString(),
                    topic: 'Test Topic Backup',
                    summary: 'Second Session'
                });
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toMatch(/exists|already/i);
        });
    });

    describe('GET /lessons/:lessonId/sessions', () => {
        it('should return session for the lesson to the mentor', async () => {
            const res = await request(app)
                .get(`/lessons/${lessonId}/sessions`)
                .set('Authorization', `Bearer ${mentorToken}`);

            expect(res.statusCode).toBe(200);
            const sessions = res.body.data || res.body;
            expect(Array.isArray(sessions)).toBeTruthy();
            expect(sessions.length).toBeGreaterThanOrEqual(1);
            expect(sessions[0]._id.toString()).toBe(sessionId.toString());
        });
    });

    describe('PUT /sessions/:sessionId', () => {
        it('should allow mentor to update the session topic and summary', async () => {
            const newTopic = 'Updated Test Topic';
            const res = await request(app)
                .put(`/sessions/${sessionId}`)
                .set('Authorization', `Bearer ${mentorToken}`)
                .send({
                    topic: newTopic,
                    summary: 'Updated Summary'
                });

            expect(res.statusCode).toBe(200);
            const data = res.body.data || res.body;
            expect(data.topic).toBe(newTopic);
        });

        it('should protect against unauthorized access (BOLA)', async () => {
            // Parent tries to update the session (not allowed for parent, but test explicitly with wrong role or token if needed)
            const res = await request(app)
                .put(`/sessions/${sessionId}`)
                .set('Authorization', `Bearer ${parentToken}`)
                .send({ topic: 'Hacked Topic' });

            expect([403]).toContain(res.statusCode);
        });
    });

    describe('POST /sessions/:sessionId/join', () => {
        it('should allow parent to join a student to the session they are booked for', async () => {
            const res = await request(app)
                .post(`/sessions/${sessionId}/join`)
                .set('Authorization', `Bearer ${parentToken}`)
                .send({
                    studentId: studentId.toString()
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.attendees).toContain(studentId.toString());
        });

        it('should NOT allow un-booked student to join', async () => {
            // Create a secondary student not booked
            const unbookedStudent = await Student.create({
                name: 'Unbooked Student',
                email: getDynamicEmail('unbooked'),
                password: 'password123',
                parent: new mongoose.Types.ObjectId()
            });

            const res = await request(app)
                .post(`/sessions/${sessionId}/join`)
                .set('Authorization', `Bearer ${parentToken}`)
                .send({
                    studentId: unbookedStudent._id.toString()
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toMatch(/forbidden|not booked/i);

            // cleanup secondary student
            await Student.findByIdAndDelete(unbookedStudent._id);
        });
    });

    describe('DELETE /sessions/:sessionId', () => {
        it('should NOT allow parent to delete the session', async () => {
            const res = await request(app)
                .delete(`/sessions/${sessionId}`)
                .set('Authorization', `Bearer ${parentToken}`);

            expect([403]).toContain(res.statusCode); // parents are restricted
        });

        it('should allow owner mentor to delete the session', async () => {
            const res = await request(app)
                .delete(`/sessions/${sessionId}`)
                .set('Authorization', `Bearer ${mentorToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const sessionInDb = await Session.findById(sessionId);
            expect(sessionInDb).toBeNull();
        });
    });
});
