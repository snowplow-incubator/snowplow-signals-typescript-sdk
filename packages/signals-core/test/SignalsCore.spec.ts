import { SignalsCore } from "../src/SignalsCore";
import { SignalsAPIError } from "../src/errors";
import type { SignalsFetchOptions, SignalsFetchResponse } from "../src/types";

class TestSignalsCore extends SignalsCore {
  async fetch(
    url: string,
    options: SignalsFetchOptions
  ): Promise<SignalsFetchResponse> {
    return this.mockFetch(url, options);
  }

  mockFetch: (
    url: string,
    options: SignalsFetchOptions
  ) => Promise<SignalsFetchResponse> = async () => {
    throw new Error("mockFetch not implemented");
  };
}

const createJwt = (expiresInSeconds: number) => {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ exp })}.signature`;
};

describe("SignalsCore", () => {
  describe("BDP access token", () => {
    const TOKEN_URL_PATH = "/credentials/v3/token";

    const newSignalsCore = () =>
      new TestSignalsCore({
        baseUrl: "https://api.example.com",
        organizationId: "test-org",
        apiKeyId: "test-key-id",
        apiKey: "test-key",
      });

    const jsonResponse = (body: unknown, status = 200): SignalsFetchResponse => ({
      status,
      json: jest.fn().mockResolvedValue(body),
      text: jest.fn().mockResolvedValue(JSON.stringify(body)),
    });

    // Responds to token requests with the given tokens in order, and to API requests with an empty attributes response
    const mockFetchWithTokens = (
      signalsCore: TestSignalsCore,
      ...tokenResponses: SignalsFetchResponse[]
    ) => {
      const mockFetch = jest.fn(async (url: string, _options: SignalsFetchOptions) => {
        if (url.includes(TOKEN_URL_PATH)) {
          const response = tokenResponses.shift();
          if (!response) throw new Error("Unexpected token request");
          // Yield so concurrent callers overlap with the in-flight token request
          await new Promise((resolve) => setTimeout(resolve, 10));
          return response;
        }
        return jsonResponse({});
      });
      signalsCore.mockFetch = mockFetch;
      return mockFetch;
    };

    const tokenRequestCount = (mockFetch: jest.Mock) =>
      mockFetch.mock.calls.filter(([url]) => url.includes(TOKEN_URL_PATH)).length;

    const getAttributes = (signalsCore: SignalsCore) =>
      signalsCore.getServiceAttributes({
        name: "test-service",
        attribute_key: "test-key",
        identifier: "test-id",
      });

    it("fetches the token once for concurrent requests", async () => {
      const token = createJwt(3600);
      const signalsCore = newSignalsCore();
      const mockFetch = mockFetchWithTokens(signalsCore, jsonResponse({ accessToken: token }));

      await Promise.all(Array.from({ length: 10 }, () => getAttributes(signalsCore)));

      expect(tokenRequestCount(mockFetch)).toBe(1);
      const apiCalls = mockFetch.mock.calls.filter(([url]) => !url.includes(TOKEN_URL_PATH));
      expect(apiCalls).toHaveLength(10);
      for (const [, options] of apiCalls) {
        expect(options.headers.Authorization).toBe(`Bearer ${token}`);
      }
    });

    it("reuses a valid token across sequential requests", async () => {
      const signalsCore = newSignalsCore();
      const mockFetch = mockFetchWithTokens(signalsCore, jsonResponse({ accessToken: createJwt(3600) }));

      await getAttributes(signalsCore);
      await getAttributes(signalsCore);

      expect(tokenRequestCount(mockFetch)).toBe(1);
    });

    it("refreshes a token that is about to expire once for concurrent requests", async () => {
      const freshToken = createJwt(3600);
      const signalsCore = newSignalsCore();
      const mockFetch = mockFetchWithTokens(
        signalsCore,
        jsonResponse({ accessToken: createJwt(5) }),
        jsonResponse({ accessToken: freshToken })
      );

      await getAttributes(signalsCore);
      await Promise.all(Array.from({ length: 10 }, () => getAttributes(signalsCore)));

      expect(tokenRequestCount(mockFetch)).toBe(2);
      const [, lastOptions] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
      expect(lastOptions.headers.Authorization).toBe(`Bearer ${freshToken}`);
    });

    it("retries the token request after a failure", async () => {
      const signalsCore = newSignalsCore();
      const mockFetch = mockFetchWithTokens(
        signalsCore,
        jsonResponse({ message: "Too many requests" }, 429),
        jsonResponse({ accessToken: createJwt(3600) })
      );

      const results = await Promise.allSettled([getAttributes(signalsCore), getAttributes(signalsCore)]);
      expect(results.map((r) => r.status)).toEqual(["rejected", "rejected"]);
      expect(tokenRequestCount(mockFetch)).toBe(1);

      await expect(getAttributes(signalsCore)).resolves.toEqual({});
      expect(tokenRequestCount(mockFetch)).toBe(2);
    });

    it.each([
      [
        "an error status",
        jsonResponse({ accessToken: "should-not-be-used" }, 401),
        "[Signals] Failed to fetch access token: Token request failed with status 401",
      ],
      [
        "no accessToken",
        jsonResponse({}),
        "[Signals] Failed to fetch access token: Token response did not include an accessToken",
      ],
    ])("rejects a token response with %s without calling the API", async (_, tokenResponse, message) => {
      const signalsCore = newSignalsCore();
      const mockFetch = mockFetchWithTokens(signalsCore, tokenResponse);

      await expect(getAttributes(signalsCore)).rejects.toThrow(message);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("includes the underlying error when the token request throws", async () => {
      const signalsCore = newSignalsCore();
      signalsCore.mockFetch = jest.fn().mockRejectedValue(new Error("[Signals] API error: 429 Too Many Requests"));

      await expect(getAttributes(signalsCore)).rejects.toThrow(
        "[Signals] Failed to fetch access token: [Signals] API error: 429 Too Many Requests"
      );
    });
  });

  describe("fetchResult error handling", () => {
    it("should await error text when response status is an error", async () => {
      const errorText = "Invalid request body";
      const mockResponse: SignalsFetchResponse = {
        status: 400,
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(errorText),
      };

      const signalsCore = new TestSignalsCore({
        baseUrl: "https://api.example.com",
        sandboxToken: "test-token",
      });

      signalsCore.mockFetch = jest.fn().mockResolvedValue(mockResponse);

      try {
        await signalsCore.getServiceAttributes({
          name: "test-service",
          attribute_key: "test-key",
          identifier: "test-id",
        });
        fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(SignalsAPIError);
        expect((e as SignalsAPIError).status).toBe(400);
        expect((e as SignalsAPIError).response).toBe(errorText);
      }

      expect(mockResponse.text).toHaveBeenCalled();
    });

    it("should await error text for 500 status codes", async () => {
      const errorText = "Internal server error";
      const mockResponse: SignalsFetchResponse = {
        status: 500,
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(errorText),
      };

      const signalsCore = new TestSignalsCore({
        baseUrl: "https://api.example.com",
        sandboxToken: "test-token",
      });

      signalsCore.mockFetch = jest.fn().mockResolvedValue(mockResponse);

      try {
        await signalsCore.getServiceAttributes({
          name: "test-service",
          attribute_key: "test-key",
          identifier: "test-id",
        });
        fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(SignalsAPIError);
        expect((e as SignalsAPIError).status).toBe(500);
        expect((e as SignalsAPIError).response).toBe(errorText);
      }

      expect(mockResponse.text).toHaveBeenCalled();
    });

    it("should parse json for successful responses", async () => {
      const successData = { test_attribute: [[123]] };
      const mockResponse: SignalsFetchResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue(successData),
        text: jest.fn().mockResolvedValue(JSON.stringify(successData)),
      };

      const signalsCore = new TestSignalsCore({
        baseUrl: "https://api.example.com",
        sandboxToken: "test-token",
      });

      signalsCore.mockFetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await signalsCore.getBatchServiceAttributes({
        name: "test-service",
        attribute_key: "test_attribute",
        identifiers: ["test-id"],
      });

      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockResponse.text).not.toHaveBeenCalled();
      expect(result).toEqual({ test_attribute: [123] });
    });

    it("should include raw response text in error", async () => {
      const jsonError = JSON.stringify({ error: "invalid group version format" });
      const mockResponse: SignalsFetchResponse = {
        status: 400,
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(jsonError),
      };

      const signalsCore = new TestSignalsCore({
        baseUrl: "https://api.example.com",
        sandboxToken: "test-token",
      });

      signalsCore.mockFetch = jest.fn().mockResolvedValue(mockResponse);

      try {
        await signalsCore.getServiceAttributes({
          name: "test-service",
          attribute_key: "test-key",
          identifier: "test-id",
        });
        fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(SignalsAPIError);
        expect((e as SignalsAPIError).status).toBe(400);
        expect((e as SignalsAPIError).response).toBe(jsonError);
      }

      expect(mockResponse.text).toHaveBeenCalled();
    });
  });

  describe("getAgenticContext", () => {
    const newSignalsCore = () =>
      new TestSignalsCore({
        baseUrl: "https://api.example.com",
        sandboxToken: "test-token",
      });

    it("requests the event_log endpoint with GET and returns parsed json by default", async () => {
      const responseBody = {
        attribute_key: "user_id",
        identifier: "1232121321",
        name: "context",
        started_at_ms: 1700000000000,
        events: [{ event_name: "page_view" }],
      };
      const mockResponse: SignalsFetchResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue(responseBody),
        text: jest.fn().mockResolvedValue(JSON.stringify(responseBody)),
      };

      const signalsCore = newSignalsCore();
      signalsCore.mockFetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await signalsCore.getAgenticContext({
        name: "context",
        identifier: "1232121321",
      });

      const [url, options] = (signalsCore.mockFetch as jest.Mock).mock.calls[0];
      expect(url).toContain("/api/v1/event_log?");
      expect(url).toContain("identifier=1232121321");
      expect(url).toContain("name=context");
      expect(url).not.toContain("format=");
      expect(options.method).toBe("GET");
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockResponse.text).not.toHaveBeenCalled();
      expect(result).toEqual(responseBody);
    });

    it("returns raw plain text when format is narrative", async () => {
      const narrative = "The user viewed 3 pages in this session.";
      const mockResponse: SignalsFetchResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue(narrative),
        text: jest.fn().mockResolvedValue(narrative),
      };

      const signalsCore = newSignalsCore();
      signalsCore.mockFetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await signalsCore.getAgenticContext({
        name: "context",
        identifier: "1232121321",
        format: "narrative",
      });

      const [url] = (signalsCore.mockFetch as jest.Mock).mock.calls[0];
      expect(url).toContain("format=narrative");
      expect(mockResponse.text).toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
      expect(result).toBe(narrative);
    });

    it("throws SignalsAPIError when the event log is not found", async () => {
      const errorText = JSON.stringify({ error: "event log name not found" });
      const mockResponse: SignalsFetchResponse = {
        status: 404,
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(errorText),
      };

      const signalsCore = newSignalsCore();
      signalsCore.mockFetch = jest.fn().mockResolvedValue(mockResponse);

      try {
        await signalsCore.getAgenticContext({
          name: "context",
          identifier: "1232121321",
        });
        fail("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(SignalsAPIError);
        expect((e as SignalsAPIError).status).toBe(404);
        expect((e as SignalsAPIError).response).toBe(errorText);
      }
    });
  });

  describe("getPredictiveAttributeScore", () => {
    const newSignalsCore = () =>
      new TestSignalsCore({
        baseUrl: "https://api.example.com",
        sandboxToken: "test-token",
      });

    it("requests the predictive_attribute endpoint with GET and one query param per identifier", async () => {
      const responseBody = {
        name: "purchase_propensity",
        version: 2,
        minor_version: 0,
        score: 0.42,
      };
      const mockResponse: SignalsFetchResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue(responseBody),
        text: jest.fn().mockResolvedValue(JSON.stringify(responseBody)),
      };

      const signalsCore = newSignalsCore();
      signalsCore.mockFetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await signalsCore.getPredictiveAttributeScore({
        name: "purchase_propensity",
        identifiers: { domain_sessionid: "abc", domain_userid: "def" },
      });

      const [url, options] = (signalsCore.mockFetch as jest.Mock).mock.calls[0];
      const parsedUrl = new URL(url);
      expect(parsedUrl.pathname).toBe("/api/v1/predictive_attribute");
      expect(parsedUrl.searchParams.get("name")).toBe("purchase_propensity");
      expect(parsedUrl.searchParams.get("domain_sessionid")).toBe("abc");
      expect(parsedUrl.searchParams.get("domain_userid")).toBe("def");
      expect(options.method).toBe("GET");
      expect(options.headers.Authorization).toBe("Bearer test-token");
      expect(result).toEqual(responseBody);
    });

    it("rejects an identifier named name without making a request", async () => {
      const signalsCore = newSignalsCore();
      signalsCore.mockFetch = jest.fn();

      await expect(
        signalsCore.getPredictiveAttributeScore({
          name: "purchase_propensity",
          identifiers: { name: "abc" },
        })
      ).rejects.toThrow("'name' is reserved");
      expect(signalsCore.mockFetch).not.toHaveBeenCalled();
    });

    it.each([
      ["no identifiers", {}],
      ["only empty identifiers", { domain_sessionid: "" }],
    ])("rejects %s without making a request", async (_, identifiers) => {
      const signalsCore = newSignalsCore();
      signalsCore.mockFetch = jest.fn();

      await expect(
        signalsCore.getPredictiveAttributeScore({
          name: "purchase_propensity",
          identifiers,
        })
      ).rejects.toThrow("At least one identifier is required");
      expect(signalsCore.mockFetch).not.toHaveBeenCalled();
    });

    it("throws SignalsAPIError when the predictive attribute is not published", async () => {
      const errorText = JSON.stringify({ detail: "not found" });
      const mockResponse: SignalsFetchResponse = {
        status: 404,
        json: jest.fn().mockResolvedValue({}),
        text: jest.fn().mockResolvedValue(errorText),
      };

      const signalsCore = newSignalsCore();
      signalsCore.mockFetch = jest.fn().mockResolvedValue(mockResponse);

      const error = await signalsCore
        .getPredictiveAttributeScore({
          name: "purchase_propensity",
          identifiers: { domain_sessionid: "abc" },
        })
        .catch((e) => e);

      expect(error).toBeInstanceOf(SignalsAPIError);
      expect((error as SignalsAPIError).status).toBe(404);
      expect((error as SignalsAPIError).response).toBe(errorText);
    });
  });
});
