# Staff API

What the mobile app calls for staff sign-up, sign-in, shop orders and the owner's team page. It is JSON over HTTPS on the site's own domain, and it is the same code the website's staff screens use.

## Signing in

Sign-up, sign-in and owner sign-in each answer with a session token. Send it on every other call:

```
Authorization: Bearer <token>
```

- Keep the token in secure storage (Keychain / Keystore). It's the only copy; the server keeps just a hash.
- Employee tokens last 30 days and the owner's last 8 hours. Any call can answer `401` when a token has expired or the person's access was removed. Send them back to sign-in.
- The API never sets cookies and ignores them, so website sessions and app sessions are separate.

Errors are `{ "error": "A message that's fine to show" }` with a status: `400` check the input, `401` not signed in or wrong credentials, `403` not allowed, `404` not found, `429` too many tries (ask them to wait a few minutes), `503` owner sign-in isn't set up on the server.

Shop ids: `82nd-ave`, `webster-rd`, `powell-blvd`.

A staff member looks like this:

```json
{ "role": "employee", "id": "0b6c…", "name": "Dana Webster", "shop": "webster-rd" }
{ "role": "owner" }
```

## Employees

### `POST /api/staff/signup`

Turns an employee number from the owner into an account, and signs the person in. A number works once, within 14 days of being issued.

```json
{ "number": "1234 5678", "name": "Dana Webster", "password": "at least 8 characters" }
```

`201` → `{ "token": "…", "staff": { "role": "employee", … } }`

The number can be typed with or without a space. Anything wrong with it (not issued, already used, expired, cancelled) gets the same `400`. Names are up to 60 characters; passwords are 8 to 200. Ask for the password twice in the app; the server doesn't.

### `POST /api/staff/login`

```json
{ "number": "1234 5678", "password": "…" }
```

`200` → `{ "token": "…", "staff": { … } }`. A wrong number or password is `401` with the same message either way. Five wrong tries on a number lock it for 15 minutes (`429`).

### `POST /api/staff/logout`

`204`. Ends this token's session.

### `GET /api/staff/me`

`200` → `{ "staff": { … } }`. A quick way to check a saved token still works when the app opens.

## Orders

### `GET /api/staff/orders`

Today's paid pickup orders at a shop, oldest first. Employees always get their own shop. The owner passes `?shop=webster-rd`.

```json
{
  "shop": "webster-rd",
  "orders": [
    {
      "id": "pi_3Q…",
      "placedAt": "2026-10-08T00:33:10.000Z",
      "name": "Dana",
      "phone": "+15035550101",
      "total": 1600,
      "items": [{ "name": "Mocha", "quantity": 2 }],
      "pickedUp": false
    }
  ]
}
```

`total` is in cents. `phone` is missing when the customer didn't give one. An employee who asks for another shop gets `403`. Poll every 15 seconds like the tablet screen does.

### `POST /api/staff/orders/{id}/picked-up`

`204`. Marks the order picked up (`id` is the order's `id` above). Employees can only do this for their own shop's orders, otherwise `404`.

## Owner

The owner is verified by the Owner ID, made before launch and given to them privately.

### `POST /api/owner/login`

```json
{ "code": "ABCD-EFGH-JKMN-PQRS" }
```

`200` → `{ "token": "…", "staff": { "role": "owner" } }`. Case, spaces and dashes don't matter. Five wrong tries from one address lock owner sign-in for 15 minutes (`429`).

### `GET /api/owner/employees`

Everyone with access or with a number still waiting, newest first.

```json
{
  "employees": [
    {
      "id": "0b6c…",
      "number": "12345678",
      "shop": "webster-rd",
      "name": "Dana Webster",
      "status": "active",
      "expiresAt": "2026-10-21T22:00:00.000Z",
      "signedUpAt": "2026-10-08T00:10:00.000Z"
    }
  ]
}
```

`status` is `pending` (number issued, nobody signed up yet), `expired` (it ran out) or `active`. `name` and `signedUpAt` are `null` until someone signs up. Show numbers as `1234 5678`.

### `POST /api/owner/employees`

```json
{ "shop": "webster-rd" }
```

`201` → `{ "employee": { … } }`, the new number with `status: "pending"`. The owner gives it to the new hire.

### `DELETE /api/owner/employees/{id}`

`204`. Cancels an unused number or removes an employee's access. Their sessions end at once and the number can't be used again. All the owner calls answer `403` to an employee's token.
