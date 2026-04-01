# Departure Dashboards — Client Access

> **This file is gitignored. It lives locally only. Do not commit.**

## How Passwords Work

Each client has a unique password that serves two purposes:
1. At the login page (`departure.is/dashboard/`), the password routes to the correct client dashboard
2. At the client URL (`departure.is/dashboard/sunstrong/`), the password unlocks the dashboard directly

Passwords are stored as SHA-256 hashes in the source. To generate a new hash:

```js
// Run in browser console:
crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
  .then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('')))
```

---

## Active Clients

| Client              | URL          | Password     | Hash                                                               | Added      |
|---------------------|---------------|--------------|--------------------------------------------------------------------|------------|
| SunStrong Management | `departure.is/dashboard/sunstrong/` | `deptxsunstrong26`  | `3867da6e50ffd505c7272e6f450c988f7e227a2b22fa8a156040e51cb709ab3a` | 2026-03-16 |

---

## Adding a New Client

1. Generate a password hash (see above)
2. Duplicate `public/sunstrong/` -> `public/new-client/`
3. In the new `index.html`: update `PASSWORD_HASH`, data variables, and the `sessionKey`
4. In `public/index.html`: add entry to the `CLIENTS` array
5. Add a row to this file
6. Push and deploy

## Revoking Access

To change a client's password:
1. Generate a new hash
2. Update the hash in both `public/index.html` (router) and `public/clientname/index.html`
3. Update this file
4. Push and deploy — old password stops working immediately

## Notes

- Shared with client via: [how you communicate it — email, kickoff call, etc.]
- Consider rotating passwords if a client contact leaves the project
- V2 plan: move to Vercel Edge Middleware for server-side auth
