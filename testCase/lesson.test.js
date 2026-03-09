const request = require("supertest");
const app = require("../app");

let mentorToken;
let parentToken;

beforeAll(async () => {
    const ts = Date.now();
    // Register & login Mentor
    await request(app).post("/auth/signup").send({
        name: "Lesson Mentor",
        email: `lesson.mentor.${ts}@example.com`,
        password: "password123",
        role: "mentor",
    });
    const mLog = await request(app).post("/auth/login").send({
        email: `lesson.mentor.${ts}@example.com`,
        password: "password123",
    });
    mentorToken = mLog.body.token;

    // Register & login Parent
    await request(app).post("/auth/signup").send({
        name: "Lesson Parent",
        email: `lesson.parent.${ts}@example.com`,
        password: "password123",
        role: "parent",
    });
    const pLog = await request(app).post("/auth/login").send({
        email: `lesson.parent.${ts}@example.com`,
        password: "password123",
    });
    parentToken = pLog.body.token;
});

// ─────────────────────────────────────────────
//  POST /lessons
// ─────────────────────────────────────────────
describe("POST /lessons", () => {
    // ── Happy Path ──────────────────────────────
    test("201 – mentor creates a lesson successfully", async () => {
        const ts = Date.now();
        const res = await request(app)
            .post("/lessons")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                title: `Introduction to Algebra ${ts}`,
                description: "A beginner's guide to algebraic concepts and equations.",
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "Created Lesson");
        expect(res.body.Lesson).toMatchObject({
            title: `Introduction to Algebra ${ts}`,
        });
    });

    // ── Role Guard ───────────────────────────────
    test("403 – parent cannot create a lesson", async () => {
        const ts = Date.now();
        const res = await request(app)
            .post("/lessons")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({
                title: `Parent Secret Lesson ${ts}`,
                description: "Parents should not be able to create lessons at all.",
            });
        expect(res.statusCode).toBe(403);
    });

    // ── Auth Failures ────────────────────────────
    test("401 – no token provided", async () => {
        const res = await request(app).post("/lessons").send({
            title: "Unauthenticated Lesson",
            description: "This request has no auth header and should be rejected.",
        });
        expect(res.statusCode).toBe(401);
    });

    test("401 – invalid token", async () => {
        const res = await request(app)
            .post("/lessons")
            .set("Authorization", "Bearer badtoken123")
            .send({
                title: "Bad Token Lesson",
                description: "This request has an invalid token and should fail.",
            });
        expect(res.statusCode).toBe(401);
    });

    // ── Validation Failures ──────────────────────
    test("400 – missing title", async () => {
        const res = await request(app)
            .post("/lessons")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({ description: "Description without a title, should fail." });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – missing description", async () => {
        const res = await request(app)
            .post("/lessons")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({ title: "Title Only" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – title shorter than 3 characters", async () => {
        const res = await request(app)
            .post("/lessons")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({ title: "AB", description: "Description is long enough here." });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – description shorter than 10 characters", async () => {
        const res = await request(app)
            .post("/lessons")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({ title: "Valid Title", description: "Short" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – duplicate lesson title", async () => {
        const ts = Date.now();
        await request(app)
            .post("/lessons")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                title: `Duplicate Lesson ${ts}`,
                description: "First creation of this lesson title.",
            });
        const res = await request(app)
            .post("/lessons")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                title: `Duplicate Lesson ${ts}`,
                description: "Second creation of the same title should be rejected.",
            });
        expect(res.statusCode).toBe(400);
    });

    test("400 – empty body", async () => {
        const res = await request(app)
            .post("/lessons")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });
});
