# Product Requirements Document: Real-Time Chat Web Application

## 1. Overview
A web-based real-time messaging application built on the MERN stack (MongoDB, Express, React, Node.js) with Socket.io for real-time communication. Users can sign up, log in, message each other one-on-one, participate in group chats, and see live online/typing status.

## 2. Goals
- Deliver a functional, reliable real-time chat experience
- Support both direct (1-on-1) and group conversations
- Provide immediate feedback on user presence (online/offline, typing)
- Keep the architecture simple enough to extend later (media sharing, notifications, etc.)

## 3. Non-Goals (out of scope for v1)
- Media/file sharing (images, videos, documents)
- Voice/video calling
- End-to-end encryption
- Push notifications (browser/mobile)
- Message search

## 4. Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React (with Context API for state) |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose ODM) |
| Real-time | Socket.io |
| Cloud Storage | ImageKit (Node.js SDK) for avatar hosting |
| Uploads | Multer (memoryStorage buffer) |
| Auth | JWT (`Authorization: Bearer` header with `httpOnly` cookie fallback), bcryptjs for password hashing |
| Styling | Tailwind CSS (Warm & Editorial palette) |

## 5. User Roles
- **Guest** — can view landing/login/signup pages only
- **Authenticated User** — can chat, create groups, manage their profile

## 6. Functional Requirements

### 6.1 Authentication & User Registration
- Sign up with full name, required unique username (`@username`, 3–30 alphanumeric/underscore), email, password, and optional avatar image (JPG only, under 2MB).
- Log in with email/password → returns JWT and user profile data (`name`, `username`, `avatarUrl`, `bio`).
- Passwords hashed with bcrypt before storage.
- JWT sent client-side via `Authorization: Bearer <token>` header (with `httpOnly` cookie support) and validated by `authMiddleware` on protected routes and socket handshakes.
- Logout clears session/token (removes localStorage token and clears cookie).

### 6.2 1-on-1 Chat
- Search/select a user to start a direct conversation
- Send/receive text messages in real time via Socket.io
- Message history persisted in MongoDB and loaded on conversation open
- Timestamps shown per message

### 6.3 Group Chat
- Create a group with a name and selected members
- Add/remove members (admin-only action, creator is default admin)
- Send/receive messages in real time to all group members
- Display sender name on each message in group view
- List of groups the user belongs to, shown in a sidebar

### 6.4 Online / Typing Status
- Show online/offline indicator per user (green dot or similar), updated via socket connect/disconnect events
- Show "typing…" indicator in a conversation when the other user (or a group member) is actively typing
- Typing status auto-clears after a short pause (e.g. 2–3 seconds of inactivity)

### 6.5 Conversation List / Navigation
- Sidebar listing all direct conversations and groups, sorted by most recent activity
- Unread message indicator/count per conversation
- Clicking a conversation loads its message history and opens the chat window

## 7. Non-Functional Requirements
- Real-time message delivery latency should feel instant (<300ms typical, same region)
- API and socket events should handle reconnects gracefully (e.g. user's phone/laptop sleeps and wakes)
- Basic input validation and sanitization on all forms and message content (prevent XSS)
- Passwords and JWT secrets never exposed to the client or logged
- Reasonably responsive layout (usable on both desktop and mobile browser widths)

## 8. Data Models (high-level)

**User**
```
{
  _id,
  name: String,
  username: String,      // unique, alphanumeric + underscore, 3-30 chars
  email: String,         // unique, lowercase
  passwordHash: String,
  avatarUrl: String,     // image URL (ImageKit or initials placeholder)
  bio: String,           // max 150 characters
  isOnline: Boolean,
  lastSeen: Date,
  createdAt,
  updatedAt
}
```

**Conversation** (used for both 1-on-1 and group)
```
{
  _id,
  isGroup: Boolean,
  name: String,        // group name, null for 1-on-1
  members: [User._id],
  admins: [User._id],  // relevant for groups
  lastMessage: MessageRef,
  createdAt
}
```

**Message**
```
{
  _id,
  conversationId,
  sender: User._id,
  content: String,
  createdAt
}
```

## 9. Core API Endpoints (REST)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/signup | Register new user (name, required username, email, password, optional JPG avatar) |
| POST | /api/auth/login | Authenticate, return JWT and user profile (username, avatarUrl, bio) |
| POST | /api/auth/logout | Invalidate session |
| GET | /api/auth/me | Retrieve authenticated user profile |
| GET | /api/users | List/search users by name or username (returns `_id, name, username, avatarUrl, bio, isOnline, lastSeen`) |
| GET | /api/users/:id | Fetch specific user public profile (`name, username, avatarUrl, bio, isOnline, lastSeen`) |
| PATCH | /api/users/me | Update username and/or bio (checks uniqueness, bio <= 150) |
| POST | /api/users/avatar | Upload avatar to ImageKit (Multer memory buffer, max 2MB, strictly JPG/JPEG only) |
| GET | /api/conversations | Get all conversations for logged-in user (populates members with username, avatarUrl, bio) |
| POST | /api/conversations | Create new 1-on-1 or group conversation |
| PATCH | /api/conversations/:id | Update group (add/remove members, rename) |
| GET | /api/conversations/:id/messages | Get message history (paginated, populates sender with username, avatarUrl) |

## 10. Core Socket.io Events
| Event | Direction | Purpose |
|---|---|---|
| `connection` / `disconnect` | client↔server | Track online/offline status |
| `join_conversation` | client→server | Join a conversation's socket room |
| `send_message` | client→server | Send a new message |
| `receive_message` | server→client | Broadcast message to room members |
| `typing` / `stop_typing` | client→server→client | Broadcast typing indicator |
| `user_status_change` | server→client | Notify contacts of online/offline change |
| `user_profile_updated` | server→client | Broadcast profile changes (username, avatarUrl, bio) across all active sessions |

## 11. Milestones (suggested build order)
1. Project scaffolding (client + server, folder structure, env config)
2. Auth: signup, login, JWT middleware
3. User model + basic user search/list
4. Conversation + Message models, REST endpoints
5. Socket.io setup: connection handling, online status
6. 1-on-1 messaging (real-time send/receive + history load)
7. Typing indicators
8. Group chat: creation, member management, group messaging
9. Sidebar with unread counts and recent activity sorting
10. Polish: responsive UI, error handling, reconnect logic

## 12. Deployment

**Target:** Backend on Render (web service), Frontend on Vercel, Database on MongoDB Atlas.
### 12.1 Backend Deployment (Render)
- Web Service on Render running persistent Node.js process (`node server.js`).
- Live URL: `https://chat-app-ygvp.onrender.com`
- Environment variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`, `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`.
- Health check route: `GET /api/health` returns `200 OK`.

### 12.2 Frontend Deployment (Vercel)
- Static SPA deployed on Vercel with edge caching.
- Live URL: `https://chat-app-phi-five-zoj1xpxkxv.vercel.app/`
- SPA rewrites configured in `vercel.json` (`/(.*)` -> `/`) to prevent 404s on deep links.
- Environment variables: `VITE_API_URL=https://chat-app-ygvp.onrender.com/api`, `VITE_SOCKET_URL=https://chat-app-ygvp.onrender.com`.

### 12.3 Cross-Origin / Auth Config & Bearer Fallback
- CORS configured on Express server: `origin: process.env.CLIENT_URL` with `credentials: true`.
- Dual-auth strategy:
  - Primary: `httpOnly` cookie with `sameSite: 'none'` and `secure: true` for HTTPS transmissions.
  - Cross-Origin Fallback: Axios request interceptor attaches `Authorization: Bearer <token>` from `localStorage` on all API requests, overcoming third-party cookie restrictions between disparate domains (`.vercel.app` vs `.onrender.com`).
  - Socket.io handshake checks both cookies and `socket.handshake.auth.token`.

### 12.4 Known Trade-offs
- Cold starts on Render free tier mean the first request after 15 minutes of idle time may take ~50 seconds while the container spins up.
- Cloud avatars stored permanently on ImageKit CDN, eliminating disk-persistence concerns on Render's ephemeral containers.

## 13. Open Questions / Future Enhancements
- Media/file sharing (chat attachments)
- Message editing/deletion
- Read receipts
- Push notifications
- Rate limiting on message sends

---

## 14. User Profile Customization & ImageKit Integration

### 14.1 Objective
Allow authenticated users to customize their profile identity with a unique username, profile bio, and custom avatar image stored in cloud CDN storage via ImageKit.

### 14.2 Data Model Enhancements (User Schema)
- `username`: String, unique index, sparse (to smoothly accommodate existing records), lowercase, trimmed, min 3, max 30 characters, alphanumeric and underscore regex (`/^[a-zA-Z0-9_]+$/`).
- `avatarUrl`: String, defaults to initials SVG/PNG placeholder (`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C1502E&color=fff`).
- `bio`: String, max 150 characters, defaults to empty string, trimmed.

### 14.3 ImageKit Cloud Storage Architecture
- **Why ImageKit:** Render free tier uses ephemeral containers where local filesystem changes are wiped across redeploys/restarts. Cloud storage provides permanent image persistence and global CDN delivery.
- **Backend Upload Pattern:**
  - Client uploads avatar via `multipart/form-data` to `POST /api/users/avatar` (or during registration to `POST /api/auth/signup`).
  - Multer middleware with `memoryStorage()` buffers file in memory.
  - Image validation: max file size `2MB`, **strictly JPG/JPEG only** (MIME types `image/jpeg`, `image/pjpeg` and filename extensions `.jpg`/`.jpeg`). Non-JPEG files are rejected with HTTP 400.
  - Backend uses `imagekit` Node.js SDK initialized with environment variables (`IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`).
  - File uploaded to folder `/chat_avatars/` with unique filename `avatar_${userId}_${Date.now()}.${ext}`.
  - On success, `req.user.avatarUrl` is updated in MongoDB and the full updated user object is returned.

### 14.4 Endpoints Specification
- **`PATCH /api/users/me`**:
  - Request body: `{ username?: string, bio?: string }`
  - Validations:
    - If `username` provided: validate format (3–30 chars, alphanumeric + underscore), check uniqueness across all other users in DB (`_id: { $ne: req.user._id }`). Return `400 Bad Request` with `{ message: "Username is already taken" }` if duplicate.
    - If `bio` provided: validate length (`bio.length <= 150`). Return `400 Bad Request` with `{ message: "Bio cannot exceed 150 characters" }`.
  - Response: `200 OK` with updated user object.
- **`POST /api/users/avatar`**:
  - Content-Type: `multipart/form-data` (field: `avatar`)
  - Validations: File size <= 2MB, strictly JPG/JPEG only (`image/jpeg`, `image/pjpeg`).
  - Response: `200 OK` with `{ avatarUrl: string, user: User }`.
- **`GET /api/users`**:
  - Returns `_id, name, username, avatarUrl, bio, isOnline, lastSeen` (excluding the logged-in user).
  - Search parameter queries both `name` and `username` case-insensitively.
- **Data Population**:
  - `GET /api/conversations`: Populates `members` with `name username avatarUrl bio isOnline lastSeen` and `admins` with `name username avatarUrl bio`.
  - `GET /api/conversations/:id/messages`: Populates `sender` with `name username avatarUrl`.
  - Real-time socket events (`receive_message`, `group_updated`, `user_profile_updated`): Emit populated user objects including `username` and `avatarUrl`.
