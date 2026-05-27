<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Rules

- Keep source files under 400 lines. Split UI, API helpers, and Resend adapters into focused modules before a file grows past that limit.
- Keep API keys out of committed files. Use `.env` locally or browser local storage for manually added accounts.
- Resend operations that need a key must run through server routes under `src/app/api/resend`.
- Keep the default UI simple: account switcher, message list, selected message, reply box, and optional API details.
- For new feature work, use Conventional Commits only, for example `feat: add account switcher`.
- Commit after each implemented feature is complete and verified.
