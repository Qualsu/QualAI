# Qual AI - Project Documentation for AI Agents

This file provides a comprehensive overview of the `Qual AI` project for AI agents. Read this to understand the project structure, tech stack, and key rules when working on this codebase.

## 1. Project Overview
Qual AI is a full-stack application featuring a frontend built with Next.js and a backend built with FastAPI, integrating Hugging Face Transformers.

## 2. Tech Stack
**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- UI Components: shadcn/ui, Radix UI, Lucide React
- Authentication: Clerk (`@clerk/nextjs`)
- Styling: `next-themes`, `class-variance-authority`, `clsx`, `tailwind-merge`

**Backend:**
- Python 3
- FastAPI
- Uvicorn (ASGI server)
- Hugging Face Transformers (AI models integration)

**DevOps & Deployment:**
- Docker (Dockerfile and `docker/` folder)
- Jenkins (Jenkinsfile)

## 3. Directory Structure
- `/src`: Frontend codebase.
  - `/src/app`: Next.js App Router pages and layouts.
  - `/src/components`: React components (likely including shadcn/ui).
  - `/src/lib`: Utilities and helpers.
  - `middleware.ts`: Next.js middleware (often used for Clerk auth).
- `/server`: Backend codebase (Python/FastAPI).
  - `app.py`: Main FastAPI application entry point.
  - `config.py`: Configuration settings.
  - `hf_model.py`: Hugging Face model integration.
  - `history.py`: Chat history management logic.
  - `model.py`: Data models / schemas.
  - `requirements.txt`: Python dependencies.
- `/public`: Static assets (e.g., logo).
- `package.json`, `tsconfig.json`, etc.: Node/Next.js configuration.

## 4. Key Agent Guidelines & Constraints
1. **Tooling Rules:** Always use specific tools (`grep_search`, `list_dir`, `view_file`) instead of running standard bash commands (`grep`, `ls`, `cat`) where possible.
2. **Frontend Modifications:**
   - Use Next.js 15 App Router conventions inside `/src/app`.
   - Adhere to React 19 paradigms.
   - Use Tailwind CSS 4 for styling, and reuse shadcn/ui components where applicable.
   - Avoid generic colors; use modern design aesthetics.
3. **Backend Modifications:**
   - Follow FastAPI best practices in `/server`.
   - Keep AI logic encapsulated (e.g., within `hf_model.py`).
4. **Preserve Documentation:** Do not delete existing comments, docstrings, or structure unless explicitly requested by the user.
5. **No Blind Overwrites:** Use `replace_file_content` or `multi_replace_file_content` for editing code. Only use `write_to_file` with Overwrite if replacing the entire contents purposefully.
6. **No `npm run build` during dev testing:** NEVER run `npm run build` or `next build` to verify frontend changes while the user's dev server is active. Running `next build` wipes `.next/` cache and breaks the running `next dev` server and browser Service Worker (`ENOENT _buildManifest.js` error). Use `npx tsc --noEmit` for type checking instead.
7. **Model Conventions:**
   - `qwen3:1.7b` ➔ `QualAI-1.5` (Default model, tagged `Best`)
   - `qwen3:0.6b` ➔ `QualAI-1.5-mini` (Tagged `Best`)
   - `qwen2.5-coder:1.5b` ➔ `QualAI-Code`
   - `qwen2.5-coder:3b` ➔ `QualAI-Code-Max`
   - `qwen2.5:1.5b` ➔ `QualAI-1` (Categorized under `Old`)
   - `qwen2.5:0.5b` ➔ `QualAI-1-mini` (Categorized under `Old`)
