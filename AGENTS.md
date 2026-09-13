# AGENTS.md — AI Agent Operating Guidelines & Rules

## 1. Project Overview & Sources of Truth
- **Project**: Real-Time Chat Web Application (MERN + Socket.io).
- **Core PRDs**:
  - `PRD_MERN_Chat_App.md` (Backend models, endpoints, socket events, deployment)
  - `PRD_Frontend_Chat_App.md` (Frontend pages, components, state management, UI behaviors)
  - `PHASES.md` (Master 7-phase step-by-step roadmap)
- **Strict Scope Boundaries**: Treat the PRDs as the absolute source of truth. Do NOT implement features beyond what is listed (e.g., NO file/media upload, NO push notifications, NO read receipts, NO voice/video call) unless explicitly instructed by the user.

---

## 2. Tech Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT (stored in httpOnly cookie with header fallback), bcryptjs.
- **Frontend**: React (Vite), Tailwind CSS, Socket.io-client, Axios, React Router, Context API.
- **Deployment**:
  - Backend: Render Web Service (persistent Node.js process for WebSockets).
  - Frontend: Vercel.
  - Database: MongoDB Atlas.

---

## 3. Remote Repository & Version Control Rules
- **GitHub Repository**: `https://github.com/hemantdad3/Chat-App.git`
- **Mandatory Git Workflow**:
  1. After every completed phase or verified major update, stage the changes.
  2. Create a clean, conventional commit message reflecting the delivered phase/feature:
     - Example: `feat: phase 2 - user authentication, jwt cookies, and route guards`
  3. Propose and ask the user for confirmation before pushing to the remote repository. Only push after explicit user approval:
     ```bash
     git push origin main
     ```
  4. Ensure `.gitignore` strictly prevents committing secrets (`.env`, `.env.local`), `node_modules/`, build artifacts (`dist/`), and OS temporary files.

---

## 4. 7-Phase Execution Workflow
Development MUST progress through the 7 phases sequentially. Complete both backend and frontend parts of a phase before moving to the next.

1. **Phase 1: Setup & Scaffolding** — Directory structure, dependencies, `.env` config, MongoDB connection, Vite + Tailwind frontend.
2. **Phase 2: Authentication** — Signup, login, logout, JWT middleware, httpOnly cookies, protected routes.
3. **Phase 3: Core 1-on-1 Messaging** — User search, Conversation/Message models, REST endpoints, Socket send/receive, chat UI.
4. **Phase 4: Presence & Typing** — Online/offline socket tracking, typing indicators with debounce.
5. **Phase 5: Group Chat** — Group creation, admin member management, group socket broadcasts.
6. **Phase 6: Polish & UX** — Unread badges, dynamic sorting by recent message, input validation/sanitization, responsive mobile layout.
7. **Phase 7: Deployment** — Render backend configuration, Vercel frontend configuration, CORS/cookie adjustments, live end-to-end verification.

---

## 5. Strict Operational Rules for the Agent
1. **One Phase at a Time**: Never jump ahead or start generating code for upcoming phases early.
2. **Verification First**: After completing a phase, run the code, start the servers, hit the endpoints or use the browser tool to verify functionality.
3. **Plain-English Explanations**: Report back with a concise 2–3 sentence plain-English summary explaining what was built and why, suitable for tech interviews.
4. **Code Comments**: Comment all non-obvious logic, especially authentication flow, socket rooms, and state sync logic.
5. **Secrets & Security**:
   - Keep all secrets (`JWT_SECRET`, `MONGO_URI`, credentials) in `.env` files.
   - NEVER print secrets in the chat or commit them to Git.
   - Provide clean `.env.example` templates for both `/server` and `/client`.
6. **Code Quality**:
   - Use `async/await` exclusively (no raw callback chains or unhandled promises).
   - Write clean, human-readable code.
7. **Ask Before Expanding**: If anything is ambiguous or seems missing from the PRD, ASK the user first instead of assuming.
8. **Ask Before Push**: Always ask the user for explicit confirmation before pushing any commits to GitHub (`origin main`). Do not push code changes automatically without asking first.
