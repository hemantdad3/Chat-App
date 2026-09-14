# Project Roadmap: 7-Phase Build Plan

This document outlines the step-by-step implementation plan for the **MERN Real-Time Chat Application** based on `PRD_MERN_Chat_App.md` and `PRD_Frontend_Chat_App.md`. Each phase encompasses both backend and frontend deliverables, explicit verification steps, and commit guidelines.

---

## Progress Overview

| Phase | Description | Backend Scope | Frontend Scope | Status |
|---|---|---|---|---|
| **Phase 1** | Setup & Scaffolding | Express, Mongoose, Socket.io, .env config, MongoDB test | Vite + React + Tailwind CSS scaffold, folder structure, Axios instance | ✅ Completed |
| **Phase 2** | Authentication | Signup, Login, Logout, JWT (httpOnly cookie), Auth middleware | Auth pages (/signup, /login), AuthForm, AuthContext, ProtectedRoute | ✅ Completed |
| **Phase 3** | Core 1-on-1 Messaging | User search, Conversation & Message models, REST endpoints, Socket send/receive | Sidebar conversations, ChatWindow, MessageBubble, MessageInput, NewChatModal | ✅ Completed |
| **Phase 4** | Presence & Typing | Socket connection/disconnect tracking, online status broadcast, typing events | OnlineStatusDot, TypingIndicator with debounce, real-time presence indicators | ✅ Completed |
| **Phase 5** | Group Chat | Group creation, member add/remove, admin checks, group message broadcast | NewGroupModal, Group member list management UI, sender names on messages | ✅ Completed |
| **Phase 6** | Polish & UX | Input sanitization, validation, recent conversation sorting, unread counters | Unread badge/counter, auto-scroll chat window, responsive layout (mobile) | ✅ Completed |
| **Phase 6.5** | User Profiles & Editorial UI | Username/bio models, ImageKit cloud avatars (JPG only <2MB), PATCH /api/users/me | ProfileModal, UserProfileModal popover, Lightbox preview, editorial UI refinements | ✅ Completed |
| **Phase 7** | Deployment | Render Web Service config, CORS credentials, production env configuration | Vercel frontend config, environment variables, end-to-end live testing | ✅ Completed |

---

## Phase 1: Setup & Scaffolding

### Goal
Initialize the repository architecture, install core dependencies, configure environment settings, connect to MongoDB, and prepare the development environment.

### Backend Scope (`/server`)
- Initialize `package.json` with scripts (`dev`, `start`).
- Install dependencies: `express`, `mongoose`, `socket.io`, `dotenv`, `cors`, `cookie-parser`, `bcryptjs`, `jsonwebtoken`.
- Create `/server/src` directory structure: `config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `socket/`, `utils/`.
- Setup `src/config/db.js` using Mongoose to connect to MongoDB.
- Setup `server.js` with basic Express server, CORS with credentials, cookie parsing, and HTTP server for Socket.io.
- Setup `.env.example` and `.env` (`PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`).

### Frontend Scope (`/client`)
- Initialize Vite + React project.
- Install dependencies: `socket.io-client`, `axios`, `react-router-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `lucide-react` (icons).
- Configure Tailwind CSS (`tailwind.config.js`, `postcss.config.js`, `src/index.css`).
- Create `/client/src` directory structure: `components/`, `context/`, `hooks/`, `pages/`, `services/`.
- Setup `src/services/api.js` with configured Axios base URL (`VITE_API_URL`) and `withCredentials: true`.
- Setup `.env.example` and `.env` (`VITE_API_URL`, `VITE_SOCKET_URL`).

### Verification & Testing
1. Run `npm run dev` in `/server` — verify server starts on designated port and logs successful MongoDB connection.
2. Run `npm run dev` in `/client` — verify React + Tailwind CSS development server boots up and loads welcome screen cleanly.
3. Test a ping/healthcheck route (e.g. `GET /api/health`).

### Suggested Git Commit
`chore: phase 1 - project scaffolding, environment setup, and db connection`

---

## Phase 2: Authentication

### Goal
Implement full end-to-end user authentication with password hashing, secure JWT transmission via httpOnly cookies, protected routes, and session persistence.

### Backend Scope (`/server`)
- **Model**: `User.js` (`name`, `email`, `passwordHash`, `isOnline`, `lastSeen`, `createdAt`).
- **Endpoints**:
  - `POST /api/auth/signup` — validate fields, hash password with bcrypt, save user, issue JWT cookie, return user info.
  - `POST /api/auth/login` — verify credentials, issue JWT cookie, return user info.
  - `POST /api/auth/logout` — clear auth cookie.
  - `GET /api/auth/me` (or check-session endpoint) — return authenticated user from JWT.
- **Middleware**: `authMiddleware.js` — extracts and verifies JWT from httpOnly cookies (or Authorization header), attaches user to `req.user`.

### Frontend Scope (`/client`)
- **Pages**: `LoginPage.jsx` (`/login`), `SignupPage.jsx` (`/signup`).
- **Component**: `AuthForm.jsx` — reusable component handling validation, submission, and error display.
- **Context**: `AuthContext.jsx` — provides `user`, `login()`, `signup()`, `logout()`, and session check on initial mount.
- **Route Guard**: `ProtectedRoute.jsx` — redirects unauthenticated users to `/login` and authenticated users away from auth pages to `/chat`.

### Verification & Testing
1. Test signup with new user via Postman/browser — verify password hashed in MongoDB and JWT cookie received.
2. Test login with correct & incorrect credentials.
3. Test session persistence on browser reload via `GET /api/auth/me`.
4. Test logout and ensure cookie is cleared and protected routes redirect.

### Suggested Git Commit
`feat: phase 2 - user authentication, jwt cookies, and route guards`

---

## Phase 3: Core 1-on-1 Messaging

### Goal
Enable users to discover other users, initiate direct conversations, exchange messages in real time over Socket.io, and view persisted conversation histories.

### Backend Scope (`/server`)
- **Models**:
  - `Conversation.js` (`isGroup: false`, `members: [User._id]`, `lastMessage: MessageRef`, `createdAt`).
  - `Message.js` (`conversationId`, `sender: User._id`, `content: String`, `createdAt`).
- **Endpoints**:
  - `GET /api/users` — search and list registered users (excluding requesting user).
  - `GET /api/conversations` — fetch all direct conversations for logged-in user with populated participant & lastMessage data.
  - `POST /api/conversations` — find existing or create new 1-on-1 conversation.
  - `GET /api/conversations/:id/messages` — retrieve paginated message history.
- **Socket.io**:
  - Connection handling with authenticated socket handshake.
  - `join_conversation` event — join conversation room.
  - `send_message` event — persist message to MongoDB, update conversation `lastMessage`, and emit `receive_message` to room members.

### Frontend Scope (`/client`)
- **Context**: `SocketContext.jsx` — manages Socket.io lifecycle, connection state, and event emitting.
- **Context/State**: `ChatContext.jsx` — manages conversations list, active conversation, and message history.
- **Components**:
  - `Sidebar.jsx` with `ConversationListItem.jsx` displaying participant name and last message snippet.
  - `NewChatModal.jsx` — search users and start a 1-on-1 chat.
  - `ChatWindow.jsx` — active conversation view, message history, auto-scroll.
  - `MessageBubble.jsx` — distinct styling for sent vs received messages with timestamps.
  - `MessageInput.jsx` — text input with send button emitting message.

### Verification & Testing
1. Open two different browsers/incognito windows logged in as User A and User B.
2. Search and initiate a chat between User A and User B.
3. Send messages from User A to User B — verify instant delivery on User B's screen and persistence on page refresh.

### Suggested Git Commit
`feat: phase 3 - core 1-on-1 messaging and real-time socket events`

---

## Phase 4: Presence & Typing Indicators

### Goal
Provide real-time awareness of user online status and live typing indicators when composing messages.

### Backend Scope (`/server`)
- **Socket Events & State**:
  - Track online user sockets in memory / database.
  - On socket `connection`: set `isOnline: true`, update `lastSeen`, broadcast `user_status_change` to clients.
  - On socket `disconnect`: set `isOnline: false`, record `lastSeen`, broadcast `user_status_change`.
  - Relay `typing` and `stop_typing` events to conversation rooms (excluding the sender).

### Frontend Scope (`/client`)
- **Components**:
  - `OnlineStatusDot.jsx` — visual green dot or last seen time in sidebar items and conversation header.
  - `TypingIndicator.jsx` — animated "typing..." bubble in `ChatWindow`.
- **Input Logic**:
  - Emit `typing` on keypress with debounce logic via `useDebounce`.
  - Emit `stop_typing` after 2–3 seconds of inactivity or upon sending the message.
- Update presence state across all conversations when `user_status_change` is received.

### Verification & Testing
1. With User A and User B open side-by-side, verify User B shows as online (green dot) for User A.
2. Close User B's tab — verify User A sees User B transition to offline with last seen timestamp.
3. Type in User A's input box — verify User B sees "User A is typing..." indicator and that it disappears after stopping.

### Suggested Git Commit
`feat: phase 4 - real-time online presence and typing indicators`

---

## Phase 5: Group Chat

### Goal
Allow users to create multi-user group chats, manage members (add/remove) with admin authorization, and communicate collectively in real time.

### Backend Scope (`/server`)
- **Model Extensions**:
  - `Conversation.js`: support `isGroup: true`, `name: String`, `admins: [User._id]`, `members: [User._id]`.
- **Endpoints**:
  - `POST /api/conversations` (group): create group with name, creator as default admin, and selected member IDs.
  - `PATCH /api/conversations/:id`: update group name, add members, or remove members (restricted to group admins).
- **Socket.io**:
  - Broadcast group messages to all connected group room members.
  - Handle room joining for all group members upon connection.

### Frontend Scope (`/client`)
- **Components**:
  - `NewGroupModal.jsx`: modal to input group name and select multiple users with search/checkboxes.
  - Group details header in `ChatWindow`: view members, admin badge.
  - Manage members modal/dropdown (add user, remove user for admins).
  - Update `MessageBubble.jsx` to display sender name in group conversations.
  - Update `ConversationListItem.jsx` to show group icon/name.

### Verification & Testing
1. Create a group with User A, User B, and User C.
2. Verify all three users receive the group in their sidebar.
3. Send a message from User A — verify both User B and User C receive it with User A's name displayed.
4. Verify non-admins cannot remove members, while the admin can.

### Suggested Git Commit
`feat: phase 5 - multi-user group chat and member management`

---

## Phase 6: Polish & UX

### Goal
Refine user experience, add unread message tracking, sort conversations by recent activity, implement input validation/sanitization, and ensure mobile responsiveness.

### Backend Scope (`/server`)
- Input validation on all endpoints (email format, password length, message content non-empty).
- XSS sanitization for message content before storage.
- Conversation sorting: return conversations ordered by `updatedAt` / `lastMessage.createdAt` descending.
- Unread message tracking support.

### Frontend Scope (`/client`)
- **Unread counts**: badge display on `ConversationListItem`, cleared when conversation is clicked/opened.
- **Dynamic sorting**: automatically bump conversation to top of list upon receiving a new message.
- **Auto-scroll**: smooth scroll to latest message when in active conversation, with unread hint if scrolled up.
- **Mobile responsiveness**: collapsible sidebar / drawer layout for small screens (<768px), allowing seamless back-to-list navigation.
- Accessible error alerts and clean loading skeletons.

### Verification & Testing
1. Send message to an unselected conversation — verify unread counter badge appears and conversation moves to the top.
2. Open the conversation — verify badge clears.
3. Test on mobile screen width (375px) — verify toggling between sidebar and chat window works smoothly.
4. Verify long messages wrap correctly and empty messages cannot be sent.

### Suggested Git Commit
`feat: phase 6 - unread badges, conversation sorting, and responsive layout`

---

## Phase 6.5: User Profiles, ImageKit Cloud Avatars & Editorial UI Polish

### Goal
Empower users to customize their personal identity with a unique username (`@username`), bio description, and persistent cloud avatar upload via ImageKit, while polishing UI elements to adhere strictly to the Warm & Editorial design language and eliminating visual duplication.

### Backend Scope (`/server`)
- **User Model Extensions**:
  - `username`: String, unique, required, lowercase, trimmed, validated (3–30 chars, alphanumeric + underscores).
  - `avatarUrl`: String, default empty / placeholder fallback.
  - `bio`: String, default empty, max 150 characters.
- **ImageKit Cloud Integration**:
  - Multer memory storage middleware buffering files in RAM.
  - ImageKit Node.js SDK initialized with environment variables (`IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`).
  - Strict JPG/JPEG validation: files must be `image/jpeg` or `image/pjpeg` and have `.jpg` or `.jpeg` extension under 2MB. Non-JPEG files (PNG, WebP, etc.) return HTTP 400.
  - Avatars stored in `/chat_avatars/` folder with unique name `avatar_${userId}_${Date.now()}.${ext}`.
- **Endpoints**:
  - `POST /api/auth/signup`: Accepts registration with required `username` and optional avatar file upload via Multer buffer or JSON fallback.
  - `PATCH /api/users/me`: Updates `username` (with duplicate check excluding current user) and `bio` (<= 150 chars).
  - `POST /api/users/avatar`: Dedicated endpoint to upload and replace authenticated user avatar in ImageKit.
  - `GET /api/users`: Search and list users, now projecting `_id, name, username, avatarUrl, bio, isOnline, lastSeen`.
  - Populated user data (`username`, `avatarUrl`, `bio`) across `GET /api/conversations` and `GET /api/conversations/:id/messages`.
- **Socket.io**:
  - `user_profile_updated` event: Broadcasts live username, avatar, and bio updates across all connected sessions and active conversations.

### Frontend Scope (`/client`)
- **Design System**:
  - Warm & Editorial palette: Cream (`#FAF6F0`), Sand (`#EFE7DC`), Terracotta (`#C1502E`), Ink (`#2B2B2B`), and Sage (`#4A6C4A`).
  - Elegant serif headings (`font-serif`) paired with clean sans-serif UI typography.
- **Components & Modals**:
  - `ProfileModal.jsx`: Edit Profile dialog allowing live edit of username (`@username`), bio with character counter (`0/150`), and avatar upload. Avatar displays overlapping eye icon button (lightbox view) and camera icon button (file picker); redundant text buttons removed. Format hint clearly indicates "JPG only, under 2MB".
  - **Avatar Lightbox Modal**: Reusable high-resolution preview modal with dark backdrop blur and close button, accessible from both `ProfileModal` and `UserProfileModal`.
  - `UserProfileModal.jsx`: Read-only profile popover displayed when clicking user avatars/names in the chat header, group messages, or group directory. Displays large avatar with view button, name, `@username`, live presence indicator, bio, and a "Send Message" action.
  - `NewChatModal.jsx`: Direct chat initiation modal with contact search showing avatar, name, and `@username` (bio text removed for clean list alignment).
  - `NewGroupModal.jsx`: Group creation modal with contact selection list (showing avatar, name, and `@username`).
- **UI Bug Fixes & Refinements**:
  - Chat header online indicator: Removed duplicate green dot overlapping the avatar image; retained the clean single dot next to the "Online" status text.
  - Messages sidebar list: Removed `@username` line from conversation items, displaying only display name, timestamp, and last message snippet for visual clarity.
  - Auth page header: Removed stray dropdown/pill element from `AuthForm` card header so it starts cleanly with "Create an Account" / "Welcome Back".

### Verification & Testing
1. Test signup with unique username and optional JPG avatar. Verify non-JPG uploads are blocked with 400 Bad Request.
2. Edit username and bio in `ProfileModal` — verify character counter at 150 limit and uniqueness validation.
3. Test avatar view lightbox in both `ProfileModal` and `UserProfileModal`.
4. Verify chat header shows only ONE online indicator dot next to status text.
5. Verify Messages sidebar displays name only without `@username` clutter.
6. Verify Start New Chat modal shows name and `@username` only without bio text.

### Suggested Git Commit
`feat: phase 6.5 - user profiles, imagekit cloud avatars, and editorial UI polish`

---

## Phase 7: Deployment

### Goal
Deploy backend web service to Render, frontend application to Vercel, connect production MongoDB Atlas database, and verify cross-origin cookies and live sockets.

### Backend Scope (Render)
- Root directory `/server`.
- Build command: `npm install`, Start command: `node server.js` (or `npm start`).
- Environment variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (pointing to Vercel domain).
- Configure CORS with `origin: process.env.CLIENT_URL`, `credentials: true`.
- Cookie options: `sameSite: 'none'`, `secure: true` for production cross-domain cookies.

### Frontend Scope (Vercel)
- Root directory `/client`.
- Build command: `npm run build`, Output directory: `dist`.
- Environment variables: `VITE_API_URL`, `VITE_SOCKET_URL` (pointing to Render service URL).

### Verification & Testing
1. Verify live backend health check endpoint on Render.
2. Sign up and log in on live Vercel URL.
3. Test cross-domain httpOnly cookie storage.
4. Test real-time messaging and socket connection across two live devices/browsers.

### Suggested Git Commit
`chore: phase 7 - production deployment configuration and live verification`
