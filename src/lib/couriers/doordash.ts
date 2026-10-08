import { createHmac } from "node:crypto";
import { CourierError, OUT_OF_RANGE, formatAddress, shopPhone, type Courier, type DeliveryJob } from "./shared";

const API = "https://openapi.doordash.com/drive/v2";

/** DoorDash Drive: on-demand Dashers for orders taken on our own site. */
export const doordash: Courier = {
  name: "DoorDash",

  async quote(job) {
    // Quotes get their own id so the real delivery can use the job's ref later.
    const quote = await call("/quotes", { ...body(job), external_delivery_id: `quote_${job.ref}` });
    return { fee: quote.fee };
  },

  async dispatch(job) {
    const delivery = await call("/deliveries", body(job)).catch(async (error) => {
      // Already booked by an earlier try.
      if (error instanceof DoorDashError && error.status === 409) return call(`/deliveries/${job.ref}`);
      throw error;
    });
    return { id: delivery.external_delivery_id, trackingUrl: delivery.tracking_url };
  },
};

const body = ({ ref, shop, dropoff, orderValue }: DeliveryJob) => ({
  external_delivery_id: ref,
  pickup_business_name: `Mocha Express ${shop.name}`,
  pickup_address: formatAddress(shop),
  pickup_phone_number: shopPhone(shop),
  dropoff_contact_given_name: dropoff.name,
  dropoff_address: formatAddress(dropoff),
  dropoff_phone_number: dropoff.phone,
  dropoff_instructions: dropoff.notes,
  order_value: orderValue,
});

class DoorDashError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function call(path: string, json?: object) {
  const response = await fetch(API + path, {
    method: json ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: json && JSON.stringify(json),
  });
  const data = await response.json();
  if (response.ok) return data;

  // 400s on a quote mean the address is bad or outside the Dasher area.
  if (response.status === 400 || response.status === 422) throw new CourierError(OUT_OF_RANGE);
  throw new DoorDashError(response.status, `DoorDash ${response.status}: ${data.message ?? data.code}`);
}

/** DoorDash's short-lived signed token, made from the developer portal's access key. */
function token() {
  const { DOORDASH_DEVELOPER_ID: developer, DOORDASH_KEY_ID: key, DOORDASH_SIGNING_SECRET: secret } = process.env;
  if (!developer || !key || !secret) throw new Error("DoorDash keys are not set");

  const now = Math.floor(Date.now() / 1000);
  const encode = (part: object) => Buffer.from(JSON.stringify(part)).toString("base64url");
  const unsigned = `${encode({ alg: "HS256", typ: "JWT", "dd-ver": "DD-JWT-V1" })}.${encode({
    aud: "doordash",
    iss: developer,
    kid: key,
    iat: now,
    exp: now + 300,
  })}`;
  const signature = createHmac("sha256", Buffer.from(secret, "base64url")).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}
