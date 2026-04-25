import { getPersonaById } from "@/lib/personas";
import type {
  Message,
  PersonaPressure,
  PitchScorecard,
  ScoreDimension,
} from "@/types";

type Theme =
  | "problem"
  | "market"
  | "business"
  | "execution"
  | "defensibility"
  | "traction";

const THEME_KEYWORDS: Record<Theme, string[]> = {
  problem: [
    "problem",
    "pain",
    "manual",
    "slow",
    "expensive",
    "inefficient",
    "broken",
    "delay",
    "friction",
    "urgent",
    "trust",
    "switch",
  ],
  market: [
    "market",
    "tam",
    "sam",
    "som",
    "customer",
    "segment",
    "buyer",
    "audience",
    "industry",
    "farmers",
    "clinics",
    "smb",
    "enterprise",
    "global",
  ],
  business: [
    "revenue",
    "pricing",
    "price",
    "subscription",
    "commission",
    "take rate",
    "margin",
    "profit",
    "mrr",
    "arr",
    "gmv",
    "unit economics",
    "ltv",
    "cac",
    "monet",
  ],
  execution: [
    "mvp",
    "beta",
    "prototype",
    "launch",
    "build",
    "ship",
    "app",
    "platform",
    "dashboard",
    "workflow",
    "api",
    "whatsapp",
    "integration",
    "automation",
    "ai",
    "model",
    "tech",
  ],
  defensibility: [
    "moat",
    "defensible",
    "data",
    "exclusive",
    "distribution",
    "network effect",
    "switching cost",
    "brand",
    "partnership",
    "proprietary",
    "integration",
    "workflow depth",
  ],
  traction: [
    "pilot",
    "users",
    "customers",
    "paying",
    "revenue",
    "growth",
    "retention",
    "waitlist",
    "loi",
    "signed",
    "interviews",
    "survey",
    "usage",
    "active",
  ],
};

const CUSTOMER_HINTS = [
  "farmers",
  "clinics",
  "doctors",
  "students",
  "retailers",
  "exporters",
  "restaurants",
  "parents",
  "schools",
  "smbs",
  "small businesses",
  "enterprises",
  "freelancers",
  "logistics providers",
];

const BROAD_CLAIMS = [
  "everyone",
  "every farmer",
  "every business",
  "all businesses",
  "global",
  "worldwide",
  "anyone",
  "all of pakistan",
];

const ACKNOWLEDGEMENT_HINTS = [
  "we tested",
  "we spoke",
  "we interviewed",
  "we learned",
  "we saw",
  "we measured",
  "we validated",
  "based on",
  "because",
  "currently",
  "today",
];

const NEGATIVE_PRESSURE_HINTS = [
  "why",
  "proof",
  "ignores",
  "assumes",
  "unclear",
  "risk",
  "moat",
  "tam",
  "mvp",
  "clone",
  "who pays",
  "unit economics",
  "validation",
  "switch",
  "beta",
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value);
}

function normalize(text: string) {
  return text.toLowerCase();
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function uniqueKeywordHits(text: string, keywords: string[]) {
  const lowered = normalize(text);

  return keywords.filter((keyword) => lowered.includes(keyword)).length;
}

function metricHits(text: string) {
  const matches = text.match(
    /\b\d+([.,]\d+)?\s?(%|k|m|b|million|billion|lakh|crore|users?|customers?|pilots?|months?|days?|weeks?|pkr|rs|usd|\$)\b/gi,
  );

  return matches?.length ?? 0;
}

function sentencePreview(text: string, max = 120) {
  const firstSentence = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/[.!?]/)[0]
    ?.trim();
  const source = firstSentence || text.trim();

  if (source.length <= max) {
    return source;
  }

  return `${source.slice(0, max - 3).trimEnd()}...`;
}

function detectThemes(text: string, personaId?: string) {
  const themes = new Set<Theme>();

  (
    Object.entries(THEME_KEYWORDS) as Array<[Theme, string[]]>
  ).forEach(([theme, keywords]) => {
    if (uniqueKeywordHits(text, keywords) > 0) {
      themes.add(theme);
    }
  });

  if (personaId === "skeptic") {
    themes.add("problem");
  }

  if (personaId === "market") {
    themes.add("market");
    themes.add("business");
  }

  if (personaId === "tech") {
    themes.add("execution");
    themes.add("defensibility");
  }

  return Array.from(themes);
}

function defenseCoversTheme(defense: string, theme: Theme) {
  if (!defense.trim()) {
    return false;
  }

  const genericHits = uniqueKeywordHits(defense, THEME_KEYWORDS[theme]);
  const metrics = metricHits(defense);

  if (theme === "market" || theme === "business") {
    return genericHits > 0 || metrics > 0;
  }

  if (theme === "traction") {
    return genericHits > 0 || metrics > 0;
  }

  return genericHits > 0;
}

function buildPersonaBreakdown(
  openingRoasts: Message[],
  defenseText: string,
): PersonaPressure[] {
  return openingRoasts.map((message) => {
    const themes = detectThemes(message.content, message.personaId);
    const defended = themes.some((theme) => defenseCoversTheme(defenseText, theme));
    const severity = clamp(
      42 +
        uniqueKeywordHits(message.content, NEGATIVE_PRESSURE_HINTS) * 8 +
        themes.length * 7 +
        (message.content.includes("?") ? 6 : 0) +
        (defended ? -6 : 12),
      25,
      98,
    );

    return {
      personaId: message.personaId ?? "unknown",
      name: getPersonaById(message.personaId ?? "")?.name ?? "Investor",
      severity: round(severity),
      defended,
      issue: sentencePreview(message.content),
      themes,
    };
  });
}

function dimensionSummary(score: number, strong: string, weak: string) {
  if (score >= 75) {
    return strong;
  }

  if (score >= 55) {
    return "There is a shape here, but investors will still press for sharper proof.";
  }

  return weak;
}

export function calculatePitchScorecard(
  startupIdea: string,
  conversationHistory: Message[],
): PitchScorecard {
  const normalizedIdea = normalize(startupIdea);
  const ideaWordCount = countWords(startupIdea);
  const firstFounderIndex = conversationHistory.findIndex(
    (message) => message.role === "user",
  );
  const openingRoasts =
    firstFounderIndex === -1
      ? conversationHistory.filter((message) => message.role === "assistant")
      : conversationHistory.slice(0, firstFounderIndex).filter(
          (message) => message.role === "assistant",
        );
  const defenseMessages = conversationHistory.filter(
    (message) => message.role === "user",
  );
  const defenseText = defenseMessages.map((message) => message.content).join(" ");

  const customerHits = uniqueKeywordHits(startupIdea, CUSTOMER_HINTS);
  const broadClaimHits = uniqueKeywordHits(startupIdea, BROAD_CLAIMS);
  const problemHits = uniqueKeywordHits(startupIdea, THEME_KEYWORDS.problem);
  const marketHits = uniqueKeywordHits(startupIdea, THEME_KEYWORDS.market);
  const businessHits = uniqueKeywordHits(startupIdea, THEME_KEYWORDS.business);
  const executionHits = uniqueKeywordHits(startupIdea, THEME_KEYWORDS.execution);
  const defensibilityHits = uniqueKeywordHits(
    startupIdea,
    THEME_KEYWORDS.defensibility,
  );
  const tractionHits = uniqueKeywordHits(startupIdea, THEME_KEYWORDS.traction);
  const metricsInIdea = metricHits(startupIdea);
  const metricsInDefense = metricHits(defenseText);
  const acknowledgementHits = uniqueKeywordHits(
    defenseText,
    ACKNOWLEDGEMENT_HINTS,
  );

  const personaBreakdown = buildPersonaBreakdown(openingRoasts, defenseText);
  const questionsDodged = personaBreakdown.filter((item) => !item.defended).length;
  const defendedQuestions = personaBreakdown.length - questionsDodged;
  const evidenceScore = clamp(
    round(
      18 +
        metricsInIdea * 10 +
        metricsInDefense * 8 +
        tractionHits * 8 +
        acknowledgementHits * 5,
    ),
    0,
    100,
  );

  const dimensions: ScoreDimension[] = [
    {
      id: "problem",
      label: "Problem Clarity",
      weight: 1.2,
      score: clamp(
        round(
          20 +
            Math.min(ideaWordCount, 140) / 7 +
            customerHits * 10 +
            problemHits * 7 +
            Math.min(metricsInIdea, 2) * 5 -
            broadClaimHits * 8,
        ),
        0,
        100,
      ),
      summary: "",
    },
    {
      id: "market",
      label: "Market Credibility",
      weight: 1.15,
      score: clamp(
        round(
          16 +
            customerHits * 9 +
            marketHits * 7 +
            metricsInIdea * 6 +
            (businessHits > 0 ? 6 : 0) -
            (broadClaimHits > 0 && metricsInIdea === 0 ? 14 : 0),
        ),
        0,
        100,
      ),
      summary: "",
    },
    {
      id: "business",
      label: "Revenue Logic",
      weight: 1.15,
      score: clamp(
        round(
          14 +
            businessHits * 12 +
            metricsInIdea * 5 +
            metricsInDefense * 5 +
            (normalizedIdea.includes("subscription") ||
            normalizedIdea.includes("commission") ||
            normalizedIdea.includes("pricing")
              ? 12
              : 0),
        ),
        0,
        100,
      ),
      summary: "",
    },
    {
      id: "execution",
      label: "Execution Feasibility",
      weight: 1.05,
      score: clamp(
        round(
          18 +
            executionHits * 9 +
            (normalizedIdea.includes("mvp") ||
            normalizedIdea.includes("beta") ||
            normalizedIdea.includes("prototype")
              ? 10
              : 0) +
            (defenseCoversTheme(defenseText, "execution") ? 8 : 0) -
            (normalizedIdea.includes("ai") && executionHits < 2 ? 10 : 0),
        ),
        0,
        100,
      ),
      summary: "",
    },
    {
      id: "defensibility",
      label: "Defensibility",
      weight: 0.95,
      score: clamp(
        round(
          12 +
            defensibilityHits * 13 +
            (normalizedIdea.includes("data") ? 8 : 0) +
            (normalizedIdea.includes("integration") ? 6 : 0) -
            (defensibilityHits === 0 ? 10 : 0),
        ),
        0,
        100,
      ),
      summary: "",
    },
    {
      id: "traction",
      label: "Traction & Evidence",
      weight: 1.15,
      score: clamp(
        round(
          10 +
            tractionHits * 11 +
            metricsInIdea * 8 +
            metricsInDefense * 7 +
            acknowledgementHits * 4,
        ),
        0,
        100,
      ),
      summary: "",
    },
    {
      id: "defense",
      label: "Founder Defense",
      weight: 1.2,
      score: clamp(
        round(
          10 +
            Math.min(countWords(defenseText), 60) / 4 +
            defendedQuestions * 16 +
            metricsInDefense * 6 +
            acknowledgementHits * 5 -
            questionsDodged * 12,
        ),
        0,
        100,
      ),
      summary: "",
    },
  ];

  dimensions.forEach((dimension) => {
    if (dimension.id === "problem") {
      dimension.summary = dimensionSummary(
        dimension.score,
        "The pitch names a user and pain with enough specificity to feel real.",
        "The core pain still sounds broad, under-validated, or too hand-wavy.",
      );
    } else if (dimension.id === "market") {
      dimension.summary = dimensionSummary(
        dimension.score,
        "There is a believable market wedge instead of a fantasy-market headline.",
        "The market story is still too broad or too light on grounded sizing.",
      );
    } else if (dimension.id === "business") {
      dimension.summary = dimensionSummary(
        dimension.score,
        "Investors can see who pays, how money flows, and why the math might work.",
        "The revenue path is still softer than the product story.",
      );
    } else if (dimension.id === "execution") {
      dimension.summary = dimensionSummary(
        dimension.score,
        "The MVP path feels shippable enough to defend in a real partner meeting.",
        "Execution still feels like ambition first and shipping clarity second.",
      );
    } else if (dimension.id === "defensibility") {
      dimension.summary = dimensionSummary(
        dimension.score,
        "There are signs of a moat beyond a surface-level feature set.",
        "A stronger moat story is still needed to survive clone-risk questions.",
      );
    } else if (dimension.id === "traction") {
      dimension.summary = dimensionSummary(
        dimension.score,
        "There is at least some evidence that the story has touched reality.",
        "The pitch still needs harder evidence: users, pilots, revenue, or proof.",
      );
    } else {
      dimension.summary = dimensionSummary(
        dimension.score,
        "The founder response covered multiple investor concerns with some substance.",
        "The defense missed too many investor concerns or lacked proof.",
      );
    }
  });

  const totalWeight = dimensions.reduce(
    (sum, dimension) => sum + dimension.weight,
    0,
  );
  const weightedTotal = dimensions.reduce(
    (sum, dimension) => sum + dimension.score * dimension.weight,
    0,
  );

  const overall = clamp(
    round(weightedTotal / totalWeight - questionsDodged * 3),
    0,
    100,
  );
  const avgSeverity =
    personaBreakdown.length > 0
      ? personaBreakdown.reduce((sum, item) => sum + item.severity, 0) /
        personaBreakdown.length
      : 42;
  const roastTemperature = clamp(
    round(28 + avgSeverity * 0.72 + questionsDodged * 8 - defendedQuestions * 4),
    0,
    100,
  );
  const survivalRate = clamp(
    round(
      overall * 0.86 -
        questionsDodged * 8 +
        defendedQuestions * 6 -
        Math.max(roastTemperature - 70, 0) * 0.35 +
        12,
    ),
    2,
    97,
  );

  let readinessLabel = "Not Fundable Yet";
  let verdict = "The panel would pass today and ask you to come back sharper.";

  if (overall >= 80) {
    readinessLabel = "Investor-Ready";
    verdict =
      "This can survive a real room, but only if the numbers behind the story are genuine.";
  } else if (overall >= 68) {
    readinessLabel = "Promising";
    verdict =
      "The pitch has shape and pressure tolerance, but a few weak spots will still get punished.";
  } else if (overall >= 55) {
    readinessLabel = "Fragile";
    verdict =
      "Interesting idea, soft defense. Investors will keep digging until the story breaks.";
  } else if (overall >= 40) {
    readinessLabel = "High Risk";
    verdict =
      "There is some spark here, but the panel still sees more assumptions than proof.";
  }

  const strongestDimension =
    [...dimensions].sort((a, b) => b.score - a.score)[0] ?? dimensions[0];
  const weakestDimension =
    [...dimensions].sort((a, b) => a.score - b.score)[0] ?? dimensions[0];

  return {
    overall,
    survivalRate,
    roastTemperature,
    evidenceScore,
    questionsDodged,
    defendedQuestions,
    readinessLabel,
    verdict,
    strongestSignal: `${strongestDimension.label}: ${strongestDimension.summary}`,
    biggestRisk: `${weakestDimension.label}: ${weakestDimension.summary}`,
    dimensions,
    personaBreakdown,
  };
}
