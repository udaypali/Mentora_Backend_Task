const request = require("supertest");
const app = require("../app");

let parentToken;
let mentorToken;
let studentId;
let lessonId;

const FAKE_OBJECT_ID = "64a1b2c3d4e5f6a7b8c9d0e2"; // valid 24-char hex, non-existent

beforeAll(async () => {
    const ts = Date.now();
    // ── Mentor setup ─────────────────────────────
    await request(app).post("/auth/signup").send({
        name: "Booking Mentor",
        email: `booking.mentor.${ts}@example.com`,
        password: "password123",
        role: "mentor",
    });
    const mentorLogin = await request(app).post("/auth/login").send({
        email: `booking.mentor.${ts}@example.com`,
        password: "password123",
    });
    mentorToken = mentorLogin.body.token;

    // ── Parent setup ─────────────────────────────
    await request(app).post("/auth/signup").send({
        name: "Booking Parent",
        email: `booking.parent.${ts}@example.com`,
        password: "password123",
        role: "parent",
    });
    const parentLogin = await request(app).post("/auth/login").send({
        email: `booking.parent.${ts}@example.com`,
        password: "password123",
    });
    parentToken = parentLogin.body.token;

    // ── Create lesson ─────────────────────────────
    const lessonRes = await request(app)
        .post("/lessons")
        .set("Authorization", `Bearer ${mentorToken}`)
        .send({
            title: `Booking Test Lesson ${ts}`,
            description: "This lesson is used for testing bookings.",
        });
    lessonId = lessonRes.body.Lesson?.id;

    // ── Create student ────────────────────────────
    const studentRes = await request(app)
        .post("/students")
        .set("Authorization", `Bearer ${parentToken}`)
        .send({
            name: "Booking Test Student",
            email: `booking.student.${ts}@example.com`,
            password: "password123",
            role: "parent",
        });
    studentId = studentRes.body.student?.id;
});

// ─────────────────────────────────────────────
//  POST /bookings
// ─────────────────────────────────────────────
describe("POST /bookings", () => {
    // ── Happy Path ──────────────────────────────
    test("201 – parent books a lesson for a student", async () => {
        const res = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ studentId, lessonId });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "Booking Created");
        expect(res.body).toHaveProperty("id");
        expect(res.body.student).toBe(studentId);
        expect(res.body.lesson).toBe(lessonId);
    });

    // ── Duplicate Booking ────────────────────────
    test("400 – duplicate booking for same student + lesson", async () => {
        const res = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ studentId, lessonId });
        expect(res.statusCode).toBe(400);
    });

    // ── Role Guard ───────────────────────────────
    test("403 – mentor cannot create a booking", async () => {
        const res = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({ studentId, lessonId });
        expect(res.statusCode).toBe(403);
    });

    // ── Auth Failures ────────────────────────────
    test("401 – no token provided", async () => {
        const res = await request(app)
            .post("/bookings")
            .send({ studentId, lessonId });
        expect(res.statusCode).toBe(401);
    });

    // ── Non-existent Resources ───────────────────
    test("404 – student does not exist", async () => {
        const res = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ studentId: FAKE_OBJECT_ID, lessonId });
        expect(res.statusCode).toBe(404);
    });

    test("404 – lesson does not exist", async () => {
        const res = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ studentId, lessonId: FAKE_OBJECT_ID });
        expect(res.statusCode).toBe(404);
    });

    // ── Validation Failures ──────────────────────
    test("400 – missing studentId", async () => {
        const res = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ lessonId });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – missing lessonId", async () => {
        const res = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ studentId });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – invalid studentId format (not a MongoDB ObjectId)", async () => {
        const res = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ studentId: "not-an-id", lessonId });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Invalid Student ID format/i);
    });

    test("400 – invalid lessonId format (not a MongoDB ObjectId)", async () => {
        const res = await request(app)
            .post("/bookings")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ studentId, lessonId: "not-an-id" });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Invalid Lesson ID format/i);
    });
});
