import { useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";

type SearchTool = {
  slug: string;
  title: string;
  shortTitle?: string;
  description: string;
  keywords: string[];
};

type Props = {
  tools: SearchTool[];
};

const storageKey = "viox:last-used-calculators";

export default function ToolDiscovery({ tools }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      if (Array.isArray(saved)) setRecentSlugs(saved.filter((item): item is string => typeof item === "string").slice(0, 3));
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    function closeResults(event: MouseEvent) {
      if (!shellRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeResults);
    return () => document.removeEventListener("mousedown", closeResults);
  }, []);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return tools.slice(0, 7);
    return tools.filter((tool) => [tool.title, tool.shortTitle, tool.description, ...tool.keywords]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(normalized))
      .slice(0, 7);
  }, [query, tools]);

  const recentTools = recentSlugs.map((slug) => tools.find((tool) => tool.slug === slug)).filter((tool): tool is SearchTool => Boolean(tool));

  function remember(slug: string) {
    const next = [slug, ...recentSlugs.filter((item) => item !== slug)].slice(0, 3);
    setRecentSlugs(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function openTool(tool: SearchTool) {
    remember(tool.slug);
    window.location.assign(`/${tool.slug}/`);
  }

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matches[0]) openTool(matches[0]);
  }

  return (
    <section className={`tool-discovery-shell${recentTools.length ? " has-recent" : ""}`} aria-label="Find an electrical calculator">
      <div className="tool-discovery-top">
        <div className="calculator-count">
          <strong>{tools.length}</strong>
          <b>Electrical<br />calculators</b>
        </div>
        <div className="tool-search" ref={shellRef}>
          <form onSubmit={submit} role="search">
            <label htmlFor="calculator-search">Find a calculator</label>
            <div className="tool-search-control">
              <input
                id="calculator-search"
                type="search"
                value={query}
                placeholder="Search calculators..."
                autoComplete="off"
                onFocus={() => setOpen(true)}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setOpen(true);
                }}
                aria-expanded={open}
                aria-controls="calculator-search-results"
              />
              <button type="submit" aria-label="Open first matching calculator"><span aria-hidden="true"></span></button>
            </div>
          </form>
          {open ? (
            <div className="tool-search-results" id="calculator-search-results" role="listbox">
              {matches.length ? matches.map((tool) => (
                <button type="button" role="option" key={tool.slug} onClick={() => openTool(tool)}>
                  <span><strong>{tool.title}</strong><small>{tool.description}</small></span>
                  <i aria-hidden="true">→</i>
                </button>
              )) : <p>No calculator matches “{query}”.</p>}
            </div>
          ) : null}
        </div>
      </div>
      {recentTools.length ? (
        <div className="recent-calculators">
          <div className="recent-heading">
            <span className="recent-mark" aria-hidden="true"></span>
            <strong>Last used calculators</strong>
          </div>
          <div className="recent-list">
            {recentTools.map((tool) => (
            <a href={`/${tool.slug}/`} key={tool.slug} onClick={() => remember(tool.slug)}>
              <span>{tool.shortTitle ?? tool.title}</span><i aria-hidden="true">→</i>
            </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
