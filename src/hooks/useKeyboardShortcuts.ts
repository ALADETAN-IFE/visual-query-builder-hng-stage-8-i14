import { useEffect } from "react";
import { useQueryStore } from "@/store/query-store";

export function useKeyboardShortcuts() {
  const resetQuery = useQueryStore((state) => state.resetQuery);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to Run Query
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        const runQueryEvent = new CustomEvent("run-query");
        window.dispatchEvent(runQueryEvent);
      }

      // Ctrl+Escape to Reset Query
      if ((event.ctrlKey || event.metaKey) && event.key === "Escape") {
        event.preventDefault();
        resetQuery();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetQuery]);
}
