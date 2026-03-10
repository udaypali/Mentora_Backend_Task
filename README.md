# Mentora Backend API

An educational platform backend API that connects parents, students, and mentors. The platform allows mentors to create lessons, parents to book lessons for their students, and provides AI-powered session summarization for parent reports.

## Table of Contents
- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [How to Run the Backend](#how-to-run-the-backend)
- [How to Run Test Cases](#how-to-run-test-cases)
- [API Endpoints](#api-endpoints)
- [LLM Configuration](#llm-configuration)
- [Assumptions and Limitations](#assumptions-and-limitations)

## Project Overview

**Mentora** is a Node.js/Express backend API for an educational platform with the following features:
- User authentication (JWT-based) with role-based access control
- Three user roles: `mentor`, `parent`, and `student`
- Lesson creation and management
- Booking system for parents to book lessons
- Session management with notes
- AI-powered session summarization using Google Gemini

### Technologies Used

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | - | Runtime environment |
| **Express.js** | ^5.2.1 | Web framework |
| **MongoDB** | - | Database |
| **Mongoose** | ^8.23.0 | MongoDB ODM |
| **JWT** | ^9.0.3 | Authentication tokens |
| **bcrypt** | ^6.0.0 | Password hashing |
| **Joi** | ^18.0.2 | Input validation |
| **express-rate-limit** | ^8.3.1 | Rate limiting |
| **@google/generative-ai** | ^0.24.1 | Google Gemini AI integration |
| **dotenv** | ^17.3.1 | Environment variables |

## Project Structure

```
Mentora_Backend_Task/
├── app.js                    # Main entry point
├── package.json              # Dependencies and scripts
├── package-lock.json         # Lock file
├── .env.example              # Environment variable template
├── .gitignore               # Git ignore rules
├── README.md                # Documentation file
├── config/
│   └── db.js                # MongoDB connection configuration
|   └── swagger.js           # Swagger UI Logic
├── Controllers/
│   ├── auth/                # Authentication controllers
│   │   ├── authController.js      # Controller aggregator
│   │   ├── loginController.js     # Login logic
│   │   ├── signupController.js    # Registration logic
│   │   └── profileController.js   # User profile logic
│   ├── bookingController.js       # Booking management
│   ├── lessonController.js        # Lesson management
│   ├── llmController.js           # AI summarization endpoint
│   ├── sessionController.js       # Session management
│   └── studentController.js       # Student management
├── Middleware/
│   ├── authMiddleware.js          # JWT authentication
│   ├── errorMiddleware.js         # Global error handling
│   ├── rateLimiter.js             # Rate limiting for AI
│   └── roleMiddleware.js          # Role-based access control
├── Models/
│   ├── Booking.js                 # Booking schema
│   ├── Lesson.js                  # Lesson schema
│   ├── Session.js                 # Session schema
│   ├── Student.js                 # Student schema
│   └── User.js                    # User schema
├── Routes/
│   ├── authRoutes.js              # Auth endpoints
│   ├── bookingRoutes.js           # Booking endpoints
│   ├── lessonRoutes.js            # Lesson endpoints
│   ├── llmRoutes.js               # AI endpoints
│   ├── sessionRoutes.js           # Session endpoints
│   └── studentRoutes.js           # Student endpoints
├── Services/
│   └── llmService.js              # Google Gemini AI integration
├── Utils/
│   └── errorResponse.js           # Custom error class
├── Validators/
│   ├── authValidator.js           # Auth role validation
│   └── inputValidator.js          # Joi input validation schemas
└── testCase/
    ├── setup.js                   # Test setup configuration
    ├── auth.test.js               # Authentication tests
    ├── booking.test.js            # Booking tests
    ├── lesson.test.js             # Lesson tests
    ├── llm.test.js                # LLM/AI tests
    ├── session.test.js            # Session tests
    └── student.test.js            # Student tests
```

## Prerequisites

Before running this project, ensure you have:

1. **Node.js** (v14 or higher) installed
2. **MongoDB** instance (local or cloud):
   - Local: [Install MongoDB](https://docs.mongodb.com/manual/installation/)
   - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
3. **Google Gemini API Key**:
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/udaypali/Mentora_Backend_Task.git
   cd Mentora_Backend_Task
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Environment Variables

Create a `.env` file in the root directory. You can copy from `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
PORT=3000
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_JWT_SECRET_KEY
SESSION_SECRET=YOUR_SESSION_SECRET_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL_NAME=models/gemini-2.5-flash
```

### Variable Descriptions

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port number | Yes | `3000` |
| `MONGO_URI` | MongoDB connection string | Yes | `mongodb://localhost:27017/mentora` or `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT signing | Yes | `your-super-secret-key-min-32-chars` |
| `SESSION_SECRET` | Secret key for session management | Optional | `your-super-secret-session-key` |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | `AIza...` |
| `GEMINI_MODEL_NAME` | Gemini model name | Optional (defaults to model in code) | `models/gemini-2.5-flash` |

### How to Set the API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Paste it in your `.env` file as `GEMINI_API_KEY`

## How to Run the Backend

1. **Ensure MongoDB is running** (if using local instance):
   ```bash
   mongod
   ```

2. **Start the server:**
   ```bash
   node app.js
   ```

3. **Verify the server is running:**
   ```
   Server running on port 3000
   ```

The API will be available at `http://localhost:3000`

## How to Run Test Cases

The project includes a comprehensive test suite using **Jest** and **Supertest**.

### Test Configuration

The `package.json` is configured with Jest:
```json
"scripts": {
  "test": "jest --verbose --silent --testPathPatterns=testCase --forceExit --detectOpenHandles",
  "test:watch": "jest --testPathPatterns=testCase --watch"
}
```

### Prerequisites for Testing

1. Ensure you have installed all dependencies (includes Jest and Supertest):
   ```bash
   npm install
   ```

2. Set up your environment variables in `.env` file (MongoDB URI is required for integration tests)

### Running Tests

1. **Run all tests once:**
   ```bash
   npm test
   ```

2. **Run tests in watch mode (for development):**
   ```bash
   npm run test:watch
   ```

### Test Coverage

The test suite covers the following modules:

| Test File | Description |
|-----------|-------------|
| `auth.test.js` | User signup, login, and profile endpoints |
| `student.test.js` | Student creation and retrieval |
| `lesson.test.js` | Lesson creation by mentors |
| `booking.test.js` | Booking creation and management |
| `session.test.js` | Session creation and joining |
| `llm.test.js` | AI summarization endpoint |

### Test Structure

Tests are located in the `testCase/` directory:
- `setup.js` - Global test configuration (sets NODE_ENV=test)
- Individual `.test.js` files for each module

### Test Case Results

Below are screenshots of test cases demonstrating the API functionality:

![](/public/images/testcase_1.png)
![](/public/images/testcase_2.png)
![](/public/images/testcase_3.png)

## API Endpoints

### Authentication Routes (`/auth`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/signup` | Public | Register new user (parent/mentor) |
| POST | `/auth/login` | Public | User login |
| GET | `/me` | Authenticated (Mentor/Parent) | Get user profile |
| PUT | `/me` | Authenticated (Mentor/Parent) | Update user profile |
| DELETE | `/me` | Authenticated (Mentor/Parent) | Delete user account and all associated data |

### Student Routes (`/students`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/students` | Parent only | Create student (child account) |
| GET | `/students` | Mentor/Parent | Get students list (parents see their own, mentors see all) |
| PUT | `/students/:studentId` | Parent only | Update student details (own students only) |
| DELETE | `/students/:studentId` | Parent only | Delete student and related bookings (own students only) |

### Lesson Routes (`/lessons`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/lessons` | Mentor only | Create new lesson |
| GET | `/lessons` | Authenticated (All roles) | Get all lessons |
| GET | `/lessons/:id` | Authenticated (All roles) | Get specific lesson by ID |
| PUT | `/lessons/:id` | Mentor only | Update lesson (only lesson creator) |
| DELETE | `/lessons/:id` | Mentor only | Delete lesson and associated sessions/bookings (only lesson creator) |

### Booking Routes (`/bookings`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/bookings` | Parent only | Book lesson for student |
| GET | `/bookings/:bookingId` | Authenticated (All roles) | Get booking details by ID |
| DELETE | `/bookings/:bookingId` | Parent only | Cancel booking (own student's bookings only) |

### Session Routes (`/sessions`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/sessions` | Mentor only | Create session for lesson |
| GET | `/lessons/:lessonId/sessions` | Mentor only | Get sessions by lesson |
| POST | `/sessions/:sessionId/join` | Parent only | Student joins session (must have booking) |
| PUT | `/sessions/:sessionId` | Mentor only | Update session (only session creator) |
| DELETE | `/sessions/:sessionId` | Mentor only | Delete session (only session creator) |

### LLM Routes (`/llm`)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/llm/summarize` | Public (rate limited) | AI-generated session summary |

### Example cURL Requests

#### 1. User Signup
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "parent"
  }'
```

#### 2. User Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "parent"
  }
}
```

#### 3. Get User Profile (Requires Token)
```bash
curl -X GET http://localhost:3000/me \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

#### 4. Create a Lesson (Mentor Only)
```bash
curl -X POST http://localhost:3000/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MENTOR_JWT_TOKEN>" \
  -d '{
    "title": "Introduction to Mathematics",
    "description": "Basic math concepts for beginners"
  }'
```

#### 5. Create a Student (Parent Only)
```bash
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PARENT_JWT_TOKEN>" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "role": "student"
  }'
```

#### 6. Create a Booking (Parent Only)
```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PARENT_JWT_TOKEN>" \
  -d '{
    "studentId": "<STUDENT_OBJECT_ID>",
    "lessonId": "<LESSON_OBJECT_ID>"
  }'
```

#### 7. Create a Session (Mentor Only)
```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MENTOR_JWT_TOKEN>" \
  -d '{
    "lessonId": "<LESSON_OBJECT_ID>",
    "date": "2024-12-25T10:00:00.000Z",
    "topic": "Algebra Basics",
    "summary": "Today we covered basic algebraic equations and problem-solving techniques. The student showed good progress in understanding variables and constants."
  }'
```

#### 8. Join a Session (Parent Only)
```bash
curl -X POST http://localhost:3000/sessions/<SESSION_ID>/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PARENT_JWT_TOKEN>" \
  -d '{
    "studentId": "<STUDENT_OBJECT_ID>"
  }'
```

#### 9. LLM Summarize (Rate Limited)
```bash
curl -X POST http://localhost:3000/llm/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Today we covered basic algebraic equations and problem-solving techniques. The student showed good progress in understanding variables and constants. We worked on linear equations and the student successfully solved 5 out of 7 practice problems. Areas for improvement include working with fractions in equations."
  }'
```

Expected Response:
```json
{
  "success": true,
  "summary": "1. Covered basic algebraic equations and problem-solving techniques\n2. Student showed good progress in understanding variables and constants\n3. Successfully solved 5 out of 7 linear equation practice problems",
  "model": "models/gemini-2.5-flash"
}
```

#### 10. Update User Profile
```bash
curl -X PUT http://localhost:3000/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com"
  }'
```

#### 11. Delete User Account
```bash
curl -X DELETE http://localhost:3000/me \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### 12. Get All Lessons
```bash
curl -X GET http://localhost:3000/lessons \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### 13. Get Specific Lesson
```bash
curl -X GET http://localhost:3000/lessons/<LESSON_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### 14. Update Lesson (Mentor Only)
```bash
curl -X PUT http://localhost:3000/lessons/<LESSON_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MENTOR_JWT_TOKEN>" \
  -d '{
    "title": "Updated Lesson Title",
    "description": "Updated lesson description with more details"
  }'
```

#### 15. Delete Lesson (Mentor Only)
```bash
curl -X DELETE http://localhost:3000/lessons/<LESSON_ID> \
  -H "Authorization: Bearer <MENTOR_JWT_TOKEN>"
```

#### 16. Update Student (Parent Only)
```bash
curl -X PUT http://localhost:3000/students/<STUDENT_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <PARENT_JWT_TOKEN>" \
  -d '{
    "name": "Updated Student Name",
    "email": "student_updated@example.com"
  }'
```

#### 17. Delete Student (Parent Only)
```bash
curl -X DELETE http://localhost:3000/students/<STUDENT_ID> \
  -H "Authorization: Bearer <PARENT_JWT_TOKEN>"
```

#### 18. Get Booking Details
```bash
curl -X GET http://localhost:3000/bookings/<BOOKING_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### 19. Cancel Booking (Parent Only)
```bash
curl -X DELETE http://localhost:3000/bookings/<BOOKING_ID> \
  -H "Authorization: Bearer <PARENT_JWT_TOKEN>"
```

#### 20. Update Session (Mentor Only)
```bash
curl -X PUT http://localhost:3000/sessions/<SESSION_ID> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MENTOR_JWT_TOKEN>" \
  -d '{
    "topic": "Updated Topic",
    "summary": "Updated session summary with additional notes"
  }'
```

#### 21. Delete Session (Mentor Only)
```bash
curl -X DELETE http://localhost:3000/sessions/<SESSION_ID> \
  -H "Authorization: Bearer <MENTOR_JWT_TOKEN>"
```

## LLM Configuration

### Overview
The project integrates **Google Gemini AI** for generating session summaries that can be sent to parents as progress reports.

### Configuration File
**Location:** `Services/llmService.js`

### How It Works
1. **AI Service:** Uses Google's Generative AI SDK (`@google/generative-ai`)
2. **Model:** Configurable via `GEMINI_MODEL_NAME` environment variable
3. **Prompt Engineering:** Converts session notes into 3-6 concise bullet points
4. **Output Format:** Numbered summary (1., 2., 3.) for easy reading

### Rate Limiting
- **Limit:** 7 requests per 1 minute per IP address
- **Window:** 1 minute
- **Error Response:**
  ```json
  {
    "success": false,
    "message": "429|Too many reports generated. Please try again in an minute."
  }
  ```

### Swagger API Documentation
The API includes interactive Swagger documentation available at:
```
http://localhost:3000/api-docs
```
This provides a UI to explore and test all API endpoints.

### Testing the LLM Endpoint

**Example cURL request:**
```bash
curl -X POST http://localhost:3000/llm/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Session notes: Student learned about fractions today. Started with basic concepts of numerator and denominator. Practiced adding simple fractions with common denominators. Student struggled a bit with converting mixed numbers to improper fractions but improved after additional examples. Homework assigned: practice problems 1-10 on page 45."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "summary": "1. Student learned basic fraction concepts including numerator and denominator\n2. Practiced adding simple fractions with common denominators\n3. Improved understanding of converting mixed numbers after additional examples",
  "model": "models/gemini-2.5-flash"
}
```

## Assumptions and Limitations

### Assumptions

1. **MongoDB Object IDs:** All entity references (studentId, lessonId, sessionId) must be valid 24-character hexadecimal MongoDB ObjectIDs
2. **Date Format:** Session dates must be in ISO 8601 format (e.g., `2024-12-25T10:00:00.000Z`)
3. **Role Assignment:**
   - Only `mentor` and `parent` roles can sign up directly
   - `student` role is assigned when a parent creates a student account
4. **Authentication:** All protected endpoints require a valid JWT token in the `Authorization: Bearer <token>` header

### Limitations

1. **Text Input Constraints for LLM:**
   - **Minimum:** 50 characters
   - **Maximum:** 12,000 characters
   - **Allowed Characters:** Alphanumeric, spaces, and basic punctuation (`. ,!?'":;-/()`)
   - **Forbidden Characters:** Brackets `[]` and angle brackets `<>` are not allowed

2. **Rate Limiting:**
   - LLM endpoint limited to 7 requests per 1 minute per IP
   - This prevents abuse and controls API costs

3. **AI Summary Constraints:**
   - Output is limited to exactly 3 bullet points (processed from 3-6 generated points)
   - AI will not hallucinate information - only facts from the input notes are used
   - No introductory text like "Here are the points" is included

4. **Test Suite:** Automated tests are implemented using Jest. Run `npm test` to execute the test suite.

5. **Security Considerations:**
   - JWT tokens should be kept secure
   - HTTPS is recommended for production deployments
   - Rate limiting is basic (IP-based only)

6. **Password Requirements:**
   - Minimum 6 characters
   - No complexity requirements enforced

---

## Security Features

1. **JWT Authentication** - Token-based auth via `Authorization: Bearer <token>` header
2. **Role-Based Access Control** - Three roles: `mentor`, `parent`, `student`
3. **Password Hashing** - bcrypt with salt round 10
4. **Input Validation** - Joi schemas for all endpoints
5. **Rate Limiting** - AI endpoint limited to 7 requests per 5 seconds
6. **Error Handling** - Centralized error middleware with custom ErrorResponse class

## Support

For issues or questions, please check:
1. Environment variables are correctly set
2. MongoDB is running and accessible
3. Google Gemini API key is valid
4. JWT token is properly formatted in requests