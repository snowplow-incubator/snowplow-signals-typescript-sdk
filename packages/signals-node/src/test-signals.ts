import { Signals } from "./index";

(async function test() {
  const signals = new Signals({
    baseUrl: "https://d0a9ba0f-893a-445f-91a5-a1abf1359d34.svc.snplow.net",
    apiKey: "b60202b2-5d51-4a7a-b8fe-35e6f25b2ecf",
    apiKeyId: "4109c6d1-85ba-4fbf-9dea-d0ce7997845e",
    organizationId: "b12539df-a711-42bd-bdfa-175308c55fd5",
  });

  const attributes = await signals.getServiceAttributes({
    entity: "domain_sessionid",
    identifier: "fd3425d1-d068-4700-b2f4-4735d58df633",
    name: "ecommerce_demo_session_features",
  });
  console.log("Service Attributes:", attributes);
})();
