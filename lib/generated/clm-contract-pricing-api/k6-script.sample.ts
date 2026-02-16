import { CLMContractPricingEventsAPIClient } from "./cLMContractPricingEventsAPI.ts";

const baseUrl = "<BASE_URL>";
const cLMContractPricingEventsAPIClient = new CLMContractPricingEventsAPIClient(
  { baseUrl },
);

export default function () {
  let cLMContractPricingEventV2;

  /**
   * Submit CLM contract pricing event
   */
  cLMContractPricingEventV2 = {
    eventInstanceId: "hungry",
    eventName: "er",
    eventTime: "overload",
    eventSource: "abaft",
    eventSubject: "though",
    eventReason: "readily",
    containsPrivacyData: false,
    data: {
      label: "eneco",
      contractId: "uh-huh",
      jurisdiction: "NL",
      customer: {
        customerId: "uh-huh",
      },
      startDate: "kettledrum",
      endDate: "against",
      currency: "EUR",
      status: "unknown",
      products: [],
    },
  };

  const submitClmContractPricingEventResponseData =
    cLMContractPricingEventsAPIClient.submitClmContractPricingEvent(
      cLMContractPricingEventV2,
    );
}
