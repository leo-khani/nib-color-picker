import { Copy, Heart, Search, Trash2 } from "lucide-react";
import type { HistoryEntry } from "../../types/color";
import type { FormattingSettings } from "../../types/settings";
import { formatColor } from "../../lib/color/color";
import { IconButton } from "../../components/ui/IconButton";

interface HistoryListProps {
  entries: HistoryEntry[];
  formatting: FormattingSettings;
  search: string;
  favoritesOnly: boolean;
  onSearch: (value: string) => void;
  onFavoritesOnly: (value: boolean) => void;
  onSelect: (entry: HistoryEntry) => void;
  onCopy: (value: string) => void;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryList({
  entries,
  formatting,
  search,
  favoritesOnly,
  onSearch,
  onFavoritesOnly,
  onSelect,
  onCopy,
  onFavorite,
  onDelete,
}: HistoryListProps) {
  const query = search.trim().toLowerCase();
  const visible = entries.filter(
    (entry) =>
      (!favoritesOnly || entry.favorite) &&
      (!query ||
        entry.hex.toLowerCase().includes(query) ||
        entry.label?.toLowerCase().includes(query)),
  );

  return (
    <section aria-labelledby="history-title">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="history-title" className="text-sm font-semibold">
          Recent colors
        </h2>
        <button
          type="button"
          onClick={() => onFavoritesOnly(!favoritesOnly)}
          aria-pressed={favoritesOnly}
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <Heart size={14} fill={favoritesOnly ? "currentColor" : "none"} /> Favorites
        </button>
      </div>
      <label className="relative mb-3 block">
        <span className="sr-only">Search history</span>
        <Search size={15} className="absolute left-3 top-2.5 text-zinc-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search colors or labels"
          className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
        />
      </label>
      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
          {entries.length === 0
            ? "Picked colors will appear here."
            : "No colors match this filter."}
        </div>
      ) : (
        <ul className="space-y-1">
          {visible.map((entry) => {
            const preferred = formatColor(entry.rgba, formatting)[formatting.preferredFormat];
            return (
              <li
                key={entry.id}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <button
                  type="button"
                  onClick={() => onSelect(entry)}
                  className="size-9 shrink-0 rounded-lg border border-black/10"
                  style={{ backgroundColor: entry.hex }}
                  aria-label={`Use ${entry.hex}`}
                />
                <button
                  type="button"
                  onClick={() => onSelect(entry)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block truncate font-mono text-sm">{preferred}</span>
                  <span className="block truncate text-xs text-zinc-500">
                    {entry.label ?? new Date(entry.timestamp).toLocaleString()}
                  </span>
                </button>
                <IconButton
                  label={entry.favorite ? "Remove favorite" : "Add favorite"}
                  active={entry.favorite}
                  onClick={() => onFavorite(entry.id)}
                >
                  <Heart size={15} fill={entry.favorite ? "currentColor" : "none"} />
                </IconButton>
                <IconButton label={`Copy ${preferred}`} onClick={() => onCopy(preferred)}>
                  <Copy size={15} />
                </IconButton>
                <IconButton label={`Delete ${preferred}`} onClick={() => onDelete(entry.id)}>
                  <Trash2 size={15} />
                </IconButton>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
