import nock from "nock";
import { BASE_URL, createTestClient, MOCK_ORG_ID } from "../utils";

const TARGET_ID = "e24d3aaa-160e-40de-a569-1580fb3ad6d7";

describe("Publish intervention", () => {
  beforeAll(() => {
    nock(
      `https://console.snowplowanalytics.com/api/msc/v1/organizations/${MOCK_ORG_ID}/credentials/v3/token`
    )
      .persist()
      .get("")
      .reply(200, { accessToken: "test" });
  });

  afterAll(() => {
    nock.cleanAll();
  });

  test("Should publish an intervention and return the delivery status", async () => {
    nock(BASE_URL)
      .post("/api/v1/interventions", {
        name: "show_offer",
        version: 1,
      })
      .query({ domain_userid: TARGET_ID })
      .reply(200, { status: "success" });

    const signals = createTestClient();
    const status = await signals.publishIntervention(
      { domain_userid: [TARGET_ID] },
      { name: "show_offer", version: 1 }
    );

    expect(status).toBe("success");
  });

  test("Should target multiple identifiers via repeated query params", async () => {
    const secondId = "b24d3aaa-160e-40de-a569-1580fb3ad6d8";
    nock(BASE_URL)
      .post("/api/v1/interventions", {
        name: "show_offer",
        version: 2,
        attributes: { variant: "A" },
      })
      .query({ domain_userid: [TARGET_ID, secondId] })
      .reply(200, { status: "undelivered" });

    const signals = createTestClient();
    const status = await signals.publishIntervention(
      { domain_userid: [TARGET_ID, secondId] },
      { name: "show_offer", version: 2, attributes: { variant: "A" } }
    );

    expect(status).toBe("undelivered");
  });

  test("Should throw proper error message on API error", async () => {
    nock(BASE_URL)
      .post("/api/v1/interventions")
      .query(true)
      .reply(400, { error: "no valid intervention targets found" });

    const signals = createTestClient();
    await expect(
      signals.publishIntervention(
        { domain_userid: [TARGET_ID] },
        { name: "show_offer", version: 1 }
      )
    ).rejects.toThrow(
      new Error(
        `[Signals] API error: 400 Request failed with status code 400 ${JSON.stringify(
          { error: "no valid intervention targets found" },
          null,
          2
        )}`
      )
    );
  });
});
