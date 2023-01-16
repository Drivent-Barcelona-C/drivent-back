import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createPayment,
  createTicketTypeWithHotel,
  createTicketTypeRemote,
  createActivityBooking,
  createActivity,
  createActivityWithStart,
} from "../factories";

import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

function createValidBody() {
  return {
    activityId: 1,
  };
}

describe("GET /activities", () => {
  it("should respond with status 401 if no token is given", async () => {
    const validBody = createValidBody();
    const response = await server.get("/activities").send(validBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const validBody = createValidBody();
    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`).send(validBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const validBody = createValidBody();
    const response = await server.get("/activities").set("Authorization", `Bearer ${token}`).send(validBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 401 if ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
      await createPayment(ticket.id, ticketType.price);

      const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if ticket is not paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, "RESERVED");
      await createActivity();

      const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 200 with an empty body for a paid presential ticket but with event without activities", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
      await createPayment(ticket.id, ticketType.price);

      const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({});
    });

    it("should respond with status 200 with a valid body for a paid presential ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
      await createPayment(ticket.id, ticketType.price);
      await createActivity();
      await createActivity();

      const response = await server.get("/activities").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      //TODO
      // expect(response.body).toMatchObject({
      //   key: [{
      //     id: expect.any(Number),
      //     name: expect.any(String),
      //     startHour: expect.any(String),
      //     endHour: expect.any(String),
      //     location: expect.any(String),
      //     capacity: expect.any(Number),
      //     activityBooking: expect.any(Number)
      //   }]
      // });
    });
  });
});

describe("POST /activities", () => {
  it("should respond with status 401 if no token is given", async () => {
    const validBody = createValidBody();
    const response = await server.post("/activities").send(validBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const validBody = createValidBody();
    const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send(validBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const validBody = createValidBody();
    const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send(validBody);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 401 for a online ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
      await createPayment(ticket.id, ticketType.price);

      const activity = await createActivity();

      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send({
        activityId: activity.id,
      });
      
      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });
    it("should respond with status 200 with a valid body for a paid presential ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
      await createPayment(ticket.id, ticketType.price);

      const activity = await createActivity();

      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send({
        activityId: activity.id,
      });

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(Number),
        userId: user.id,
        activityId: activity.id,
      });
    });
    it("should respond with status 401 with a valid body if ticket is not paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, "RESERVED");

      const activity = await createActivity();

      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send({
        activityId: activity.id,
      });

      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });
    it("should respond with status 404 if activity not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
      await createPayment(ticket.id, ticketType.price);

      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send({
        activityId: 1,
      });

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 403 with a valid body for a paid presential ticket for a activity with no vacancy", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
      await createPayment(ticket.id, ticketType.price);

      const activity = await createActivity();
      const user2 = await createUser();
      await createActivityBooking(user2.id, activity.id);

      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send({
        activityId: activity.id,
      });

      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });
    it("should respond with status 403 with a valid body for a paid presential ticket for try to subscribe to two activity in the same time", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, "PAID");
      await createPayment(ticket.id, ticketType.price);

      const activity = await createActivityWithStart();
      const activity2 = await createActivityWithStart();
      await createActivityBooking(user.id, activity.id);

      const response = await server.post("/activities").set("Authorization", `Bearer ${token}`).send({
        activityId: activity2.id,
      });

      expect(response.status).toEqual(httpStatus.UNAUTHORIZED);
    });
  });
});
