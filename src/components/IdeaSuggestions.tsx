"use client";

import { useEffect, useState } from "react";

interface IntelligenceResult {
  search: {
    queries: string[];
    topics: string[];
    trends: string[];
    availability: {
      status: "likely-existing" | "partially-served" | "whitespace-opportunity";
      confidence: number;
      summary: string;
      existingProducts: Array<{ name: string; note: string }>;
    };
    webResults?: Array<{ title: string; url: string; snippet: string }>;
  };
  investors: {
    investors: Array<{ name: string; focus: string; stage: string; linkedin: string }>;
    investmentStage: string;
  };
  websites: {
    websites: Array<{ name: string; category: string; purpose: string }>;
    resources: string[];
  };
}

interface IdeaSuggestionsProps {
  idea: string;
  isLoading: boolean;
}


export function IdeaSuggestions({ idea, isLoading }: IdeaSuggestionsProps) {
  const [intelligence, setIntelligence] = useState<IntelligenceResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idea || idea.trim().length < 30 || isLoading) {
      setIntelligence(null);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startupIdea: idea }),
        });

        if (response.ok) {
          const data = await response.json();
          // Verify we got the structure back. Fallbacks are handled by the single API.
          if (data.search || data.investors || data.websites) {
             setIntelligence(data);
          }
        }
      } catch (error) {
        console.error("Error fetching intelligence:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = window.setTimeout(fetchSuggestions, 800);
    return () => window.clearTimeout(debounceTimer);
  }, [idea, isLoading]);

  if (!intelligence && !loading) {
    return null;
  }
  
  const searchResults = intelligence?.search;
  const investors = intelligence?.investors;
  const websites = intelligence?.websites;

  return (
    <div className="space-y-6 rounded-[32px] border border-[#2f6e78]/15 bg-gradient-to-br from-[#ffffff]/80 to-[#fdfcfb]/60 p-6 md:p-10 backdrop-blur-xl shadow-sm transition-all">
      <div className="flex flex-col gap-1 md:flex-row md:items-end justify-between">
         <div className="space-y-2">
           <div className="inline-flex items-center gap-2 rounded-full border border-[#2f6e78]/20 bg-[#f2f8fa] px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2f6e78] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2f6e78]"></span>
              </span>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#2f6e78] font-bold">
                 Real-Time Intelligence
              </p>
           </div>
           <h3 className="text-3xl font-semibold tracking-tight text-[#1f2933] [font-family:var(--font-display)]">
              Context for your idea
           </h3>
           <p className="text-[#5b6774] text-sm max-w-xl">
             We automatically cross-reference your startup idea with live market data, typical competitor profiles, and active investors.
           </p>
         </div>
      </div>

      {loading && !intelligence && (
        <div className="flex flex-col items-center justify-center py-12 gap-4 rounded-[24px] bg-black/5 animate-pulse">
          <div className="h-6 w-6 rounded-full border-2 border-[#2f6e78] border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-[#6f7b89] tracking-wide">Synthesizing intelligence...</p>
        </div>
      )}

      {!loading && intelligence && (
        <div className="grid gap-6 md:grid-cols-12 items-start mt-8">
          
          {/* Column 1: Market Availability & Search */}
          {searchResults && (
            <div className="md:col-span-4 space-y-4">
              <div className="rounded-[24px] border border-[#2f6e78]/15 bg-white shadow-sm p-6 space-y-6 transition hover:shadow-md hover:border-[#2f6e78]/30">
                 <div className="flex items-center gap-3 border-b border-[#2f6e78]/10 pb-4">
                    <div className="bg-[#2f6e78]/10 p-2 rounded-lg text-[#2f6e78] text-xl">🌐</div>
                    <h4 className="font-semibold text-[#1f2933] text-lg">Market Viability</h4>
                 </div>
                 
                 <div className="space-y-3">
                   <div className="rounded-xl bg-[#f8fafc] border border-slate-200 p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#2f6e78]/5 rounded-bl-full border-b border-l border-[#2f6e78]/10 transition-transform hover:scale-110"></div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Coverage Status</p>
                      <p className="text-base font-bold text-[#1f2933] capitalize flex items-center gap-2">
                        {searchResults.availability.status.replaceAll("-", " ")}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {searchResults.availability.summary}
                      </p>
                   </div>
                   
                   {searchResults.availability.existingProducts && searchResults.availability.existingProducts.length > 0 && (
                     <div className="pt-2">
                       <p className="text-[10px] uppercase tracking-wider text-[#2f6e78] font-bold mb-3 pl-1">Identified Competitors</p>
                       <ul className="space-y-3">
                         {searchResults.availability.existingProducts.map((item, i) => (
                           <li key={i} className="flex flex-col text-sm border-l-2 border-[#2f6e78]/30 pl-3 py-1">
                             <span className="font-semibold text-slate-800">{item.name}</span>
                             <span className="text-slate-500 text-xs mt-1 leading-snug">{item.note}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                 </div>
              </div>
            </div>
          )}

          {/* Column 2: Web Results and Resources */}
          <div className="md:col-span-4 space-y-6">
             {searchResults?.webResults && searchResults.webResults.length > 0 && (
               <div className="rounded-[24px] border border-[#2f6e78]/15 bg-white shadow-sm p-6 space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="bg-[#2f6e78]/10 p-2 rounded-lg text-[#2f6e78] text-xl">📰</div>
                    <h4 className="font-semibold text-[#1f2933] text-lg">Live Context</h4>
                 </div>
                 <div className="space-y-4">
                    {searchResults.webResults.slice(0, 3).map((item, i) => (
                      <div key={i} className="group cursor-pointer">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-[#2f6e78] group-hover:text-[#1a4a52] transition underline-offset-4 decoration-[#2f6e78]/30"
                        >
                          {item.title}
                        </a>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
                          {item.snippet}
                        </p>
                      </div>
                    ))}
                 </div>
               </div>
             )}

             {websites && websites.resources && websites.resources.length > 0 && (
               <div className="rounded-[24px] bg-[#1f2933] text-white p-6 shadow-lg shadow-[#1f2933]/10">
                 <h4 className="font-bold text-sm tracking-wide text-white/80 uppercase mb-4 flex items-center gap-2">
                   📚 Suggested Reading
                 </h4>
                 <ul className="space-y-4">
                   {websites.resources.map((r, i) => (
                     <li key={i} className="flex text-sm text-slate-300 leading-snug">
                       <span className="mr-3 text-[#2f6e78] opacity-80">▹</span>
                       {r}
                     </li>
                   ))}
                 </ul>
               </div>
             )}
          </div>

          {/* Column 3: Investors */}
          {investors && (
            <div className="md:col-span-4 rounded-[24px] border border-[#2f6e78]/15 bg-white shadow-sm p-6 h-full border-t-[4px] border-t-[#2f6e78]">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600 text-xl">💰</div>
                <div>
                  <h4 className="font-semibold text-[#1f2933] text-lg leading-tight">Investor Match</h4>
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Target: {investors.investmentStage}</p>
                </div>
              </div>
              
              <div className="space-y-5">
                {investors.investors.map((inv, i) => (
                  <div key={i} className="group rounded-xl p-3 bg-slate-50 border border-slate-100 hover:bg-white hover:border-[#2f6e78]/20 hover:shadow-sm transition cursor-default">
                    <p className="font-bold text-[#1f2933] text-sm group-hover:text-[#2f6e78] transition-colors">{inv.name}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-slate-600 flex gap-2"><span className="text-slate-400 w-10">Focus:</span> <span className="line-clamp-1">{inv.focus}</span></p>
                      <p className="text-xs text-slate-600 flex gap-2"><span className="text-slate-400 w-10">Stage:</span> <span>{inv.stage}</span></p>
                    </div>
                    <a
                      href={inv.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3 text-[11px] font-semibold tracking-wide text-[#2f6e78] bg-[#2f6e78]/10 hover:bg-[#2f6e78]/20 px-3 py-1 rounded-full transition"
                    >
                      View on LinkedIn
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
