import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError, endSession, getMe, type Session } from "./api";
import { deleteSecure, getSecure, setSecure } from "./secureStorage";

const STORAGE_KEY = "mocha-express-staff-session";

type StaffState = {
  /** Undefined while loading, null when signed out. */
  session?: Session | null;
  start: (session: Session) => Promise<void>;
  signOut: () => void;
  /** Call with any error from a staff request: a 401 means the session ended, so it signs out. */
  handleError: (error: unknown) => string;
};

const StaffContext = createContext<StaffState | null>(null);

export function StaffProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>();

  const clear = useCallback(() => {
    deleteSecure(STORAGE_KEY).catch(() => {});
    setSession(null);
  }, []);

  // Restore the saved session, then check it still works (access can be removed at any time).
  useEffect(() => {
    getSecure(STORAGE_KEY)
      .then((saved) => {
        const restored: Session | null = saved ? JSON.parse(saved) : null;
        setSession(restored);
        if (restored)
          getMe(restored.token)
            .then((staff) => setSession({ ...restored, staff }))
            .catch((err) => err instanceof ApiError && err.status === 401 && clear());
      })
      .catch(() => setSession(null));
  }, [clear]);

  const value = useMemo<StaffState>(
    () => ({
      session,
      start: async (next) => {
        await setSecure(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        setSession(next);
      },
      signOut: () => {
        if (session) endSession(session.token).catch(() => {});
        clear();
      },
      handleError: (error) => {
        if (error instanceof ApiError && error.status === 401) clear();
        return error instanceof Error ? error.message : String(error);
      },
    }),
    [session, clear],
  );

  return <StaffContext value={value}>{children}</StaffContext>;
}

export function useStaff() {
  const staff = useContext(StaffContext);
  if (!staff) throw new Error("useStaff must be used inside StaffProvider");
  return staff;
}
