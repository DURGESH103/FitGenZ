const request = require("supertest");
const app = require("../app");

describe("Workout API", () => {
  it("returns workout suggestions with pagination", async () => {
    const res = await request(app).get(
      "/api/workout?gender=male&goal=weight_gain&level=beginner&category=gym&page=1&limit=5"
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.workouts).toBeDefined();
    expect(Array.isArray(res.body.workouts)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });
});
