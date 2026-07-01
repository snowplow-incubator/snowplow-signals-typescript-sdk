// External-facing alias for the API's `EventLogBufferResponse` schema.
export type AgenticContextResponse = {
  attribute_key: string;
  identifier: string;
  name: string;
  started_at_ms: number;
  events: Record<string, unknown>[];
  prompt?: string;
  version?: number;
};
