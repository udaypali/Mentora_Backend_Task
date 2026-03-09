const request = require("supertest");
const app = require("../app");

let parentToken;
let mentorToken;
let parentToken2; // second parent for isolation test

beforeAll(async () => {
    const ts = Date.now();

    // Register + login a parent
    await request(app).post("/auth/signup").send({
        name: "Parent User",
        email: `parent.student.${ts}@example.com`,
        password: "password123",
        role: "parent",
    });
    const parentLogin = await request(app).post("/auth/login").send({
        email: `parent.student.${ts}@example.com`,
        password: "password123",
    });
    parentToken = parentLogin.body.token;

    // Register + login a mentor
    await request(app).post("/auth/signup").send({
        name: "Mentor User",
        email: `mentor.student.${ts}@example.com`,
        password: "password123",
        role: "mentor",
    });
    const mentorLogin = await request(app).post("/auth/login").send({
        email: `mentor.student.${ts}@example.com`,
        password: "password123",
    });
    mentorToken = mentorLogin.body.token;

    // Register + login a second parent (for isolation test)
    await request(app).post("/auth/signup").send({
        name: "Second Parent",
        email: `parent2.student.${ts}@example.com`,
        password: "password123",
        role: "parent",
    });
    const parent2Login = await request(app).post("/auth/login").send({
        email: `parent2.student.${ts}@example.com`,
        password: "password123",
    });
    parentToken2 = parent2Login.body.token;
});

// ─────────────────────────────────────────────
//  POST /students
// ─────────────────────────────────────────────
describe("POST /students", () => {
    // ── Happy Path ──────────────────────────────
    test("201 – parent creates a student successfully", async () => {
        const ts = Date.now();
        const res = await request(app)
            .post("/students")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({
                name: "Child One",
                email: `child.one.${ts}@example.com`,
                password: "password123",
                role: "parent",
            });
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "Student created");
        expect(res.body.student).toMatchObject({
            name: "Child One",
            email: `child.one.${ts}@example.com`,
        });
        expect(res.body.student).not.toHaveProperty("password");
    });

    // ── Role Guard ───────────────────────────────
    test("403 – mentor cannot create a student", async () => {
        const ts = Date.now();
        const res = await request(app)
            .post("/students")
            .set("Authorization", `Bearer ${mentorToken}`)
            .send({
                name: "Child Two",
                email: `child.two.${ts}@example.com`,
                password: "password123",
                role: "parent",
            });
        expect(res.statusCode).toBe(403);
    });

    // ── Auth Failures ────────────────────────────
    test("401 – no token provided", async () => {
        const ts = Date.now();
        const res = await request(app).post("/students").send({
            name: "Child Three",
            email: `child.three.${ts}@example.com`,
            password: "password123",
            role: "parent",
        });
        expect(res.statusCode).toBe(401);
    });

    // ── Validation Failures ──────────────────────
    test("400 – missing name", async () => {
        const ts = Date.now();
        const res = await request(app)
            .post("/students")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({
                email: `child.x.${ts}@example.com`,
                password: "password123",
                role: "parent",
            });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – missing email", async () => {
        const res = await request(app)
            .post("/students")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({ name: "Child X", password: "password123", role: "parent" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – missing password", async () => {
        const ts = Date.now();
        const res = await request(app)
            .post("/students")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({
                name: "Child X",
                email: `childx.${ts}@example.com`,
                role: "parent",
            });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
    });

    test("400 – duplicate student email", async () => {
        const ts = Date.now();
        await request(app)
            .post("/students")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({
                name: "Dup Student",
                email: `dup.student.${ts}@example.com`,
                password: "password123",
                role: "parent",
            });
        const res = await request(app)
            .post("/students")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({
                name: "Dup Student",
                email: `dup.student.${ts}@example.com`,
                password: "password123",
                role: "parent",
            });
        expect(res.statusCode).toBe(400);
    });
});

// ─────────────────────────────────────────────
//  GET /students
// ─────────────────────────────────────────────
describe("GET /students", () => {
    // Seed: parent1 creates a student, parent2 creates a different student
    let parent1StudentName;
    let parent2StudentName;

    beforeAll(async () => {
        const ts = Date.now();
        parent1StudentName = `Parent1-Child-${ts}`;
        parent2StudentName = `Parent2-Child-${ts}`;

        await request(app)
            .post("/students")
            .set("Authorization", `Bearer ${parentToken}`)
            .send({
                name: parent1StudentName,
                email: `p1child.${ts}@example.com`,
                password: "password123",
                role: "parent",
            });
        await request(app)
            .post("/students")
            .set("Authorization", `Bearer ${parentToken2}`)
            .send({
                name: parent2StudentName,
                email: `p2child.${ts}@example.com`,
                password: "password123",
                role: "parent",
            });
    });

    // ── Happy Path ──────────────────────────────
    test("200 – parent sees only their own students", async () => {
        const res = await request(app)
            .get("/students")
            .set("Authorization", `Bearer ${parentToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        // Parent1's children should be present
        const names = res.body.map((s) => s.name);
        expect(names).toContain(parent1StudentName);
        // Parent2's child should NOT be visible to parent1
        expect(names).not.toContain(parent2StudentName);
        // Password must not be in any student object
        res.body.forEach((s) => expect(s).not.toHaveProperty("password"));
    });

    test("200 – second parent sees only their own students", async () => {
        const res = await request(app)
            .get("/students")
            .set("Authorization", `Bearer ${parentToken2}`);
        expect(res.statusCode).toBe(200);
        const names = res.body.map((s) => s.name);
        expect(names).toContain(parent2StudentName);
        expect(names).not.toContain(parent1StudentName);
    });

    test("200 – mentor sees ALL students (including both parents' children)", async () => {
        const res = await request(app)
            .get("/students")
            .set("Authorization", `Bearer ${mentorToken}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        const names = res.body.map((s) => s.name);
        expect(names).toContain(parent1StudentName);
        expect(names).toContain(parent2StudentName);
    });

    // ── Auth Failure ─────────────────────────────
    test("401 – no token provided", async () => {
        const res = await request(app).get("/students");
        expect(res.statusCode).toBe(401);
    });
});
