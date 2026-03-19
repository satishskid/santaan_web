import { buildContentManagerGeminiPrompt } from "@/lib/content-draft";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(value: string, expected: string, message: string) {
  assert(value.includes(expected), message);
}

function parse(url: string) {
  return new URL(url);
}

function hasParam(url: string, key: string) {
  return parse(url).searchParams.has(key);
}

function getParam(url: string, key: string) {
  return parse(url).searchParams.get(key);
}

function run() {
  const sample = buildContentManagerGeminiPrompt({
    totalLeads: 52,
    unattributedLeads: 6,
    topics: [{ topic: "ivf", leads: 18, conversions: 6, rate: 33.3 }],
    centers: [{ center: "Bhubaneswar", leads: 20, conversions: 7, rate: 35 }],
    timeWindows: [{ window: "17:00–20:00", leads: 22, conversions: 7, rate: 31.8 }],
    keywordSuggestions: ["ivf", "fertility doctor", "ivf center bhubaneswar"],
    topLandingPagesByTopic: { ivf: "/ivf?ref=abc" },
    bestPaid: [{ campaign: "meta_ivf_bhubaneswar", cpp: 2400, spend: 12000, conversions: 5 }],
    pausePaid: [{ campaign: "gads_generic_network", cpp: 0, spend: 9000, conversions: 0 }],
  });

  assert(sample.readiness.canCopy, "Expected canCopy to be true for sufficient data");
  assert(sample.readiness.level !== "low", "Expected readiness to be medium/high for sufficient data");

  for (const link of Object.values(sample.links)) {
    assert(hasParam(link, "utm_source"), "Missing utm_source");
    assert(hasParam(link, "utm_medium"), "Missing utm_medium");
    assert(hasParam(link, "utm_campaign"), "Missing utm_campaign");
    assert(hasParam(link, "center"), "Missing center");
    assert(hasParam(link, "asset"), "Missing asset");
    assert(getParam(link, "utm_campaign") === sample.utmCampaign, "utm_campaign mismatch across links");
    assert(getParam(link, "center") === "bhubaneswar", "Expected center normalized to bhubaneswar");
    assert(!parse(link).pathname.includes("?"), "Expected query string to be normalized out of pathname");
    assert(getParam(link, "ref") === null, "Expected landing path query params to be stripped");
  }

  assertIncludes(sample.prompt, "INSTAGRAM ORGANIC LINK:", "Prompt missing Instagram link line");
  assertIncludes(sample.prompt, sample.links.instagramOrganic, "Prompt missing embedded Instagram URL");

  const low = buildContentManagerGeminiPrompt({
    totalLeads: 4,
    unattributedLeads: 3,
    topics: [],
    centers: [],
    timeWindows: [],
    keywordSuggestions: [],
  });

  assert(!low.readiness.canCopy, "Expected canCopy to be false for low data");
  assert(low.readiness.reasons.length > 0, "Expected readiness reasons for low data");

  const strict = buildContentManagerGeminiPrompt(
    {
      totalLeads: 52,
      unattributedLeads: 6,
      topics: [{ topic: "ivf", leads: 18, conversions: 6, rate: 33.3 }],
      centers: [{ center: "Bhubaneswar", leads: 20, conversions: 7, rate: 35 }],
      timeWindows: [{ window: "17:00–20:00", leads: 22, conversions: 7, rate: 31.8 }],
      keywordSuggestions: ["ivf", "fertility doctor", "ivf center bhubaneswar"],
    },
    { minLeads: 80, maxUnattributedRatio: 0.1 }
  );

  assert(!strict.readiness.canCopy, "Expected canCopy to be false for strict thresholds");
}

run();
console.log("OK: content draft prompt generation tests passed");
