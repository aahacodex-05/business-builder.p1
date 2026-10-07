import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { checkPasscode } from "./api";

const STORAGE_KEY = "mocha-express-staff";

type Staff = {
  /** Undefined while loading, null when signed out. */
  passcode?: string | null;
  signIn: (attempt: string) => Promise<void>;
  signOut: () => void;
};

const StaffContext = createContext<Staff | null>(null);

/** Shop tablets stay signed in, like the site's staff cookie; a new passcode signs them out. */
export function StaffProvider({ children }: { children: ReactNode }) {
  const [passcode, setPasscode] = useState<string | null>();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(setPasscode)
      .catch(() => setPasscode(null));
  }, []);

  const value = useMemo<Staff>(
    () => ({
      passcode,
      signIn: async (attempt) => {
        await checkPasscode(attempt);
        await AsyncStorage.setItem(STORAGE_KEY, attempt).catch(() => {});
        setPasscode(attempt);
      },
      signOut: () => {
        AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
        setPasscode(null);
      },
    }),
    [passcode],
  );

  return <StaffContext value={value}>{children}</StaffContext>;
}

export function useStaff() {
  const staff = useContext(StaffContext);
  if (!staff) throw new Error("useStaff must be used inside StaffProvider");
  return staff;
}
