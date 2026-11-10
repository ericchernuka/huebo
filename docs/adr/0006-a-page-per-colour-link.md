# A page per colour link

Every colour has a link (ADR-0004), and sharing that link is the main way people send a colour to each other. Link previews in Slack, iMessage and the like don't run JavaScript, though. With one `index.html` for every path, every shared colour unfurled as the home page.

So the build writes a copy of `index.html` for each of the 4,680 links: `dist/200.html` for a hue and `dist/200/62/75.html` for a pick. Each copy has that colour's title, description, canonical URL and `og:` tags, all from `src/picker/page-head.ts`. That same module gives the app its `<title>`, so the page reads the same before and after React loads. The plugin is in `vite.config.ts`. Vercel serves these files through `cleanUrls`, and anything else still falls through to the SPA rewrite.

The sitemap lists home and the 72 hues only. The picks are canonical to themselves, so a shared one can still be indexed, but thousands of near-identical pages would read as thin content next to hex lookup sites.

## Considered options

- **Edge middleware that rewrites the head per request.** This means a function on every page load, with code to run and cache, for 4,680 answers we already know at build time.
- **A generated image per colour with `@vercel/og`.** This would make previews show the colour itself, and it's the obvious next step. It needs a new dependency and an edge function. For now, every page shares `og.png`.

## Consequences

`dist` holds about 4,700 small HTML files, around 19 MB. `withHead` throws if `index.html` loses a tag it fills, so the build fails rather than shipping every link with the home head.
