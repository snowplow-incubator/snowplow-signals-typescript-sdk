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

describe("SignalsCore", () => {
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
});
