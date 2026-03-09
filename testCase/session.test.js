const request = require("supertest");
const app = require("../app");

let mentorToken;
let parentToken;
let lessonId;
let studentId;
let sessionId;
const FAKE_OBJECT_ID = "64a1b2c3d4e5f6a7b8c9d0e2";

beforeAll(async () => {
    const ts = Date.now();
    // ── Mentor setup ─────────────────────────────
    await request(app).post("/auth/signup").send({
        name: "Mentor Session",
        email: `mentor.session.${ts}@example.com`,
        password: "password123",
        role: "mentor",
    });
    const mentorLogin = await request(app).post("/auth/login").send({
        email: `mentor.session.${ts}@example.com`,
        password: "password123",
    });
    mentorToken = mentorLogin.body.token;

    // ── Parent setup ─────────────────────────────
    await request(app).post("/auth/signup").send({
        name: "Parent Session",
        email: `parent.session.${ts}@example.com`,
        password: "password123",
        role: "parent",
    });
    const parentLogin = await request(app).post("/auth/login").send({
        email: `parent.session.${ts}@example.com`,
        password: "password123",
    });
    parentToken = parentLogin.body.token;

    // ── Create lesson ─────────────────────────────
    const lessonRes = await request(app)
        .post("/lessons")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
            title: `Session Test Lesson ${ts}`,
            description: "Lesson used for testing session endpoints.",
        });
    lessonId = lessonRes.body.Lesson?.id;

    // ── Create student ────────────────────────────
    const studentRes = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
            name: "Session Student",
            email: `session.student.${ts}@example.com`,
            password: "password123",
            role: "parent",
        });
    studentId = studentRes.body.student?.id;

    // ── Book the student for the lesson ──────────
    await request(app)
        .post("/bookings")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({ studentId, lessonId });
});

// ─────────────────────────────────────────────
//  POST /sessions
// ─────────────────────────────────────────────
describe("POST /sessions", () => {
    // ── Happy Path ──────────────────────────────
    test("201 – mentor creates a session for a lesson", async () => {
        const res = await request(app)
            .post("/sessions")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                lessonId,
                date: "2025-09-01T10:00:00.000Z",
                topic: "Introduction",
                summary: "This is a summary of the introductory session content.",
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "Session Created");
        expect(res.body).toHaveProperty("id");
        sessionId = res.body.id; // Save for later tests
    });

    // ── Duplicate Session ────────────────────────
    test("400 – session already exists for this lesson", async () => {
        const res = await request(app)
            .post("/sessions")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                lessonId,
                date: "2025-09-01T10:00:00.000Z",
                topic: "Duplicate Session",
                summary: "This should fail because a session already exists for this lesson.",
            });
        expect(res.statusCode).toBe(400);
    });

    // ── Role Guard ───────────────────────────────
    test("403 – parent cannot create a session", async () => {
        const res = await request(app)
            .post("/sessions")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({
                lessonId,
                date: "2025-10-01T10:00:00.000Z",
                topic: "Parent Session",
                summary: "Parents should not be able to create sessions.",
            });
        expect(res.statusCode).toBe(403);
    });

    // ── Auth Failures ────────────────────────────
    test("401 – no token", async () => {
        const res = await request(app).post("/sessions").send({
            lessonId,
            date: "2025-10-01T10:00:00.000Z",
            topic: "No Auth Session",
            summary: "This request has no auth header.",
        });
        expect(res.statusCode).toBe(401);
    });

    // ── Validation Failures ──────────────────────
    test("400 – missing lessonId", async () => {
        const res = await request(app)
            .post("/sessions")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                date: "2025-10-01T10:00:00.000Z",
                topic: "No Lesson",
                summary: "Missing lessonId in the request body.",
            });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – missing date", async () => {
        const res = await request(app)
            .post("/sessions")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                lessonId,
                topic: "No Date",
                summary: "Missing date in the request body.",
            });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – missing topic", async () => {
        const res = await request(app)
            .post("/sessions")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                lessonId,
                date: "2025-10-01T10:00:00.000Z",
                summary: "Missing topic in the request body.",
            });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – missing summary", async () => {
        const res = await request(app)
            .post("/sessions")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                lessonId,
                date: "2025-10-01T10:00:00.000Z",
                topic: "No Summary",
            });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – invalid lessonId format", async () => {
        const res = await request(app)
            .post("/sessions")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                lessonId: "not-an-id",
                date: "2025-10-01T10:00:00.000Z",
                topic: "Bad ID",
                summary: "lessonId is not a valid MongoDB ObjectId.",
            });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Invalid Lesson ID format/i);
    });

    test("404 – lesson not found", async () => {
        const res = await request(app)
            .post("/sessions")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                lessonId: FAKE_OBJECT_ID,
                date: "2025-10-01T10:00:00.000Z",
                topic: "Ghost Lesson",
                summary: "Lesson with this ID does not exist in the database.",
            });
        expect(res.statusCode).toBe(404);
    });
});

// ─────────────────────────────────────────────
//  GET /lessons/:id/sessions
// ─────────────────────────────────────────────
describe("GET /lessons/:id/sessions", () => {
    test("200 – mentor retrieves sessions for a lesson (newest first)", async () => {
        const res = await request(app)
            .get(`/lessons/${lessonId}/sessions`)
            .set("Authorization", `Bearer ${mentorToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("404 – no sessions found for lesson", async () => {
        const ts = Date.now();
        const newLesson = await request(app)
            .post("/lessons")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                title: `Empty Lesson For Session Get ${ts}`,
                description: "This lesson has no sessions attached to it at all.",
            });
        const emptyLessonId = newLesson.body.Lesson?.id;

        const res = await request(app)
            .get(`/lessons/${emptyLessonId}/sessions`)
            .set("Authorization", `Bearer ${mentorToken}`);
        expect(res.statusCode).toBe(404);
    });

    test("403 – parent cannot view sessions", async () => {
        const res = await request(app)
            .get(`/lessons/${lessonId}/sessions`)
            .set("Authorization", `Bearer ${parentToken}`);
        expect(res.statusCode).toBe(403);
    });

    test("401 – no token", async () => {
        const res = await request(app).get(`/lessons/${lessonId}/sessions`);
        expect(res.statusCode).toBe(401);
    });
});

// ─────────────────────────────────────────────
//  POST /sessions/:sessionId/join
// ─────────────────────────────────────────────
describe("POST /sessions/:sessionId/join", () => {
    test("200 – booked student successfully joins a session", async () => {
        const res = await request(app)
            .post(`/sessions/${sessionId}/join`)
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ studentId });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty(
            "message",
            "Student successfully joined the session"
        );
        expect(res.body.attendees).toContain(studentId);
    });

    test("200 – joining the same session again is idempotent ($addToSet)", async () => {
        const res = await request(app)
            .post(`/sessions/${sessionId}/join`)
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ studentId });
        expect(res.statusCode).toBe(200);
        const count = res.body.attendees.filter((a) => a === studentId).length;
        expect(count).toBe(1);
    });

    test("403 – mentor cannot join a session", async () => {
        const res = await request(app)
            .post(`/sessions/${sessionId}/join`)
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({ studentId });
        expect(res.statusCode).toBe(403);
    });

    test("401 – no token", async () => {
        const res = await request(app)
            .post(`/sessions/${sessionId}/join`)
            .send({ studentId });
        expect(res.statusCode).toBe(401);
    });

    test("404 – session does not exist", async () => {
        const res = await request(app)
            .post(`/sessions/${FAKE_OBJECT_ID}/join`)
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ studentId });
        expect(res.statusCode).toBe(404);
    });

    test("400 – student not booked for the lesson (forbidden join)", async () => {
        const ts = Date.now();
        const unbookedStudent = await request(app)
            .post("/students")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({
                name: "Unbooked Student",
                email: `unbooked.student.${ts}@example.com`,
                password: "password123",
                role: "parent",
            });
        const unbookedStudentId = unbookedStudent.body.student?.id;

        const res = await request(app)
            .post(`/sessions/${sessionId}/join`)
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ studentId: unbookedStudentId });
        expect(res.statusCode).toBe(400);
    });

    test("400 – missing studentId in body", async () => {
        const res = await request(app)
            .post(`/sessions/${sessionId}/join`)
            .set("Authorization", `Bearer ${parentToken}`)
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – invalid studentId format", async () => {
        const res = await request(app)
            .post(`/sessions/${sessionId}/join`)
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ studentId: "not-an-id" });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Invalid Student ID format/i);
    });
});
