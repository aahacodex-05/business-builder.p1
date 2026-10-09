"use client";

import { useRouter } from "next/navigation";

/** Whether this tab's history holds an earlier page of the site (not a new-tab page or another website). */
function hasPageBefore() {
  const { navigation } = window as { navigation?: { canGoBack: boolean } };
  // Browsers without the Navigation API can't tell, so any earlier history counts.
  return navigation ? navigation.canGoBack : window.history.length > 1;
}

/** Goes back to the page the person came from, or to the home page when the staff screen is where they started. */
export function BackButton() {
  const router = useRouter();

  return (
    <button type="button" className="back" onClick={() => (hasPageBefore() ? router.back() : router.push("/"))}>
      ← Back
    </button>
  );
}
