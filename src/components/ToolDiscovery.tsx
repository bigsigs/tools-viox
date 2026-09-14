import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type SyntheticEvent } from "react";
import { clientLocalePath, clientT, type ClientLocale } from "../lib/i18n-client";
import { toolIcon } from "../lib/toolIcons";
import { searchTools, type SearchableTool } from "../lib/toolSearch";

type Props = {
  tools: SearchableTool[];
  locale?: ClientLocale;
};

const storageKey = "viox:last-used-calculators";

export default function ToolDiscovery({ tools, locale = "en" }: Props) {
  const tr = (text: string) => clientT(locale, text);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const shellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionId = useId().replace(/:/g, "");

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

  useEffect(() => {
    function focusSearch() {
      if (window.location.hash !== "#calculator-search") return;
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
        setOpen(true);
      });
    }
    function handleSearchLink(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href$="#calculator-search"]');
      if (link) window.setTimeout(focusSearch, 0);
    }
    focusSearch();
    window.addEventListener("hashchange", focusSearch);
    document.addEventListener("click", handleSearchLink);
    return () => {
      window.removeEventListener("hashchange", focusSearch);
      document.removeEventListener("click", handleSearchLink);
    };
  }, []);

  const matches = useMemo(() => {
    return searchTools(tools, query);
  }, [query, tools]);

  const recentTools = recentSlugs.map((slug) => tools.find((tool) => tool.slug === slug)).filter((tool): tool is SearchableTool => Boolean(tool));

  function remember(slug: string) {
    const next = [slug, ...recentSlugs.filter((item) => item !== slug)].slice(0, 3);
    setRecentSlugs(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function openTool(tool: SearchableTool) {
    remember(tool.slug);
    window.location.assign(clientLocalePath(locale, `/${tool.slug}/`));
  }

  function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (matches[activeIndex]) openTool(matches[activeIndex]);
  }

  function handleKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => matches.length ? (index + 1) % matches.length : 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => matches.length ? (index - 1 + matches.length) % matches.length : 0);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  function highlighted(text: string) {
    const tokens = query.trim().split(/\s+/).filter((token) => token.length > 1);
    if (!tokens.length) return text;
    const expression = new RegExp(`(${tokens.map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
    return text.split(expression).map((part, index) =>
      tokens.some((token) => part.toLowerCase() === token.toLowerCase())
        ? <mark key={`${part}-${index}`}>{part}</mark>
        : <Fragment key={`${part}-${index}`}>{part}</Fragment>
    );
  }

  return (
    <section className={`tool-discovery-shell${recentTools.length ? " has-recent" : ""}`} aria-label={tr("Find an electrical calculator")}>
      <div className="tool-discovery-top">
        <div className="calculator-count">
          <strong>{tools.length}</strong>
          <b>{tr("Electrical")}<br />{tr("calculators")}</b>
        </div>
        <div className="tool-search" ref={shellRef}>
          <form onSubmit={submit} role="search">
            <label htmlFor="calculator-search">{tr("Find a calculator")}</label>
            <div className="tool-search-control">
              <input
                id="calculator-search"
                ref={inputRef}
                type="search"
                value={query}
                placeholder={tr("Search calculators...")}
                autoComplete="off"
                onFocus={() => setOpen(true)}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                  setOpen(true);
                }}
                onKeyDown={handleKeys}
                aria-expanded={open}
                aria-controls="calculator-search-results"
                aria-activedescendant={open && matches[activeIndex] ? `${optionId}-${activeIndex}` : undefined}
              />
              {query ? (
                <button className="tool-search-clear" type="button" aria-label={tr("Clear search")} title={tr("Clear search")} onClick={() => {
                  setQuery("");
                  setActiveIndex(0);
                  setOpen(true);
                  inputRef.current?.focus();
                }}><span aria-hidden="true">×</span></button>
              ) : null}
              <button className="tool-search-submit" type="submit" aria-label={tr("Open first matching calculator")}><span aria-hidden="true"></span></button>
            </div>
          </form>
          {open ? (
            <div className="tool-search-results" id="calculator-search-results" role="listbox" aria-label={tr("Search calculators...")}>
              {matches.length ? matches.map((tool, index) => (
                <button
                  type="button"
                  role="option"
                  id={`${optionId}-${index}`}
                  aria-selected={index === activeIndex}
                  className={index === activeIndex ? "is-active" : undefined}
                  key={tool.slug}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => openTool(tool)}
                >
                  <b className="tool-search-badge" aria-hidden="true">{toolIcon(tool.slug)}</b>
                  <span><strong>{highlighted(tool.title)}</strong><small>{tool.categoryTitle}</small></span>
                  <i aria-hidden="true">→</i>
                </button>
              )) : <p aria-live="polite">{tr("No calculator matches")} “{query}”.</p>}
            </div>
          ) : null}
        </div>
      </div>
      {recentTools.length ? (
        <div className="recent-calculators">
          <div className="recent-heading">
            <span className="recent-mark" aria-hidden="true"></span>
            <strong>{tr("Last used calculators")}</strong>
          </div>
          <div className="recent-list">
            {recentTools.map((tool) => (
            <a href={clientLocalePath(locale, `/${tool.slug}/`)} key={tool.slug} onClick={() => remember(tool.slug)}>
              <span>{tool.shortTitle ?? tool.title}</span><i aria-hidden="true">→</i>
            </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
