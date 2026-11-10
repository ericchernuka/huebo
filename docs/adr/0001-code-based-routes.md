# Code-based routes

Routes are defined in code in `src/router/` rather than with TanStack Router's file-based generator. Huebo has one real route with optional segments, plus a redirect for links that don't parse. A generated route tree, a codegen step and a file-name convention would cost more than the two files they'd replace.
