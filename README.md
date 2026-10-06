# Mocha Express Coffee

Website and online ordering for Mocha Express Coffee (three locations, greater Portland, OR).

Built with Next.js and Stripe Checkout. Customers add items to a cart, pick a pickup shop and pay through Stripe. Each shop keeps an order screen open on its tablet.

## Setup

```sh
npm install
cp .env.example .env.local   # add your Stripe key and a staff passcode
npm run dev
```

Open http://localhost:3000.

## Order screen for the shops

Each shop opens `/orders` on its tablet (there's a small Staff link in the site footer), signs in with `STAFF_PASSCODE` and picks its shop. The screen lists that shop's paid orders from today (read from Stripe), refreshes every 15 seconds, can chime when an order arrives, and has a "Picked up" button on each order. Set the tablet to never sleep.

## Where things live

- `src/data/menu.ts`: the full menu and prices (the checkout always uses these server-side prices).
- `src/app/(site)/menu`: the full menu page, plus a page for each item at `menu/[id]`.
- `src/data/locations.ts`: shop names, services, addresses, phone numbers and opening hours.
- `src/lib/hours.ts`: opening-hours helpers; a shop only takes online orders while it is open.
- `src/app/api/checkout`: creates the Stripe Checkout session.
- `src/app/(staff)/orders`: the tablet order screen; `src/lib/orders.ts` reads the orders from Stripe.

## TODO

- Add the Gyros Breakfast Bagel to `src/data/menu.ts` once it has a price.
- Swap the lounge illustration and menu item artwork for real photos.
- Confirm which shops have armchairs and free Wi-Fi (listed in `src/components/Space.tsx`).
