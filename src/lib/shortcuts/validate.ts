const MODIFIERS = new Set(["CTRL", "CONTROL", "SHIFT", "ALT", "SUPER", "COMMAND"]);
const KEYS = /^(?:[A-Z0-9]|F(?:[1-9]|1[0-2])|SPACE|ENTER|ESCAPE|ARROW(?:UP|DOWN|LEFT|RIGHT))$/;

export function validateShortcut(shortcut: string): string | null {
  const parts = shortcut
    .split("+")
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean);
  if (parts.length < 2) return "Use at least one modifier and one key.";
  const key = parts.at(-1);
  const modifiers = parts.slice(0, -1);
  if (!key || !KEYS.test(key)) return "Choose a letter, number, function key, or navigation key.";
  if (!modifiers.every((part) => MODIFIERS.has(part)))
    return "The shortcut has an unsupported modifier.";
  if (new Set(parts).size !== parts.length) return "The shortcut contains a repeated key.";
  return null;
}
