/**
 * Free web search via DuckDuckGo HTML endpoint.
 * No API key needed, no hard rate limits.
 */

export interface DuckDuckGoResult {
  title: string;
  url: string;
  snippet: string;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export async function searchDuckDuckGo(
  query: string,
  maxResults = 6,
): Promise<DuckDuckGoResult[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://html.duckduckgo.com/html/?q=${encoded}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html",
        "Accept-Language": "en-US,en;q=0.9",
      },
      body: `q=${encoded}`,
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.warn(`[PitchPK] DuckDuckGo returned ${response.status}`);
      return [];
    }

    const html = await response.text();
    const results: DuckDuckGoResult[] = [];

    // Parse results from the HTML — each result is in a div.result
    // Title is in <a class="result__a">, snippet in <a class="result__snippet">
    const resultBlocks = html.split(/class="result\s/g).slice(1);

    for (const block of resultBlocks) {
      if (results.length >= maxResults) break;

      // Extract title and URL
      const titleMatch = block.match(
        /class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/,
      );
      // Extract snippet
      const snippetMatch = block.match(
        /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/,
      );

      if (!titleMatch) continue;

      let rawUrl = titleMatch[1] ?? "";
      const rawTitle = titleMatch[2] ?? "";
      const rawSnippet = snippetMatch?.[1] ?? "";

      // DuckDuckGo wraps URLs through a redirect — extract the real URL
      const uddgMatch = rawUrl.match(/uddg=([^&]+)/);
      if (uddgMatch) {
        rawUrl = decodeURIComponent(uddgMatch[1]);
      }

      const title = decodeHtmlEntities(stripHtmlTags(rawTitle)).trim();
      const snippet = decodeHtmlEntities(stripHtmlTags(rawSnippet)).trim();

      if (title && rawUrl && !rawUrl.includes("duckduckgo.com")) {
        results.push({ title, url: rawUrl, snippet });
      }
    }

    return results;
  } catch (error) {
    console.error(
      "[PitchPK] DuckDuckGo search failed:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}
