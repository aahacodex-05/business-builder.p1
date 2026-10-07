# Milepost

Business website with client accounts. A client's plan, paid on their account, includes an AI assistant (Claude) and email alerts before each deadline (7 days, 1 day and 1 hour by default).

## Run

Requires Node 22.13+.

```sh
npm install
cp .env.example .env   # fill in keys
npm start              # http://localhost:3000
npm test
```

Without `SMTP_URL`, alert emails are printed to the console.

## Setup

- **Stripe:** create a Price for each plan in `src/plans.js` and put the IDs in `.env`. Add a webhook to `APP_URL/api/stripe/webhook` for `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted`. Turn on the customer portal for "Manage billing".
- **HTTPS:** set `APP_URL` to your https address so login cookies are secure.
- **Claude:** set `ANTHROPIC_API_KEY`.
- **Email:** set `SMTP_URL` and `MAIL_FROM`.

Host on any Node server with a persistent disk for the SQLite file (Render, Railway, Fly.io, a VPS).

## Layout

```
server.js          routes
src/db.js          SQLite schema
src/auth.js        accounts and sessions
src/plans.js       plans and prices
src/billing.js     Stripe checkout, portal, webhook
src/deadlines.js   deadline storage
src/alerts.js      email reminders (checked every minute)
src/assistant.js   Claude assistant with deadline tools
public/            the site (one page)
```
