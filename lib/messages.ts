import en from "@/messages/en.json";
import es from "@/messages/es.json";
import type { Language } from "@/lib/types";

interface MessageTree {
  [key: string]: string | MessageTree;
}

const messages = {
  en,
  es,
} satisfies Record<Language, MessageTree>;

function lookupValue(obj: MessageTree, path: string): string {
  const segments = path.split(".");
  let current: string | MessageTree | undefined = obj;

  for (const segment of segments) {
    if (!current || typeof current === "string") {
      return path;
    }

    current = current[segment];
  }

  return typeof current === "string" ? current : path;
}

export function translate(
  language: Language,
  key: string,
  values?: Record<string, string | number>,
) {
  let template = lookupValue(messages[language], key);

  if (!values) {
    return template;
  }

  for (const [name, value] of Object.entries(values)) {
    template = template.replaceAll(`{${name}}`, String(value));
  }

  return template;
}

export { messages };
