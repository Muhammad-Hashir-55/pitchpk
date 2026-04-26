"use client";

import { useEffect, useState } from "react";

interface SearchResult {
  queries: string[];
  topics: string[];
  trends: string[];
  availability: {
    status: "likely-existing" | "partially-served" | "whitespace-opportunity";
    confidence: number;
    summary: string;
    existingProducts: Array<{
      name: string;
      note: string;
    }>;
  };
  webResults?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

interface Investor {
  name: string;
  focus: string;
  stage: string;
  linkedin: string;
}

interface InvestorResult {
  investors: Investor[];
  investmentStage: string;
}

interface Website {
  name: string;
  category: string;
  purpose: string;
}

interface WebsiteResult {
  websites: Website[];
  resources: string[];
}

interface IdeaSuggestionsProps {
  idea: string;
  isLoading: boolean;
}

export function IdeaSuggestions({ idea, isLoading }: IdeaSuggestionsProps) {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [investors, setInvestors] = useState<InvestorResult | null>(null);
  const [websites, setWebsites] = useState<WebsiteResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idea || idea.trim().length < 30 || isLoading) {
      setSearchResults(null);
      setInvestors(null);
      setWebsites(null);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const [searchRes, investorRes, websiteRes] = await Promise.all([
          fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startupIdea: idea }),
          }),
          fetch("/api/investors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startupIdea: idea }),
          }),
          fetch("/api/websites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ startupIdea: idea }),
          }),
        ]);

        if (searchRes.ok) {
          setSearchResults(await searchRes.json());
        }
        if (investorRes.ok) {
          setInvestors(await investorRes.json());
        }
        if (websiteRes.ok) {
          setWebsites(await websiteRes.json());
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = window.setTimeout(fetchSuggestions, 800);
    return () => window.clearTimeout(debounceTimer);
  }, [idea, isLoading]);

  if (!searchResults && !investors && !websites) {
    return null;
  }

  return (
    <div className="space-y-5 rounded-[28px] border border-[#2f6e78]/20 bg-gradient-to-br from-[#f9fcfd] to-[#fbfaf8] p-6 backdrop-blur md:p-8">
      <div className="space-y-1">
        <p className="font-mono text-xs tracking-[0.22em] text-[#2f6e78]">
          Real-Time Intelligence
        </p>
        <h3 className="text-2xl font-semibold tracking-[-0.02em] text-[#1f2933] [font-family:var(--font-display)]">
          Context for your idea
        </h3>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {/* Search Suggestions */}
        {searchResults && (
          <div className="space-y-3 rounded-[22px] border border-[#2f6e78]/15 bg-white/60 p-4">
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#2f6e78]">
              Search Topics
            </p>
            <div className="space-y-2">
              <div className="rounded-xl border border-[#2f6e78]/20 bg-[#f2f8fa] p-3">
                <p className="text-[11px] tracking-[0.12em] text-[#6f7b89]">
                  Availability
                </p>
                <p className="mt-1 text-sm font-semibold text-[#1f2933]">
                  {searchResults.availability.status.replaceAll("-", " ")}
                  <span className="ml-2 text-[12px] font-normal text-[#5b6774]">
                    ({searchResults.availability.confidence}% confidence)
                  </span>
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[#5b6774]">
                  {searchResults.availability.summary}
                </p>
              </div>

              <div>
                <p className="text-[11px] tracking-[0.12em] text-[#6f7b89] mb-1">
                  Queries
                </p>
                <div className="space-y-1">
                  {searchResults.queries.map((q, i) => (
                    <p key={i} className="text-sm text-[#1f2933]/85">
                      • {q}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.12em] text-[#6f7b89] mb-1">
                  Topics
                </p>
                <div className="space-y-1">
                  {searchResults.topics.map((t, i) => (
                    <p key={i} className="text-sm text-[#1f2933]/85">
                      • {t}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] tracking-[0.12em] text-[#6f7b89] mb-1">
                  Trends
                </p>
                <div className="space-y-1">
                  {searchResults.trends.map((tr, i) => (
                    <p key={i} className="text-sm text-[#1f2933]/85">
                      • {tr}
                    </p>
                  ))}
                </div>
              </div>

              {searchResults.availability.existingProducts.length > 0 && (
                <div>
                  <p className="text-[11px] tracking-[0.12em] text-[#6f7b89] mb-1">
                    Similar Existing Products
                  </p>
                  <div className="space-y-1">
                    {searchResults.availability.existingProducts.map((item, i) => (
                      <p key={i} className="text-sm text-[#1f2933]/85">
                        • <span className="font-semibold">{item.name}</span>: {item.note}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.webResults && searchResults.webResults.length > 0 && (
                <div>
                  <p className="text-[11px] tracking-[0.12em] text-[#6f7b89] mb-1">
                    🔍 Live Web Results
                  </p>
                  <div className="space-y-2">
                    {searchResults.webResults.map((item, i) => (
                      <div key={i} className="rounded-lg border border-[#2f6e78]/10 bg-white/80 p-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-[#2f6e78] underline underline-offset-2 hover:text-[#1a4a52]"
                        >
                          {item.title}
                        </a>
                        <p className="mt-0.5 text-[12px] leading-4 text-[#5b6774]">
                          {item.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Investor Recommendations */}
        {investors && (
          <div className="space-y-3 rounded-[22px] border border-[#2f6e78]/15 bg-white/60 p-4">
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#2f6e78]">
              Investor Fit
            </p>
            <div>
              <p className="text-[11px] tracking-[0.12em] text-[#6f7b89] mb-2">
                Stage: <span className="font-semibold text-[#1f2933]">{investors.investmentStage}</span>
              </p>
              <div className="space-y-2">
                {investors.investors.map((inv, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-semibold text-[#1f2933]">{inv.name}</p>
                    <p className="text-[12px] text-[#5b6774]">Focus: {inv.focus}</p>
                    <p className="text-[12px] text-[#5b6774]">Stage: {inv.stage}</p>
                    <a
                      href={inv.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[12px] text-[#2f6e78] underline underline-offset-2"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Websites & Resources */}
        {websites && (
          <div className="space-y-3 rounded-[22px] border border-[#2f6e78]/15 bg-white/60 p-4">
            <p className="font-mono text-[11px] tracking-[0.16em] text-[#2f6e78]">
              Resources
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-[11px] tracking-[0.12em] text-[#6f7b89] mb-1">
                  Websites
                </p>
                {websites.websites.slice(0, 2).map((w, i) => (
                  <div key={i} className="text-sm mb-2">
                    <p className="font-semibold text-[#1f2933]">{w.name}</p>
                    <p className="text-[12px] text-[#5b6774]">{w.purpose}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[11px] tracking-[0.12em] text-[#6f7b89] mb-1">
                  Guides
                </p>
                {websites.resources.map((r, i) => (
                  <p key={i} className="text-sm text-[#1f2933]/85">
                    • {r}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 justify-center py-4">
          <div className="h-2 w-2 rounded-full bg-[#2f6e78] animate-pulse" />
          <p className="text-sm text-[#6f7b89]">Gathering insights...</p>
        </div>
      )}
    </div>
  );
}
