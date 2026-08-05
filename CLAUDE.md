# Qual AI - Frontend Documentation for AI Agents

This file provides an overview and guidelines for the `Qual AI` frontend application.

## 1. Project Overview
Qual AI is a full-stack AI chat application. The frontend is built with Next.js 15 App Router and React 19, interacting with the Qual AI FastAPI backend service.

## 2. Frontend Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- UI Components: shadcn/ui, Radix UI, Lucide React
- Authentication: Clerk (`@clerk/nextjs`)
- Styling: `next-themes`, `class-variance-authority`, `clsx`, `tailwind-merge`

## 3. Directory Structure
- `/src`: Frontend codebase.
  - `/src/app`: Next.js App Router pages and layouts.
  - `/src/components`: React components and UI widgets.
  - `/src/lib`: Utilities and context providers.
  - `middleware.ts`: Next.js middleware for Clerk authentication.
- `/public`: Static assets (e.g., logo, icons).

## 4. Key Frontend Guidelines & Constraints
1. **Tooling Rules:** Always use specific tools (`grep_search`, `list_dir`, `view_file`) instead of running standard bash commands where possible.
2. **Frontend Modifications:**
   - Use Next.js 15 App Router conventions inside `/src/app`.
   - Adhere to React 19 paradigms.
   - Use Tailwind CSS 4 for styling, and reuse shadcn/ui components where applicable.
   - Avoid generic colors; use modern design aesthetics.
3. **No `npm run build` during dev testing:** NEVER run `npm run build` or `next build` to verify frontend changes while the user's dev server is active. Running `next build` wipes `.next/` cache and breaks the running `next dev` server and browser Service Worker (`ENOENT _buildManifest.js` error). Use `npx tsc --noEmit` for type checking instead.
4. **Model Conventions on Frontend:**
   - The frontend ONLY displays and handles QualAI model names (`QualAI-1.5`, `QualAI-1.5-mini`, `QualAI-Code`, `QualAI-Code-Max`, `QualAI-1`, `QualAI-1-mini`).
   - The list of available models and metadata (badges, categories) is fetched dynamically from the backend endpoint `/models`.
   - No underlying provider names or internal model IDs are stored or referenced in the frontend codebase.

