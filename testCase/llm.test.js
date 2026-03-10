const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

// Valid text: at least 50 chars, only alphanumeric + allowed punctuation
const VALID_TEXT =
    'Student completed algebra equations and showed strong understanding of linear functions. ' +
    'Homework was submitted on time and the student participated actively in problem-solving sessions.';

describe('LLM Summarize Endpoint – POST /llm/summarize', () => {

    afterAll(async () => {
        await mongoose.connection.close();
    });

    // ─── Input Validation ────────────────────────────────────────────────────

    describe('Input Validation (Joi schema – no API call made)', () => {
        it('400 – text field is missing entirely', async () => {
            const res = await request(app)
                .post('/llm/summarize')
                .send({});
            expect(res.statusCode).toBe(400);
        });

        it('400 – text is too short (below 50 chars)', async () => {
            const res = await request(app)
                .post('/llm/summarize')
                .send({ text: 'Too short.' });
            expect(res.statusCode).toBe(400);
        });

        it('413 – text is too long (above 12000 chars)', async () => {
            const longText = 'a'.repeat(12001);
            const res = await request(app)
                .post('/llm/summarize')
                .send({ text: longText });
            expect(res.statusCode).toBe(413);
        });

        it('422 – text contains HTML/script tags (forbidden chars)', async () => {
            const res = await request(app)
                .post('/llm/summarize')
                .send({ text: '<script>alert("xss")</script> some extra padding here to reach fifty chars' });
            expect(res.statusCode).toBe(422);
        });

        it('422 – text contains special symbols like @ # $', async () => {
            const res = await request(app)
                .post('/llm/summarize')
                .send({ text: '@@@ some invalid text with special symbols $$$ ### here padding text to exceed minimum fifty chars' });
            expect(res.statusCode).toBe(422);
        });

        it('422 – text contains square brackets []', async () => {
            const res = await request(app)
                .post('/llm/summarize')
                .send({ text: '[student] completed [lesson 1] today with great results and showed excellent progress overall in class' });
            expect(res.statusCode).toBe(422);
        });
    });

    // ─── Live AI Call ─────────────────────────────────────────────────────

    describe('Live API call (requires GEMINI_API_KEY in .env)', () => {
        it('200 – valid text returns a summary and model name', async () => {
            const res = await request(app)
                .post('/llm/summarize')
                .send({ text: VALID_TEXT });

            // If Gemini API key is missing or rate-limited, skip gracefully
            if (res.statusCode === 429 || res.statusCode === 500) {
                console.warn(`Skipping live LLM test – got status ${res.statusCode}`);
                return;
            }

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body).toHaveProperty('summary');
            expect(typeof res.body.summary).toBe('string');
            expect(res.body.summary.length).toBeGreaterThan(0);
            expect(res.body).toHaveProperty('model');
        }, 30000); // Generous timeout for real network call
    });

    // ─── Rate Limiting ────────────────────────────────────────────────────

    describe('Rate Limiting (aiLimiter – 7 req per 5s window)', () => {
        it('429 – fires after exceeding the request limit', async () => {
            // Fire 8 rapid requests; the 8th should be rate-limited
            const requests = Array.from({ length: 8 }, () =>
                request(app).post('/llm/summarize').send({ text: VALID_TEXT })
            );
            const responses = await Promise.all(requests);
            const statuses = responses.map(r => r.statusCode);
            expect(statuses).toContain(429);
        }, 15000);
    });
});
