# Mocha Express Coffee

Website and online ordering for Mocha Express Coffee (three locations, greater Portland, OR).

Built with Next.js, Stripe Checkout and Postgres. Customers add items to a cart, pick a pickup shop (or tap "Order here" on a location), or choose delivery, and pay through Stripe. Each shop keeps an order screen open on its tablet, and employees sign in with their own accounts.

## Setup

```sh
npm install
cp .env.example .env.local   # add your Stripe key, database address and owner hash
npm run dev
```

Open http://localhost:3000.

The staff screens need a Postgres database (a free [Neon](https://neon.tech) one works; on Vercel add it under Storage). Put its address in `DATABASE_URL`; the tables are created the first time it's used.

### Owner ID

The owner signs in with an Owner ID, made once before launch:

```sh
npm run owner-code
```

It prints the Owner ID and `OWNER_CODE_HASH`. Give the owner the ID privately and set only the hash in the site's environment variables; the ID can't be worked out from the hash, and nothing about it belongs in the repo. If the ID is lost or gets out, run the command again and set the new hash; the old ID stops working.

## Delivery

Customers can switch the cart to Delivery, enter their address and phone, and pay the courier's live delivery fee as a line on the Stripe checkout. Once Stripe confirms the payment, the site books a driver from the chosen shop through DoorDash Drive or Uber Direct. Delivery orders show on the same shop tablet with the address, the driver status and a tracking link; staff tap "Handed to driver" when it leaves.

To turn it on:

1. Make a DoorDash Drive account at developer.doordash.com (or an Uber Direct one at direct.uber.com), add a payment card, create a production access key, and set the keys and `DELIVERY_COURIER` from `.env.example`.
2. In Stripe, add a webhook to `https://<site>/api/stripe/webhook` for `checkout.session.completed` and set its signing secret as `STRIPE_WEBHOOK_SECRET`.
3. Redeploy; the Delivery choice appears in the cart once a courier is set.

`DELIVERY_COURIER=stub` turns on a pretend courier ($7.99, books nothing) for trying the flow. If booking fails, Stripe retries the webhook for three days and the tablet shows "Booking a driver…" meanwhile, so staff can call the customer.

## Staff

The small Staff link in the site footer opens `/orders`.

- **Owner:** `/orders/owner` asks for the Owner ID. From there the owner gets an employee number for a shop, sees the team, cancels unused numbers and removes people's access (their sessions end at once). The owner can also open any shop's order screen.
- **Employees:** sign up at `/orders/signup` with an employee number from the owner (8 digits, one use, good for 14 days) and choose a name and password. After that they sign in with the number and password and see only their own shop's screen.
- **Order screen:** lists the shop's paid orders from today (read from Stripe), refreshes every 15 seconds, can chime when an order arrives, and has a "Picked up" button on each order. Set the tablet to never sleep.

Passwords are stored as scrypt hashes and sessions as hashes of random tokens. Wrong sign-in, sign-up and owner tries are limited per address and per account; the address comes from the `x-real-ip` / `x-forwarded-for` headers, which Vercel sets itself.

The mobile app uses the same accounts through a JSON API: see [docs/staff-api.md](docs/staff-api.md).

## Where things live

- `src/data/menu.ts`: the full menu and prices (the checkout always uses these server-side prices).
- `src/app/(site)/menu`: the full menu page, plus a page for each item at `menu/[id]`.
- `src/data/locations.ts`: shop names, services, addresses, phone numbers and opening hours.
- `src/lib/hours.ts`: opening-hours helpers; a shop only takes online orders while it is open.
- `src/app/api/checkout`: creates the Stripe Checkout session (with the delivery fee for delivery orders).
- `src/lib/couriers`: DoorDash Drive, Uber Direct and the stub courier; `src/lib/delivery.ts` checks addresses and books drivers from `src/app/api/stripe/webhook`.
- `src/app/(staff)/orders`: the staff screens (sign-in, sign-up, shop orders, owner page); `src/lib/orders.ts` reads the orders from Stripe.
- `src/lib/accounts.ts`, `employees.ts`, `staff.ts`: sign-up and sign-in, employee numbers, sessions. `src/app/api/staff` and `src/app/api/owner` are the app's endpoints.

## TODO

- Add the Gyros Breakfast Bagel to `src/data/menu.ts` once it has a price.
- Swap the lounge illustration and menu item artwork for real photos.
- Confirm which shops have armchairs and free Wi-Fi (listed in `src/components/Space.tsx`).
