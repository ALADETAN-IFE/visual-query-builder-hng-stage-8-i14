// Lightweight class name merge utility (no external dependency)
export function cn(...inputs: (string | number | boolean | undefined | null)[]): string {
  return inputs
    .filter((x) => typeof x === "string" || typeof x === "number")
    .map((x) => String(x).trim())
    .filter(Boolean)
    .join(" ");
}

// Generate unique IDs for query nodes
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Format a date for display
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Debounce utility for search inputs
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Deep clone an object (for immutable state updates)
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Truncate a string with ellipsis
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// Download content as a file
export function downloadFile(content: string, filename: string, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Read a file as text
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// Nesting depth color
export function getDepthColor(depth: number): string {
  const colors = [
    "var(--depth-0)",
    "var(--depth-1)",
    "var(--depth-2)",
    "var(--depth-3)",
    "var(--depth-4)",
    "var(--depth-5)",
  ];
  return colors[depth % colors.length];
}
