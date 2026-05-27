# Resend Mail Client

A simple mail client for working with Resend accounts.

It gives you a familiar inbox, sent folder, account switcher, message view, and reply box in one focused local app. It is meant for checking received mail, replying quickly, and moving between multiple Resend accounts without needing a separate dashboard flow.

The app keeps the main screen clean by default and shows extra account or message details only when you ask for them.

## Run Locally

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:3000`.

To use a default local account, add your Resend key and sender address to `.env`:

```bash
RESEND_FULL_ACCESS="re_..."
RESEND_FROM_EMAIL="Name <you@example.com>"
```
