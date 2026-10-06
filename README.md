# Mocha Express Coffee

Website and online ordering for Mocha Express Coffee (three locations, greater Portland, OR).

Built with Next.js and Stripe Checkout. Customers add items to a cart, pick a pickup location and pay through Stripe; the shop sees paid orders in the Stripe dashboard and via the order webhook.

## Setup

```sh
npm install
cp .env.example .env.local   # add your Stripe keys
npm run dev
```

Open http://localhost:3000.

To receive order webhooks locally, run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and put the printed secret in `STRIPE_WEBHOOK_SECRET`.

## Where things live

- `src/data/menu.ts`: menu items and prices (the checkout always uses these server-side prices).
- `src/app/menu/[id]`: a page for each menu item.
- `src/data/locations.ts`: shop addresses and map links.
- `src/lib/hours.ts`: opening hours; checkout is closed outside them.
- `src/app/api/checkout`: creates the Stripe Checkout session.
- `src/app/api/webhooks/stripe`: handles paid orders.

## TODO

- Add real addresses and map links for the three locations.
- Fill in the full menu and prices.
- Decide how the shop is notified of new orders (email, SMS or an order screen).
- Swap the lounge illustration and menu item artwork for real photos.
- Confirm the shops offer free Wi-Fi (listed in `src/components/Space.tsx`).
