# CodeGraphX

This repository now includes a **Next.js + TypeScript + Tailwind + shadcn-style** structure and integrated UI components to reduce a rigid, “boxy” look.

## Project structure defaults

- Components: `components/ui`
- App routes/pages: `app`
- Global styles: `app/globals.css`
- Utilities: `lib/utils.ts`

Using `components/ui` matters because shadcn-generated components assume this location and import path conventions (`@/components/ui/...`). Keeping this structure avoids broken imports and keeps your design system components centralized.

## Added components

- `components/ui/splite.tsx`
- `components/ui/spotlight.tsx`
- `components/ui/card.tsx`
- `components/ui/button.tsx`
- `components/ui/bento-grid.tsx`
- `components/ui/feature-section-with-hover-effects.tsx`

## Dependencies installed

- `@splinetool/runtime`
- `@splinetool/react-spline`
- `framer-motion`
- `@tabler/icons-react`
- `@radix-ui/react-slot`
- `class-variance-authority`
- `@radix-ui/react-icons`
- `lucide-react`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## If you need to reinitialize with shadcn CLI

```bash
npx shadcn@latest init
```

Then ensure:

1. TypeScript is enabled (`tsconfig.json` exists)
2. Tailwind is configured (`tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`)
3. Alias `@/*` is mapped in `tsconfig.json`
4. Generated components target `components/ui`
