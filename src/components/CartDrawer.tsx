"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { LOCATIONS } from "@/data/locations";
import { findItem, formatPrice } from "@/data/menu";
import { useCart } from "@/lib/cart";
import { isOpen as isShopOpen } from "@/lib/hours";

const EMPTY_ADDRESS = { street: "", unit: "", city: "", zip: "", phone: "", notes: "" };

/** `canDeliver` is whether the site has a delivery courier set up. */
export function CartDrawer({ canDeliver }: { canDeliver: boolean }) {
  const { lines, subtotal, isOpen, setOpen, setQuantity, locationId, setLocationId } = useCart();
  const [delivering, setDelivering] = useState(false);
  const [address, setAddress] = useState(EMPTY_ADDRESS);
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

  const edit = (field: keyof typeof EMPTY_ADDRESS) => (event: ChangeEvent<HTMLInputElement>) =>
    setAddress((current) => ({ ...current, [field]: event.target.value }));

  async function checkout(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines, locationId, name, delivery: delivering ? address : undefined }),
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
                    <button type="button" onClick={() => setQuantity(item.id, quantity + 1)} aria-label={`Add one ${item.name}`}>
                      +
                    </button>
                  </span>
                  <span>{formatPrice(item.price * quantity)}</span>
                </li>
              ))}
            </ul>

            {canDeliver && (
              <div className="choice" role="group" aria-label="Pickup or delivery">
                <button type="button" aria-pressed={!delivering} onClick={() => setDelivering(false)}>
                  Pickup
                </button>
                <button type="button" aria-pressed={delivering} onClick={() => setDelivering(true)}>
                  Delivery
                </button>
              </div>
            )}

            <label>
              {delivering ? "Deliver from" : "Pickup location"}
              <select
                required
                value={closedIds.includes(locationId) ? "" : locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                <option value="" disabled>
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

            {delivering && (
              <>
                <label>
                  Street address
                  <input required autoComplete="address-line1" value={address.street} onChange={edit("street")} />
                </label>
                <label>
                  Apt or suite (optional)
                  <input autoComplete="address-line2" value={address.unit} onChange={edit("unit")} />
                </label>
                <div className="drawer__row">
                  <label>
                    City
                    <input required autoComplete="address-level2" value={address.city} onChange={edit("city")} />
                  </label>
                  <label>
                    ZIP
                    <input
                      required
                      inputMode="numeric"
                      pattern="\d{5}"
                      autoComplete="postal-code"
                      value={address.zip}
                      onChange={edit("zip")}
                    />
                  </label>
                </div>
                <label>
                  Phone for the driver
                  <input required type="tel" autoComplete="tel" value={address.phone} onChange={edit("phone")} />
                </label>
                <label>
                  Note for the driver (optional)
                  <input maxLength={200} placeholder="Gate code, leave at door…" value={address.notes} onChange={edit("notes")} />
                </label>
              </>
            )}

            <div className="drawer__total">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="btn btn--block" disabled={submitting}>
              {submitting ? "Heading to checkout…" : "Checkout"}
            </button>
            <p className="fine-print">
              {delivering && "Delivery fee is added at checkout. "}Secure payment by Stripe.
            </p>
          </form>
        )}
      </aside>
    </div>
  );
}
