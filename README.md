## HueBo

A simple HSB color selection app.

Requires Node.js 22.22.2 or newer in the 22 release line, 24.15.0 or newer in the 24 release line, or Node.js 26 or newer, and pnpm 12. Install dependencies with `pnpm install`, then run `pnpm dev` for development. Run `pnpm format` to format code with Oxfmt. Run `pnpm check` to check formatting, run lint, run tests, and build for production. The production build is written to `dist`; run `pnpm preview` to serve it locally. Pushes to `master` and pull requests run `pnpm check` in GitHub Actions (`.github/workflows/ci.yml`).

Set `VITE_GOOGLE_ANALYTICS_ID` to a GA4 measurement ID (such as `G-XXXXXXXXXX`) to enable Google Analytics. Page views, including route changes, are sent by the app, so disable page views based on browser history events in the GA4 web stream’s enhanced measurement settings to avoid double counting. Dependencies must be at least three days old when resolved.

The page gives AI agents four WebMCP tools (see `docs/adr/0005-agent-tools-through-webmcp.md`). Browsers without WebMCP ignore them. Chrome needs an origin trial token in `index.html` until WebMCP ships, or `--enable-experimental-web-platform-features` locally. Run `agent-browser --args "--enable-experimental-web-platform-features" open <url>`, then `agent-browser webmcp list`, to try them.
