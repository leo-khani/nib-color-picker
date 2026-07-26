import { Copy, Heart, Trash2 } from "lucide-react";
import type { HistoryEntry } from "../../types/color";
import type { FormattingSettings } from "../../types/settings";
import { formatColor } from "../../lib/color/color";
import { IconButton } from "../../components/ui/IconButton";
import { FadeBlur } from "../../components/fade-blur";

interface HistoryListProps {
  entries: HistoryEntry[];
  formatting: FormattingSettings;
  favoritesOnly: boolean;
  onFavoritesOnly: (value: boolean) => void;
  onClearNonFavorites: () => void;
  onSelect: (entry: HistoryEntry) => void;
  onCopy: (value: string) => void;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryList({
  entries,
  formatting,
  favoritesOnly,
  onFavoritesOnly,
  onClearNonFavorites,
  onSelect,
  onCopy,
  onFavorite,
  onDelete,
}: HistoryListProps) {
  const visible = entries.filter((entry) => !favoritesOnly || entry.favorite);
  const hasNonFavorites = entries.some((entry) => !entry.favorite);

  return (
    <section
      aria-labelledby="history-title"
      className="flex min-h-0 max-h-[26rem] flex-col overflow-hidden"
    >
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h2 id="history-title" className="text-sm font-semibold">
          Recent colors
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onFavoritesOnly(!favoritesOnly)}
            aria-pressed={favoritesOnly}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white"
          >
            <Heart size={14} fill={favoritesOnly ? "currentColor" : "none"} /> Favorites
          </button>
          <button
            type="button"
            onClick={onClearNonFavorites}
            disabled={!hasNonFavorites}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="rounded-ios-xl bg-zinc-200/70 px-4 py-8 text-center text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {entries.length === 0 ? "Picked colors will appear here." : "No favorite colors yet."}
        </div>
      ) : (
        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-1">
          {visible.map((entry, index) => {
            const preferred = formatColor(entry.rgba, formatting)[formatting.preferredFormat];
            return (
              <li key={entry.id}>
                <FadeBlur
                  animateOnScroll
                  delay={Math.min(index * 0.035, 0.28)}
                  y={12}
                  blur={8}
                  className="group flex items-center gap-2 rounded-ios-xl bg-zinc-900/70 px-2 py-2 hover:bg-zinc-900 duration-200"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(entry)}
                    className="size-9 shrink-0 rounded-ios-sm shadow-sm shadow-black/15"
                    style={{ backgroundColor: entry.hex }}
                    aria-label={`Use ${entry.hex}`}
                  />
                  <button
                    type="button"
                    onClick={() => onSelect(entry)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate font-mono text-sm">{preferred}</span>
                    <span className="block truncate text-xs text-zinc-600 dark:text-zinc-300">
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
                </FadeBlur>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
