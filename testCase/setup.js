// Global setup: runs once before all test suites
// Sets NODE_ENV=test so app.js skips app.listen()
module.exports = async () => {
    process.env.NODE_ENV = "test";
};
