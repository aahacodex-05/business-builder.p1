# Mocha Express app

iPhone and Android ordering app for Mocha Express, built with Expo (React Native).

The app has no backend of its own. It reads the menu and shops from the website and pays through the website's Stripe Checkout, so:

- menu, price and hours changes on the site show up in the app,
- app orders land on the same shop tablet screens as web orders,
- each shop only takes orders while it's open.

## Run it

```sh
npm install
cp .env.example .env   # point EXPO_PUBLIC_SITE_URL at the site
npx expo start         # scan the QR code with Expo Go
```

Checkout opens Stripe in the phone's browser. In a store build it closes itself and returns to the app; in Expo Go, close the browser after paying and the app confirms the order.

## Site endpoints the app uses

| Endpoint | Purpose |
| --- | --- |
| `GET /api/app/catalog` | Menu, categories, popular items, shops with hours and open status |
| `POST /api/checkout` with `from: "app"` | Starts Stripe Checkout; returns `url` and `id` |
| `GET /api/app/orders/:id` | Whether a checkout was paid, for the confirmation screen |
| `GET /order/app` | Stripe's return page; sends the customer back into the app |
| `GET /api/app/staff` | Checks the staff passcode (sent as `Authorization: Bearer`) |
| `GET /api/app/staff/:shop` | A shop's paid pickup orders from today |
| `POST /api/app/staff/:shop` | Marks an order picked up |

## Staff

A small "Staff" link at the bottom of the menu, like the site's footer link, opens the staff sign-in. It uses the site's `STAFF_PASSCODE`, stays signed in on the device, and shows each shop's orders, refreshing every 15 seconds and buzzing when a new one arrives.

## Publishing

Store builds go through EAS (`npx eas build`), which needs an Apple Developer account ($99/year) and a Google Play developer account ($25 once). Bundle id: `com.mochaexpresspdx.app`.
