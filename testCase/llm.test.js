const request = require("supertest");
const app = require("../app");

// A valid text sample (≥50 chars, ≤12000 chars, only allowed chars)
const VALID_TEXT =
    "The student demonstrated excellent progress in mathematics this week. " +
    "They completed all assigned exercises and showed strong understanding of " +
    "algebraic expressions and problem-solving techniques.";

// ─────────────────────────────────────────────
//  POST /llm/summarize
// ─────────────────────────────────────────────
describe("POST /llm/summarize", () => {
    // ── Happy Path ──────────────────────────────
    // NOTE: This test calls the real Gemini API.
    // It will PASS only if GEMINI_API_KEY and GEMINI_MODEL_NAME are set in .env.
    // Mark as skipped in CI if API key is not available.
    test(
        "200 – valid text returns a summary and model name",
        async () => {
            const res = await request(app).post("/llm/summarize").send({
                text: VALID_TEXT,
            });
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty("summary");
            expect(typeof res.body.summary).toBe("string");
            expect(res.body.summary.length).toBeGreaterThan(0);
            expect(res.body).toHaveProperty("model");
            expect(typeof res.body.model).toBe("string");
        },
        15000 // 15s timeout for API call
    );

    // ── Validation: Empty text ───────────────────
    test("400 – empty text field", async () => {
        const res = await request(app).post("/llm/summarize").send({ text: "" });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body.message).toMatch(/Text cannot be empty/i);
    });

    // ── Validation: Missing text field ──────────
    test("400 – text field is missing entirely", async () => {
        const res = await request(app).post("/llm/summarize").send({});
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body.message).toMatch(/Text is required/i);
    });

    // ── Validation: Too short ────────────────────
    test("400 – text shorter than 50 characters", async () => {
        const res = await request(app).post("/llm/summarize").send({
            text: "Too short text here.",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body.message).toMatch(/less than 50 characters/i);
    });

    // ── Validation: Too long ─────────────────────
    test("413 – text longer than 12000 characters", async () => {
        const res = await request(app)
            .post("/llm/summarize")
            .send({ text: "A".repeat(12001) });
        expect(res.statusCode).toBe(413);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body.message).toMatch(/more than 12000 characters/i);
    });

    // ── Validation: Forbidden characters ─────────
    test("422 – text contains forbidden characters (e.g. HTML/script tags)", async () => {
        const res = await request(app).post("/llm/summarize").send({
            text: "<script>alert('xss')</script> This text contains forbidden HTML characters that are not allowed by the regex validator.",
        });
        expect(res.statusCode).toBe(422);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body.message).toMatch(/Forbidden characters detected/i);
    });

    test("422 – text contains special symbols like @ # $", async () => {
        const res = await request(app).post("/llm/summarize").send({
            text: "This text has @invalid #characters $that$ are not allowed by the sanitization regex validator for the LLM endpoint.",
        });
        expect(res.statusCode).toBe(422);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body.message).toMatch(/Forbidden characters detected/i);
    });

    // ── Rate Limiter ─────────────────────────────
    // NOTE: This test deliberately fires many requests to trigger the rate limiter.
    // Adjust the count based on your aiLimiter config.
    test("429 – rate limit exceeded after too many requests", async () => {
        const REQUESTS = 12; // Adjust to exceed aiLimiter's max
        let lastRes;
        for (let i = 0; i < REQUESTS; i++) {
            lastRes = await request(app).post("/llm/summarize").send({
                text: VALID_TEXT,
            });
        }
        // At least the last request should have been rate-limited
        expect(lastRes.statusCode).toBe(429);
    });
});
