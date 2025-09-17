# Development Guide

## Pre-commit Checks

To avoid build failures on Vercel, always run these checks before committing:

```bash
# Quick check (lint + TypeScript)
npm run type-check
npm run lint

# Or run all checks at once
./check.sh

# Full check including build (slower but comprehensive)
npm run check-all
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (catches all errors)
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run check-all` - Run all checks including build

## Git Hooks

A pre-push hook is installed that runs lint and type checks automatically before pushing to prevent broken builds on Vercel.

## Common Issues

1. **TypeScript errors not caught by ESLint**: Always run `npm run type-check` or `npm run build` before pushing
2. **Suspense boundary errors**: Client components using `useSearchParams()` must be wrapped in Suspense
3. **Build timeouts**: The build process can take a while locally, be patient