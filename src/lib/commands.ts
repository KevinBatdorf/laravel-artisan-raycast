import Fuse from "fuse.js";
import { DATA_URL } from "../config";
import { ConsoleCommand } from "../types";

export async function fetchVersions() {
  const response = await fetch(`${DATA_URL}/index.ts`);
  if (!response.ok) throw new Error(`Couldn't load the Laravel versions (${response.status}).`);
  // The weekly build writes one `"13.x": v13,` line per version, newest first
  return [...(await response.text()).matchAll(/"(\d+\.x)":/g)].map(([, version]) => version);
}

export async function fetchCommands(version: string) {
  const response = await fetch(`${DATA_URL}/${version}.json`);
  if (!response.ok) throw new Error(`Couldn't load the commands for Laravel ${version} (${response.status}).`);
  const commands = (await response.json()) as ConsoleCommand[];
  // Names starting with _ are Artisan's internal commands
  return commands.filter((command) => !command.name.startsWith("_"));
}

// Option and argument text is long, so only a strict match there counts
export function searchCommands(commands: ConsoleCommand[], term: string) {
  if (!term.trim()) return commands;
  const loose = new Fuse(commands, {
    keys: ["name", "aliases", "description", "synopsis"],
    ignoreLocation: true,
    includeScore: true,
    threshold: 0.5,
  });
  const strict = new Fuse(commands, {
    keys: ["arguments.description", "options.description"],
    ignoreLocation: true,
    includeScore: true,
    threshold: 0.1,
  });
  const ranked = [...loose.search(term), ...strict.search(term)].sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
  const seen = new Set<string>();
  const results: ConsoleCommand[] = [];
  for (const { item } of ranked) {
    if (seen.has(item.name)) continue;
    seen.add(item.name);
    results.push(item);
  }
  return results;
}
