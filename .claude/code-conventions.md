# Code Conventions

## TypeScript

- Keep TypeScript in strict mode
- Prefer `type` over `interface`

## Formatting

- Use 2-space indentation
- Use single quotes
- Keep comments sparse; add them only when the logic is not obvious

## Naming

- `camelCase` for variables and functions
- `PascalCase` for types and React components
- `UPPER_SNAKE_CASE` for constants

## Data and Imports

- Prefer Prisma upserts for idempotent import behavior
- Keep import data typed and explicit inside the script that owns it

## Docs

- Do not add new documentation files unless the user asks for them
