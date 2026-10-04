import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeChatError(err: unknown): string {
  const defaultMessage = "Не удалось отправить запрос. Попробуйте ещё раз позже.";
  if (!err) return defaultMessage;

  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  if (
    lower.includes("routerai") ||
    lower.includes("router") ||
    lower.includes("http://") ||
    lower.includes("https://") ||
    lower.includes("fetch failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("econnrefused") ||
    lower.includes("internal server") ||
    lower.includes("api client") ||
    lower.includes("next_public") ||
    lower.includes("endpoint") ||
    lower.includes("upstream") ||
    lower.includes("проверь api")
  ) {
    if (lower.includes("503") || lower.includes("перегружен")) {
      return "Сервер временно перегружен. Пожалуйста, попробуйте чуть позже.";
    }
    if (lower.includes("429") || lower.includes("слишком много")) {
      return "Слишком много запросов. Пожалуйста, подождите минуту.";
    }
    if (lower.includes("504") || lower.includes("ожидания")) {
      return "Время ожидания ответа истекло. Попробуйте снова.";
    }
    return defaultMessage;
  }

  if (lower.includes("429") || lower.includes("слишком много")) {
    return "Слишком много запросов. Пожалуйста, подождите минуту.";
  }
  if (lower.includes("503") || lower.includes("перегружен")) {
    return "Сервер временно перегружен. Пожалуйста, попробуйте чуть позже.";
  }
  if (lower.includes("504") || lower.includes("ожидания")) {
    return "Превышено время ожидания ответа. Попробуйте снова.";
  }

  if (raw.length > 100 || /[a-z0-9.-]+\.[a-z]{2,}/i.test(raw)) {
    return defaultMessage;
  }

  return raw || defaultMessage;
}
