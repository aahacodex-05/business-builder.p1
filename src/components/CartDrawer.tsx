"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LOCATIONS } from "@/data/locations";
import { MAX_QUANTITY, findItem, formatPrice } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { isOpen as isShopOpen } from "@/lib/hours";

export function CartDrawer() {
  const { lines, subtotal, isOpen, setOpen, setQuantity, locationId, setLocationId } = useCart();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [closedIds, setClosedIds] = useState<string[]>([]);

  // Which shops are closed is only known in the browser, so it's worked out when the cart opens.
  useEffect(() => {
    if (isOpen) setClosedIds(LOCATIONS.filter(({ hours }) => !isShopOpen(hours)).map(({ id }) => id));
  }, [isOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const entries = Object.entries(lines).flatMap(([id, quantity]) => {
    const item = findItem(id);
    return item ? [{ item, quantity }] : [];
  });

  async function checkout(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, locationId, name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className={`drawer ${isOpen ? "is-open" : ""}`} inert={!isOpen}>
      <div className="drawer__scrim" onClick={() => setOpen(false)} />
      <aside className="drawer__panel" role="dialog" aria-label="Your order">
        <div className="drawer__head">
          <h2>Your order</h2>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart">
            ×
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="drawer__empty">Your cart is empty. Add something tasty from the menu.</p>
        ) : (
          <form className="drawer__body" onSubmit={checkout}>
            <ul className="lines">
              {entries.map(({ item, quantity }) => (
                <li key={item.id}>
                  <span className="lines__name">{item.name}</span>
                  <span className="qty">
                    <button type="button" onClick={() => setQuantity(item.id, quantity - 1)} aria-label={`Remove one ${item.name}`}>
                      −
                    </button>
                    {quantity}
                    <button
                      type="button"
                      onClick={() => setQuantity(item.id, quantity + 1)}
                      aria-label={`Add one ${item.name}`}
                      disabled={quantity >= MAX_QUANTITY}
                    >
                      +
                    </button>
                  </span>
                  <span>{formatPrice(item.price * quantity)}</span>
                </li>
              ))}
            </ul>

            <label>
              Pickup location
              <select
                required
                value={closedIds.includes(locationId) ? "" : locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                <option value="" disabled hidden>
                  Choose a shop
                </option>
                {LOCATIONS.map((location) => (
                  <option key={location.id} value={location.id} disabled={closedIds.includes(location.id)}>
                    {location.name}, {location.city}
                    {closedIds.includes(location.id) && " (closed)"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Name for the order
              <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            <div className="drawer__total">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn--block" disabled={submitting}>
              {submitting ? "Heading to checkout…" : "Checkout"}
            </button>
            <p className="fine-print">Secure payment by Stripe.</p>
          </form>
        )}
      </aside>
    </div>
  );
}
