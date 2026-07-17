import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../app";
import { Agent } from "../models/agent.model";
import { Admin } from "../models/admin.model";
import { Customer } from "../models/customer.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const TEST_SECRET = "test-secret";
let mongoServer: MongoMemoryServer | undefined;

const buildCookie = (id: string, role: "admin" | "agent") => {
  const token = jwt.sign({ id, role }, TEST_SECRET, { expiresIn: "5m" });
  return `session=${token}`;
};

const describeIntegration = process.env.MONGOMS_SYSTEM_BINARY ? describe : describe.skip;

describeIntegration("backend API integration", () => {
  beforeAll(async () => {
    process.env.COOKIE_SECRET = TEST_SECRET;
    mongoServer = await MongoMemoryServer.create({
      binary: {
        systemBinary: process.env.MONGOMS_SYSTEM_BINARY,
      },
    });
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await Agent.deleteMany({});
    await Admin.deleteMany({});
    await Customer.deleteMany({});
  });

  it("logs in, returns a cookie, and logs out", async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    await Agent.create({
      name: "Agent One",
      email: "agent@example.com",
      passwordHash,
      status: "active",
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "agent@example.com", password: "password123", role: "agent" });

    expect(loginRes.status).toBe(200);
    expect(loginRes.headers["set-cookie"][0]).toContain("session=");

    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", loginRes.headers["set-cookie"][0]);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
  });

  it("expires cookie sessions when the token is invalid or expired", async () => {
    const badCookie = "session=bad-token";
    const response = await request(app)
      .get("/api/customers/search?q=test")
      .set("Cookie", badCookie);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("blocks admin access to agent routes", async () => {
    const admin = await Admin.create({
      name: "Admin One",
      email: "admin@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      status: "active",
    });

    const response = await request(app)
      .get("/api/customers/search?q=test")
      .set("Cookie", buildCookie(String(admin._id), "admin"));

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("blocks an agent from accessing another agent's customers", async () => {
    const firstAgent = await Agent.create({
      name: "Agent One",
      email: "first@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      status: "active",
    });

    const secondAgent = await Agent.create({
      name: "Agent Two",
      email: "second@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      status: "active",
    });

    await Customer.create({
      name: "Alice Customer",
      dob: new Date("2000-01-01"),
      mobile: "9876543210",
      email: "alice@example.com",
      pan: "ABCDE1234F",
      aadhaar: "123456789012",
      nomineeName: "Bob",
      nomineeRelation: "Brother",
      agentId: secondAgent._id,
    });

    const response = await request(app)
      .get("/api/customers/search?q=Alice")
      .set("Cookie", buildCookie(String(firstAgent._id), "agent"));

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it("enforces PAN and Aadhaar uniqueness across all customers", async () => {
    const agent = await Agent.create({
      name: "Agent One",
      email: "agent@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      status: "active",
    });

    await Customer.create({
      name: "Alice Customer",
      dob: new Date("2000-01-01"),
      mobile: "9876543210",
      email: "alice@example.com",
      pan: "ABCDE1234F",
      aadhaar: "123456789012",
      nomineeName: "Bob",
      nomineeRelation: "Brother",
      agentId: agent._id,
    });

    const response = await request(app)
      .post("/api/customers")
      .set("Cookie", buildCookie(String(agent._id), "agent"))
      .send({
        name: "Another Customer",
        dob: "2001-01-01",
        mobile: "9876543211",
        email: "another@example.com",
        pan: "ABCDE1234F",
        aadhaar: "123456789012",
        nomineeName: "Charlie",
        nomineeRelation: "Brother",
      });

    expect(response.status).toBe(409);
    expect(response.body.field).toBe("pan");
  });

  it("masks PII on GET /api/customers/:id response", async () => {
    const agent = await Agent.create({
      name: "Agent One",
      email: "agent@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
      status: "active",
    });

    const customer = await Customer.create({
      name: "Alice Customer",
      dob: new Date("2000-01-01"),
      mobile: "9876543210",
      email: "alice@example.com",
      pan: "ABCDE1234F",
      aadhaar: "123456789012",
      nomineeName: "Bob",
      nomineeRelation: "Brother",
      agentId: agent._id,
    });

    const response = await request(app)
      .get(`/api/customers/${customer._id}`)
      .set("Cookie", buildCookie(String(agent._id), "agent"));

    expect(response.status).toBe(200);
    expect(response.body.data.mobile).toBe("98XXXXXX10");
    expect(response.body.data.aadhaar).toBe("XXXX-XXXX-9012");
    expect(response.body.data.pan).toBe("ABCXX12XXF");
  });
});
