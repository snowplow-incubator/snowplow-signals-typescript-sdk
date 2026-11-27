// External-facing alias for the API's `PredictiveAttributeScore` schema.
export type PredictiveAttributeScore = {
  name: string;
  version: number;
  minor_version: number;
  score: number;
  /**
   * The name of the training's score tier the score falls in. Absent when the
   * score falls in no tier, or the model has no tiers.
   */
  tier?: string;
};
