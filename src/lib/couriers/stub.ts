import type { Courier } from "./shared";

/** Pretend courier for trying delivery without a DoorDash or Uber account. Books nothing. */
export const stub: Courier = {
  name: "Test courier",
  quote: async () => ({ fee: 799 }),
  dispatch: async ({ ref }) => ({ id: `stub_${ref}` }),
};
