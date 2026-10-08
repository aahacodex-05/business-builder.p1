import { CourierError, OUT_OF_RANGE, shopPhone, type Address, type Courier } from "./shared";

/** Uber Direct: Uber couriers for orders taken on our own site. */
export const uber: Courier = {
  name: "Uber",

  async quote({ shop, dropoff, orderValue }) {
    const quote = await call("/delivery_quotes", {
      pickup_address: address(shop),
      dropoff_address: address(dropoff),
      pickup_phone_number: shopPhone(shop),
      dropoff_phone_number: dropoff.phone,
      manifest_total_value: orderValue,
    });
    return { fee: quote.fee };
  },

  async dispatch({ ref, shop, dropoff, orderValue, items }) {
    const delivery = await call("/deliveries", {
      external_id: ref,
      pickup_name: `Mocha Express ${shop.name}`,
      pickup_address: address(shop),
      pickup_phone_number: shopPhone(shop),
      dropoff_name: dropoff.name,
      dropoff_address: address(dropoff),
      dropoff_phone_number: dropoff.phone,
      dropoff_notes: dropoff.notes,
      manifest_items: items.map(({ name, quantity }) => ({ name, quantity, size: "small" })),
      manifest_total_value: orderValue,
    });
    return { id: delivery.id, trackingUrl: delivery.tracking_url };
  },
};

/** Uber takes addresses as a JSON string. */
const address = ({ street, unit, city, zip }: Address) =>
  JSON.stringify({
    street_address: unit ? [street, unit] : [street],
    city,
    state: "OR",
    zip_code: zip,
    country: "US",
  });

async function call(path: string, json: object) {
  const customer = process.env.UBER_CUSTOMER_ID;
  if (!customer) throw new Error("UBER_CUSTOMER_ID is not set");

  const response = await fetch(`https://api.uber.com/v1/customers/${customer}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(json),
  });
  const data = await response.json();
  if (response.ok) return data;

  if (response.status === 400) throw new CourierError(OUT_OF_RANGE);
  throw new Error(`Uber ${response.status}: ${data.message ?? data.code}`);
}

let cached: { token: string; expires: number } | undefined;

/** Uber's access token lasts about a month, so it's reused until shortly before it runs out. */
async function token() {
  if (cached && cached.expires > Date.now()) return cached.token;

  const { UBER_CLIENT_ID: id, UBER_CLIENT_SECRET: secret } = process.env;
  if (!id || !secret) throw new Error("Uber keys are not set");

  const response = await fetch("https://auth.uber.com/oauth/v2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: id,
      client_secret: secret,
      grant_type: "client_credentials",
      scope: "eats.deliveries",
    }),
  });
  if (!response.ok) throw new Error(`Uber sign-in failed: ${response.status}`);

  const { access_token, expires_in } = await response.json();
  cached = { token: access_token, expires: Date.now() + (expires_in - 3600) * 1000 };
  return access_token as string;
}
