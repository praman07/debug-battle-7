# E-commerce Backend (TypeScript)

Node.js + Express + MongoDB + TypeScript backend with a strict layered architecture:

```
Route  →  Controller  →  Service  →  Repository  →  (Model)
                ↑             ↑
             req/res      Contract
             only        (abstract class the
                          Service implements)
```

- **Controller** — only reads a typed `Request`, calls the service, sends a typed `Response`. No logic.
- **Service** — all business logic (validation, rules, orchestration). Implements a **Contract**.
- **Repository** — all database logic (typed Mongoose queries). No business rules.
- **Contract** — TypeScript `abstract class` defining the method signatures (with types) a Service must implement.
- **types/** — shared DTOs (`RegisterDTO`, `CreateProductDTO`, etc.) and an Express `Request` augmentation so `req.user` is typed everywhere.

## Folder Structure

```
ecommerce-backend-ts/
├── server entry: src/server.ts
├── tsconfig.json
├── .env.example
└── src/
    ├── app.ts
    ├── types/
    │   ├── dto.types.ts          # shared request/response DTOs
    │   └── express.d.ts          # augments Express Request with req.user
    ├── config/
    │   └── db.ts
    ├── contracts/                # abstract classes (typed method signatures)
    │   ├── user.contract.ts
    │   ├── product.contract.ts
    │   ├── cart.contract.ts
    │   └── order.contract.ts
    ├── controllers/              # req/res only
    │   ├── user.controller.ts
    │   ├── product.controller.ts
    │   ├── cart.controller.ts
    │   └── order.controller.ts
    ├── services/                  # business logic, implements contracts
    │   ├── user.service.ts
    │   ├── product.service.ts
    │   ├── cart.service.ts
    │   └── order.service.ts
    ├── repositories/               # database logic
    │   ├── user.repository.ts
    │   ├── product.repository.ts
    │   ├── cart.repository.ts
    │   ├── order.repository.ts
    │   └── refreshToken.repository.ts
    ├── models/                     # mongoose schemas + TS interfaces
    │   ├── user.model.ts
    │   ├── product.model.ts
    │   ├── cart.model.ts
    │   ├── order.model.ts
    │   └── refreshToken.model.ts   # stores hashed refresh tokens (TTL indexed)
    ├── routes/
    │   ├── index.ts
    │   ├── user.routes.ts
    │   ├── product.routes.ts
    │   ├── cart.routes.ts
    │   └── order.routes.ts
    ├── middlewares/
    │   ├── auth.middleware.ts     # JWT protect + adminOnly
    │   └── error.middleware.ts    # centralized error handler
    └── utils/
        ├── apiResponse.ts
        ├── apiError.ts
        └── token.util.ts           # access/refresh token generation, verification, hashing
```

## The 12 APIs

| # | Method | Endpoint                    | Auth        | Description                          |
|---|--------|-------------------------------|-------------|---------------------------------------|
| 1 | POST   | `/api/users/register`          | Public      | Register a new user (returns access + refresh token) |
| 2 | POST   | `/api/users/login`             | Public      | Login (returns access + refresh token) |
| 3 | POST   | `/api/users/refresh-token`     | Public*     | Exchange a valid refresh token for a new access + refresh token pair |
| 4 | POST   | `/api/users/logout`            | Public*     | Revoke a refresh token (logout)       |
| 5 | GET    | `/api/products`                | Public      | Get all products (supports `?category=` `?search=`) |
| 6 | GET    | `/api/products/:id`            | Public      | Get a single product by id            |
| 7 | POST   | `/api/products`                | Admin only  | Create a new product                  |
| 8 | PUT    | `/api/products/:id`            | Admin only  | Update a product                      |
| 9 | DELETE | `/api/products/:id`            | Admin only  | Delete a product                      |
| 10| POST   | `/api/cart`                     | Logged-in user | Add an item to the cart            |
| 11| POST   | `/api/orders`                   | Logged-in user | Place an order from the current cart |
| 12| GET    | `/api/orders`                   | Logged-in user | Get the logged-in user's order history |

\* `/refresh-token` and `/logout` don't require the `Authorization` header — they authenticate via the refresh token in the request body instead.

## Access token vs refresh token

- **Access token** — short-lived (default 15 min). Sent as `Authorization: Bearer <token>` on every protected request (`/cart`, `/orders`, admin product routes). Stateless — verified by signature only, nothing is stored in the DB for it.
- **Refresh token** — long-lived (default 30 days). Returned once at login/register. Its **SHA-256 hash** (never the raw token) is stored in the `RefreshToken` collection so it can be looked up, rotated, or revoked. Used only to call `/api/users/refresh-token`.
- **Rotation** — every call to `/refresh-token` deletes the old refresh token record and issues a brand-new access + refresh pair. This means a stolen refresh token can be replayed at most once before it stops working, and if the legitimate client also tries to use the now-deleted token, that's a signal of token theft.
- **Logout** — deletes the given refresh token's record from the DB. The corresponding access token remains valid until it naturally expires (since access tokens aren't tracked in the DB), which is the standard, expected tradeoff of stateless access tokens.
- **Auto-cleanup** — the `RefreshToken` collection has a MongoDB TTL index on `expiresAt`, so expired sessions are deleted automatically without a cron job.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/ecommerce_db

   ACCESS_TOKEN_SECRET=your_super_secret_access_token_key
   ACCESS_TOKEN_EXPIRES_IN=15m

   REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key
   REFRESH_TOKEN_EXPIRES_IN=30d
   ```
   Use two **different** secrets for access vs refresh tokens — this way a leaked access-token secret can't be used to forge refresh tokens, or vice versa.

3. Start MongoDB locally (or use MongoDB Atlas and put the connection string in `MONGO_URI`).

4. Run in dev mode (hot reload via `ts-node-dev`):
   ```bash
   npm run dev
   ```

   Or build and run compiled JS:
   ```bash
   npm run build
   npm start
   ```

5. Type-check only, without emitting files:
   ```bash
   npm run typecheck
   ```

6. Server runs at `http://localhost:5000`. All APIs are under `/api`.

## Auth flow

1. Register or login → response contains `data.accessToken` and `data.refreshToken`.
2. Send the access token as `Authorization: Bearer <accessToken>` on protected routes (cart, orders, admin product routes).
3. When the access token expires (401 response), call `/api/users/refresh-token` with the refresh token to get a new pair. Store the new refresh token, discard the old one (it's now invalid).
4. Call `/api/users/logout` with the refresh token when the user logs out, to revoke that session server-side.

To create/update/delete products, the logged-in user must have `role: "admin"`
(set this manually on a user document in the database for testing — there is
no separate "make admin" API by design).

## Example requests

**Register**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"secret123"}'
```
Response:
```json
{
  "statusCode": 201,
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "user" },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  },
  "message": "User registered successfully",
  "success": true
}
```

**Add to cart** (uses access token)
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"productId":"<PRODUCT_ID>","quantity":2}'
```

**Refresh the access token** (uses refresh token, rotates it)
```bash
curl -X POST http://localhost:5000/api/users/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'
```

**Logout** (revokes the refresh token)
```bash
curl -X POST http://localhost:5000/api/users/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'
```

**Place order**
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
