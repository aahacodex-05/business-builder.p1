import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import { getCatalog, type Catalog } from "./api";

type CatalogState = {
  catalog?: Catalog;
  error?: string;
  refresh: () => Promise<void>;
};

const CatalogContext = createContext<CatalogState | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<Catalog>();
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    try {
      setCatalog(await getCatalog());
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  // Menu changes and open hours stay current whenever the app comes back to the front.
  useEffect(() => {
    refresh();
    const subscription = AppState.addEventListener("change", (state) => state === "active" && refresh());
    return () => subscription.remove();
  }, [refresh]);

  const value = useMemo(() => ({ catalog, error, refresh }), [catalog, error, refresh]);
  return <CatalogContext value={value}>{children}</CatalogContext>;
}

/** Loading state for the catalog, plus a way to reload it. */
export function useCatalogStatus() {
  const state = useContext(CatalogContext);
  if (!state) throw new Error("useCatalog must be used inside CatalogProvider");
  return state;
}

/** The loaded catalog; screens only render once it has arrived. */
export function useCatalog() {
  const { catalog } = useCatalogStatus();
  if (!catalog) throw new Error("The catalog has not loaded yet");
  return catalog;
}

export function useItem(id: string) {
  return useCatalog().menu.find((item) => item.id === id);
}
