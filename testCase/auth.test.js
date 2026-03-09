const request = require("supertest");
const app = require("../app");

// ─────────────────────────────────────────────
//  POST /auth/signup
// ─────────────────────────────────────────────
describe("POST /auth/signup", () => {
    // ── Happy Path ──────────────────────────────
    test("201 – mentor registers successfully", async () => {
        const ts = Date.now();
        const res = await request(app).post("/auth/signup").send({
            name: "Alice Mentor",
            email: `alice.mentor.${ts}@example.com`,
            password: "password123",
            role: "mentor",
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User created");
        expect(res.body.user).toMatchObject({
            name: "Alice Mentor",
            email: `alice.mentor.${ts}@example.com`,
            role: "mentor",
        });
        expect(res.body.user).not.toHaveProperty("password");
    });

    test("201 – parent registers successfully", async () => {
        const ts = Date.now();
        const res = await request(app).post("/auth/signup").send({
            name: "Bob Parent",
            email: `bob.parent.${ts}@example.com`,
            password: "password123",
            role: "parent",
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.user.role).toBe("parent");
    });

    // ── Role Guard: only mentor & parent allowed ─
    test("403 – student role is forbidden from signup", async () => {
        const ts = Date.now();
        const res = await request(app).post("/auth/signup").send({
            name: "Sneaky Student",
            email: `sneaky.student.${ts}@example.com`,
            password: "password123",
            role: "student",
        });
        expect(res.statusCode).toBe(403);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body.message).toMatch(/Students are not permitted/i);
    });

    test("400 – invalid role value (e.g. 'admin')", async () => {
        const ts = Date.now();
        const res = await request(app).post("/auth/signup").send({
            name: "Admin Wannabe",
            email: `admin.wannabe.${ts}@example.com`,
            password: "password123",
            role: "admin",
        });
        expect(res.statusCode).toBe(400);
    });

    // ── Duplicate Email ─────────────────────────
    test("400 – duplicate email (user already exists)", async () => {
        const ts = Date.now();
        await request(app).post("/auth/signup").send({
            name: "Duplicate User",
            email: `duplicate.${ts}@example.com`,
            password: "password123",
            role: "mentor",
        });
        const res = await request(app).post("/auth/signup").send({
            name: "Duplicate User",
            email: `duplicate.${ts}@example.com`,
            password: "password123",
            role: "mentor",
        });
        expect(res.statusCode).toBe(400);
    });

    // ── Validation Failures ──────────────────────
    test("400 – missing name", async () => {
        const ts = Date.now();
        const res = await request(app).post("/auth/signup").send({
            email: `noname.${ts}@example.com`,
            password: "password123",
            role: "mentor",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – missing email", async () => {
        const res = await request(app).post("/auth/signup").send({
            name: "No Email",
            password: "password123",
            role: "mentor",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – missing password", async () => {
        const ts = Date.now();
        const res = await request(app).post("/auth/signup").send({
            name: "No Pass",
            email: `nopass.${ts}@example.com`,
            role: "mentor",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – missing role", async () => {
        const ts = Date.now();
        const res = await request(app).post("/auth/signup").send({
            name: "No Role",
            email: `norole.${ts}@example.com`,
            password: "password123",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – password too short (< 6 chars)", async () => {
        const ts = Date.now();
        const res = await request(app).post("/auth/signup").send({
            name: "Short Pass",
            email: `shortpass.${ts}@example.com`,
            password: "abc",
            role: "mentor",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – invalid email format", async () => {
        const res = await request(app).post("/auth/signup").send({
            name: "Bad Email",
            email: "not-a-valid-email",
            password: "password123",
            role: "parent",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });
});

// ─────────────────────────────────────────────
//  POST /auth/login
// ─────────────────────────────────────────────
describe("POST /auth/login", () => {
    let loginEmail;

    beforeAll(async () => {
        const ts = Date.now();
        loginEmail = `login.tester.${ts}@example.com`;
        await request(app).post("/auth/signup").send({
            name: "Login Tester",
            email: loginEmail,
            password: "password123",
            role: "mentor",
        });
    });

    // ── Happy Path ──────────────────────────────
    test("200 – mentor logs in with valid credentials", async () => {
        const res = await request(app).post("/auth/login").send({
            email: loginEmail,
            password: "password123",
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(typeof res.body.token).toBe("string");
        expect(res.body.user).toMatchObject({ role: "mentor" });
    });

    test("200 – parent logs in with valid credentials", async () => {
        const ts = Date.now();
        const parentEmail = `login.parent.${ts}@example.com`;
        await request(app).post("/auth/signup").send({
            name: "Login Parent",
            email: parentEmail,
            password: "password123",
            role: "parent",
        });
        const res = await request(app).post("/auth/login").send({
            email: parentEmail,
            password: "password123",
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.user).toMatchObject({ role: "parent" });
    });

    // ── Failure Cases ────────────────────────────
    test("404 – user does not exist", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "ghost@example.com",
            password: "password123",
        });
        expect(res.statusCode).toBe(404);
    });

    test("401 – wrong password", async () => {
        const res = await request(app).post("/auth/login").send({
            email: loginEmail,
            password: "wrongpassword",
        });
        expect(res.statusCode).toBe(401);
    });

    test("400 – missing email", async () => {
        const res = await request(app).post("/auth/login").send({
            password: "password123",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – missing password", async () => {
        const res = await request(app).post("/auth/login").send({
            email: loginEmail,
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – empty body", async () => {
        const res = await request(app).post("/auth/login").send({});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });
});

// ─────────────────────────────────────────────
//  GET /me  (profile)
// ─────────────────────────────────────────────
describe("GET /me", () => {
    let token;
    let profileEmail;

    beforeAll(async () => {
        const ts = Date.now();
        profileEmail = `profile.tester.${ts}@example.com`;
        await request(app).post("/auth/signup").send({
            name: "Profile Tester",
            email: profileEmail,
            password: "password123",
            role: "mentor",
        });
        const loginRes = await request(app).post("/auth/login").send({
            email: profileEmail,
            password: "password123",
        });
        token = loginRes.body.token;
    });

    // ── Happy Path ──────────────────────────────
    test("200 – returns logged-in user's profile (password excluded)", async () => {
        const res = await request(app)
            .get("/me")
            .set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("email", profileEmail);
        expect(res.body).not.toHaveProperty("password");
    });

    // ── Auth Failures ────────────────────────────
    test("401 – no token provided", async () => {
        const res = await request(app).get("/me");
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("message", "No token provided");
    });

    test("401 – invalid/tampered token", async () => {
        const res = await request(app)
            .get("/me")
            .set("Authorization", "Bearer thisIsNotAValidToken");
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("message", "Invalid token");
    });

    test("401 – malformed authorization header (no Bearer prefix)", async () => {
        const res = await request(app)
            .get("/me")
            .set("Authorization", token);
        expect(res.statusCode).toBe(401);
    });
});
