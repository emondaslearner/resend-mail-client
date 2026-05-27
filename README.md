# Resend Email Client

A local Gmail-style client for Resend inbound email. It can load a Resend key
from `.env` or store manually added account keys in browser local storage.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Account

Set these in `.env` to expose one server-side account in the UI:

```bash
RESEND_FULL_ACCESS="re_..."
RESEND_FROM_EMAIL="Name <support@example.com>"
```

`RESEND_API_KEY` is also accepted as a fallback. Full access is recommended
because inbound retrieval, domains, API key metadata, and replies require more
than send-only access.

## Features

- Switch between multiple Resend accounts.
- Add browser-local accounts by API key.
- Read inbound emails through the Resend Receiving API.
- Read sent messages through the Resend Emails API.
- Reply to inbound emails with `Re:` subjects and thread headers.
- Inspect optional API details: domains, key metadata, headers, raw MIME URL,
  and attachments.
