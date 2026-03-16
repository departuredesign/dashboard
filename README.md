# Departure Dashboards

A password-protected, multi-client project dashboard system.

**By [Departure Studio](https://departurestudio.com)**

## How It Works

One deploy, multiple clients. Each client gets their own password and dashboard. A universal login page at the root URL routes to the correct client based on their password.

```
public/
├── index.html              ← Universal login (routes by password)
├── shared/
│   ├── styles.css          ← Design system (Inter Tight, editorial)
│   ├── engine.js           ← Rendering engine + auth logic
│   └── template.html       ← Reference template (not loaded at runtime)
├── sunstrong/
│   └── index.html          ← SunStrong dashboard + data
├── next-client/            ← Future clients go here
│   └── index.html
└── ...
```

## Deploy

1. Push to GitHub
2. Connect to Vercel
3. Deploy — no build step, no dependencies

Live at `your-project.vercel.app`.

## Adding a New Client

1. **Duplicate a client folder:**
   ```
   cp -r public/sunstrong public/new-client
   ```

2. **Generate a password hash** (run in browser console):
   ```js
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('clientpassword'))
     .then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('')))
   ```

3. **Update the new client's `index.html`:**
   - Replace `PASSWORD_HASH` with the new hash
   - Replace `CLIENT_DATA` with the client's project data
   - Update the `sessionKey` in `initGate()` (e.g., `"dash_newclient"`)

4. **Add to the router** in `public/index.html`:
   ```js
   CLIENTS.push({
     hash: "the-hash-you-generated",
     path: "/new-client/",
   });
   ```

5. Push and deploy.

## Updating a Client's Dashboard

All project data lives in the `CLIENT_DATA` object in each client's `index.html`. Update the data, push, and the dashboard reflects the changes immediately.

The data structure supports:
- **Engagement details** — client name, dates, lead, type
- **Phases** — with active/upcoming status
- **Milestones** — with done/active/upcoming status
- **Task groups** — tabbed views, each with optional sections
- **Needs** — open client dependencies with urgency

The week counter and progress bar calculate automatically from today's date.

## Passwords

Each client has their own password stored as a SHA-256 hash. The root login page checks the entered password against all client hashes and redirects to the matching dashboard.

Individual client pages also have their own password gate as a fallback (in case someone bookmarks the direct URL).

> **Note:** This is client-side auth suitable for low-stakes access control. For Vercel Pro plans, you can layer on [Vercel Password Protection](https://vercel.com/docs/security/deployment-protection/methods-to-protect-deployments/password-protection) for server-side enforcement.

## Stack

- Zero dependencies
- Static HTML / CSS / JS
- Inter Tight via Google Fonts
- No framework, no build step, no npm
