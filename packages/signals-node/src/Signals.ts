import { axiosFetch } from "./axiosFetch";
import { SignalsCore } from "@snowplow/signals-core";
import type {
  AttributeKeyIdentifiers,
  InterventionInstance,
  PublishInterventionStatus,
  SignalsCoreOptions,
  SignalsCoreSandboxOptions,
  SignalsFetchOptions,
  SignalsFetchResponse,
} from "@snowplow/signals-core";

export class Signals extends SignalsCore {
  constructor(params: SignalsCoreOptions | SignalsCoreSandboxOptions) {
    super(params);
  }

  fetch(
    url: string,
    options: SignalsFetchOptions
  ): Promise<SignalsFetchResponse> {
    return axiosFetch(url, options);
  }

  /**
   * Publish an intervention to any subscribers currently listening for the
   * given attribute-key targets.
   *
   * This is a trusted/backend action (it requires BDP credentials and the
   * server restricts it to trusted origins), which is why it lives on the Node
   * client rather than the browser-capable `signals-core`.
   *
   * @param targets Mapping of attribute key name to the identifiers to target.
   * @param intervention The intervention payload to publish.
   * @returns The delivery status. `undelivered` means no subscriber was
   *   currently listening for the targets.
   */
  async publishIntervention(
    targets: AttributeKeyIdentifiers,
    intervention: InterventionInstance
  ): Promise<PublishInterventionStatus> {
    const params = new URLSearchParams();
    for (const [key, identifiers] of Object.entries(targets)) {
      for (const identifier of identifiers) {
        params.append(key, identifier);
      }
    }

    const result = await this.fetchResult<{
      status?: PublishInterventionStatus;
    }>(
      `${this.baseUrl}/api/v1/interventions?${params.toString()}`,
      this._getFetchOptions({
        method: "POST",
        body: JSON.stringify(intervention),
      })
    );

    return result.status ?? "failure";
  }
}
