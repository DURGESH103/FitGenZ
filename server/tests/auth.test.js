const request = require("supertest");
const app = require("../app");

describe("Auth API", () => {
  it("signs up a user and returns tokens", async () => {
    const res = await request(app).post("/api/auth/signup").send({
      name: "Test User",
      email: "test@example.com",
      password: "secret123",
      gender: "male",
      age: 24,
      height: 175,
      weight: 72,
      goal: "fitness",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
  });

  it("logs in an existing user", async () => {
    await request(app).post("/api/auth/signup").send({
      name: "Login User",
      email: "login@example.com",
      password: "secret123",
      gender: "female",
      age: 22,
      height: 162,
      weight: 58,
      goal: "weight_loss",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "secret123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });
});
