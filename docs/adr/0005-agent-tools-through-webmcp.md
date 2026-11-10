# Agents choose colours through WebMCP tools

Huebo exposes four WebMCP tools (`read_colour`, `choose_colour`, `list_squares`, `choose_format`) with Chrome's `use-webmcp-tool` hook, in `src/picker/agent/`. Where the browser has no `document.modelContext`, the hook does nothing.

An agent's choice goes through the dial's reducer as a `jump` event (ADR-0002), carrying the whole colour already resolved against the link. So it is one history entry, it catches a coasting wheel like any other input, and `pnpm verify` covers it. The tools speak the glossary: they take any hue, saturation, brightness or hex, snap it to Huebo's stops and steps, and say when they did.

## Considered options

- **`usewebmcp` / `@mcp-b/react-webmcp`.** These are richer, with execution state, prompts and resources, but the React package pulls in an MCP client and wants a global runtime installed. Huebo needs none of that.
- **Calling `document.modelContext.registerTool` directly.** This is small, but it means hand-writing what the hook already does: unregistering with an `AbortSignal`, waiting for an extension that injects the API late, and turning results and thrown errors into MCP content.
- **A tool per control (step, aim, pick).** This mirrors the UI, but it makes an agent drive the dial step by step. One `choose_colour` that takes any combination is what an agent wants.

## Consequences

WebMCP is in an origin trial and its API is still moving. The hook is version 0.3. Copy is not a tool, because writing to the clipboard needs a person's gesture; every tool returns the colour's text instead.
