const request = require("supertest");
const app = require("../app");

describe("Diet API", () => {
  it("returns diet suggestions with pagination", async () => {
    const res = await request(app).get("/api/diet?gender=female&goal=fitness&page=1&limit=5");

    expect(res.statusCode).toBe(200);
    expect(res.body.diets).toBeDefined();
    expect(Array.isArray(res.body.diets)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });
});
