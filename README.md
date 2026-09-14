# MERN Real-Time Chat Application

> A full-stack real-time messaging application built with Node.js, Express, MongoDB, React, and Socket.io, featuring direct and group messaging, live presence tracking, typing indicators, and cloud avatar storage.

---

## Live Demo

- **Frontend (Vercel)**: (https://chat-app-phi-five-zoj1xpxkxv.vercel.app/)
- **Backend API (Render)**: https://chat-app-ygvp.onrender.com

---

## Features

### Authentication & Account Security
- **User Registration**: Sign up with full name, required unique username (`@username`, 3–30 characters), email, password, and optional JPG avatar.
- **JWT Authentication**: Authenticated via JSON Web Tokens stored in secure `httpOnly` cookies (with Authorization header fallback).
- **Password Security**: Passwords salted and hashed with `bcryptjs` before database persistence.
- **Route Guards & Session Restore**: Client-side route protection (`ProtectedRoute`) and automatic session re-validation on page refresh via `GET /api/auth/me`.

### Real-Time 1-on-1 Messaging
- **Instant Messaging**: Direct bidirectional message delivery powered by Socket.io rooms with sub-second message delivery.
- **History Persistence**: Conversations and messages stored in MongoDB and loaded with pagination upon opening a chat.
- **Optimistic UI Updates**: Outgoing messages appear instantly in the chat window while awaiting server confirmation.

### Multi-User Group Chats
- **Group Creation**: Create named groups and select multiple members via a contact checklist.
- **Admin Management**: Group creators are assigned admin privileges with permissions to rename groups and add or remove members.
- **Attributed Messages**: Group messages display sender avatars, display names, and `@username` identifiers above message bubbles.

### Presence & Typing Indicators
- **Live Online Tracking**: Real-time presence detection powered by socket connection lifecycle, displaying active status dots and last-seen timestamps.
- **Live Typing Feedback**: Debounced typing indicators ("*username is typing...*") that broadcast to active conversation participants and dismiss automatically on inactivity.

### User Profiles & Avatar Hosting
- **Profile Customization**: Users can update their unique `@username` and add a custom bio (enforced 150-character limit).
- **ImageKit Cloud Storage**: Avatars are uploaded via Multer memory buffers directly to ImageKit CDN storage, strictly accepting JPG/JPEG files under 2MB.
- **Full-Size Lightbox Preview**: Interactive modal with dark backdrop blur to view high-resolution avatar photos from profile cards and popovers.
- **Profile Popover**: Read-only profile view allowing users to inspect contact details, presence, and bios from any chat header or message bubble.

### UX & Interface Design
- **Warm & Editorial Theme**: Custom-tailored color palette built on Cream (`#FAF6F0`), Sand (`#EFE7DC`), Terracotta (`#C1502E`), Ink (`#2B2B2B`), and Sage (`#4A6C4A`) with serif typography.
- **Dynamic List Sorting**: Conversations automatically bump to the top upon receiving incoming messages.
- **Unread Counters**: Real-time unread badges that increment per conversation and clear immediately when the conversation is opened.
- **Mobile Responsive Layout**: Adaptive layout featuring a collapsible drawer on mobile devices (<768px) with back-to-list navigation.

---

## Tech Stack

| Layer | Technology | Why It Was Chosen |
|---|---|---|
| **Frontend Framework** | React 19 (Vite) | Fast development server, rapid HMR, and component-driven UI architecture. |
| **Styling** | Tailwind CSS v4 | Flexible utility classes with custom theme tokens; zero runtime CSS overhead. |
| **Real-Time Layer** | Socket.io (Client & Server) | Event-driven WebSocket communication with automatic reconnection and built-in room abstractions. |
| **Backend Framework** | Node.js + Express | Lightweight, asynchronous event loop ideal for I/O-heavy chat and REST endpoints. |
| **Database** | MongoDB + Mongoose | Document-oriented schema flexibility for message trees, conversation memberships, and populated references. |
| **Cloud Storage** | ImageKit (Node.js SDK) | Reliable CDN image hosting that avoids file loss on ephemeral server containers. |
| **File Handling** | Multer (`memoryStorage`) | Buffers uploaded avatar files in memory for validation before streaming to ImageKit. |
| **Authentication** | JWT + `cookie-parser` | Stateless token authorization stored in `httpOnly` cookies to mitigate XSS risks. |
| **Password Hashing** | `bcryptjs` | Industry-standard slow hashing algorithm with automated salting. |
| **Hosting (Target)** | Vercel (Client) + Render (Server) | Edge-cached static delivery for the frontend SPA and persistent Node.js process for WebSockets. |

---

## Architecture Overview

```
+---------------------------------------------------------------------------------+
|                                 CLIENT (React SPA)                              |
|                                                                                 |
|   +-------------------+    +--------------------+    +----------------------+   |
|   |    AuthContext    |    |    ChatContext     |    |    SocketContext     |   |
|   +-------------------+    +--------------------+    +----------------------+   |
+-------------|------------------------|---------------------------^--------------+
              |                        |                           |
     REST API Requests         REST API Requests            WebSocket Events
    (POST /login, signup,     (GET /conversations,         (send_message, typing,
     PATCH /users/me, etc.)    messages, search users)      receive_message, etc.)
              |                        |                           |
              v                        v                           v
+---------------------------------------------------------------------------------+
|                               SERVER (Node.js / Express)                        |
|                                                                                 |
|   +-------------------+    +--------------------+    +----------------------+   |
|   |  authMiddleware   |    | Controllers/Routes |    |    Socket Handler    |   |
|   |  (Verify JWT)     |    | (Business Logic)   |    |   (Room Management)  |   |
|   +-------------------+    +--------------------+    +----------------------+   |
+-------------|------------------------|---------------------------|--------------+
              |                        |                           |
              |                        +-------------+-------------+
              |                                      |
              v                                      v
+-----------------------------+        +------------------------------------------+
|          ImageKit           |        |              MongoDB Atlas               |
|  (Avatar Cloud CDN Storage) |        | (Users, Conversations, Messages Models)  |
+-----------------------------+        +------------------------------------------+
```

### Communication Flow
1. **HTTP / REST API**: Used for standard request-response operations including registration, login, profile editing, contact search, and paginated conversation history retrieval.
2. **WebSockets (Socket.io)**: A persistent TCP connection is established upon authentication. When a user opens a conversation, the client joins a dedicated room (`socket.join(conversationId)`). Messages emitted to the server are saved to MongoDB and immediately broadcast to all sockets in that room.
3. **Authentication Lifecycle**:
   - On signup or login, the server signs a JWT payload containing the user's `_id` and sets it as an `httpOnly` cookie with `SameSite: 'Lax'` (`'None'` in production) and `secure: true`.
   - Subsequent REST requests include this cookie automatically. `authMiddleware` validates the token and attaches the user document to `req.user`.
   - During the Socket.io handshake, the cookie is read and verified so real-time socket events remain strictly authenticated.

---

## Folder Structure

```
MERN-Chat-App/
├── client/                          # React frontend (Vite)
│   ├── public/                      # Static assets and favicons
│   ├── src/
│   │   ├── assets/                  # Local graphics and icons
│   │   ├── components/
│   │   │   ├── auth/                # AuthForm (Login and Signup cards)
│   │   │   ├── chat/                # ChatWindow, MessageBubble, MessageInput, TypingIndicator
│   │   │   ├── common/              # Reusable Avatar and ProtectedRoute wrapper
│   │   │   ├── layout/              # Sidebar with conversation feed and user footer
│   │   │   └── modals/              # ProfileModal, UserProfileModal, NewChatModal, NewGroupModal, GroupInfoModal
│   │   ├── context/                 # AuthContext, ChatContext, SocketContext
│   │   ├── pages/                   # LoginPage, SignupPage, ChatPage
│   │   ├── services/                # Axios instance (api.js), authService, chatService
│   │   ├── App.jsx                  # Route definitions and context provider tree
│   │   ├── index.css                # Tailwind directives and Warm & Editorial theme tokens
│   │   └── main.jsx                 # Application entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Express & Socket.io backend
│   ├── src/
│   │   ├── config/                  # MongoDB connection (db.js) and ImageKit client (imagekit.js)
│   │   ├── controllers/             # authController, userController, conversationController, messageController
│   │   ├── middleware/              # authMiddleware, uploadMiddleware (Multer buffer), errorMiddleware
│   │   ├── models/                  # Mongoose models: User.js, Conversation.js, Message.js
│   │   ├── routes/                  # authRoutes, userRoutes, conversationRoutes
│   │   ├── socket/                  # socketHandler.js (connection tracking, rooms, messaging events)
│   │   └── utils/                   # generateToken.js, sanitize.js (XSS sanitization)
│   ├── package.json
│   └── server.js                    # HTTP server, Socket.io initialization, CORS, and Express app entry
│
├── PRD_MERN_Chat_App.md             # Backend technical specifications and schemas
├── PRD_Frontend_Chat_App.md         # Frontend components, styling tokens, and interaction requirements
├── PHASES.md                        # Master development roadmap and completed milestones
└── README.md                        # Project documentation and interview guide
```

---

## Setup / Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas database URI (or local MongoDB instance)
- ImageKit account (free tier) for cloud avatar storage

### 1. Clone the Repository
```bash
git clone https://github.com/hemantdad3/Chat-App.git
cd Chat-App
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in `/server` based on `.env.example`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/chat_app
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
```

Start the backend server:
```bash
npm run dev   # Runs with nodemon on port 5000
```

### 3. Frontend Setup
Open a second terminal window:
```bash
cd client
npm install
```

Create a `.env` file in `/client` based on `.env.example`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Start the Vite development server:
```bash
npm run dev   # Runs on http://localhost:5173
```

Open your browser at `http://localhost:5173` to test the application.

---

## Key Technical Decisions

### 1. Socket.io over Plain REST Polling
- **Decision**: Used Socket.io WebSockets for real-time messaging, typing events, and presence updates instead of client-side HTTP short or long polling.
- **Why**: Chat messaging is inherently event-driven. Polling requires clients to send continuous HTTP requests every few seconds, generating wasted server CPU cycles and network overhead when no new messages exist, while still introducing an artificial latency gap equal to the polling interval. WebSockets maintain a single persistent full-duplex TCP connection, allowing the server to push messages instantly.
- **Trade-off**: WebSockets are stateful. While stateless REST APIs scale trivially across serverless functions, WebSocket servers must maintain open socket connections in memory. Scaling WebSockets horizontally requires persistent backend instances and an adapter (such as Redis Pub/Sub) to broadcast events between server nodes.

### 2. JWT in `httpOnly` Cookies vs. `localStorage`
- **Decision**: Stored JSON Web Tokens inside `httpOnly`, `SameSite` cookies with an Authorization header fallback, rather than storing them in browser `localStorage`.
- **Why**: Tokens stored in `localStorage` are fully accessible to any JavaScript executing in the browser window. If an application suffers from a Cross-Site Scripting (XSS) vulnerability, an injected script can immediately exfiltrate the token. Setting the `httpOnly` flag instructs the browser that JavaScript cannot read the cookie, mitigating token theft via XSS.
- **Trade-off**: Cookies require careful cross-origin resource sharing (CORS) configuration (`credentials: true`), exact origin specification (wildcards `*` are disallowed when credentials are true), and protection considerations against Cross-Site Request Forgery (CSRF).

### 3. ImageKit Cloud Storage vs. Local Filesystem
- **Decision**: Used ImageKit with Multer memory buffers (`memoryStorage`) to handle avatar uploads rather than saving images directly to the server's local disk.
- **Why**: Modern cloud deployment platforms (such as Render) run containers on ephemeral filesystems. Any files written to the local disk are completely destroyed whenever the container restarts, redeploys, or spins down. Using ImageKit ensures avatars are persisted permanently on object storage and distributed via a global CDN.
- **Trade-off**: Introduces an external third-party API dependency and network hop during avatar uploads. We mitigated memory bloat by strictly limiting file sizes to 2MB and restricting formats strictly to JPG/JPEG images before uploading.

### 4. Split Deployment: Render (Backend) + Vercel (Frontend)
- **Decision**: Deployed the React frontend SPA to Vercel and the Node.js/Express/Socket.io backend to Render as a continuous Web Service.
- **Why**: Vercel provides world-class static edge hosting, fast CI/CD builds, and instant previews, making it optimal for modern Single Page Applications. However, Vercel's serverless environment does not support long-lived persistent WebSocket connections. Render's Web Service provides an always-on Node.js runtime capable of holding open WebSocket connections.
- **Trade-off**: Render's free tier spins down after 15 minutes of inactivity. When a user first accesses the app after a quiet period, they will experience a cold-start delay (roughly 50 seconds) while the container spins up before API and WebSocket requests can connect.

### 5. Challenge Encountered: UI Redundancy & Presence Indicator De-duplication
- **Challenge**: As features were developed iteratively across phases, several UI elements accumulated redundant controls and duplicated visual feedback. Specifically, the chat header was displaying two green online indicators for the same user (one badge dot overlapping the avatar and a second dot adjacent to the "Online" text), the Messages sidebar list was rendering redundant `@username` text below display names that crowded small screens, and the profile editor had four separate avatar actions (two overlapping icon badges plus two duplicate text buttons below).
- **Solution**: We audited each component's visual hierarchy. In `ChatWindow`, we removed the avatar badge dot in the header, keeping only the status text indicator dot. In `ConversationListItem`, we removed the `@username` line to prioritize clean last-message previews. In `ProfileModal`, we eliminated the redundant text buttons, leaving two clean, high-contrast icon badges overlapping the avatar (an eye icon to trigger full-size lightbox preview and a camera icon to trigger native JPG file selection).

---

## Possible Future Improvements

These features were intentionally excluded from the initial v1 scope to focus on rock-solid real-time messaging fundamentals:
- **In-Chat Media & File Attachments**: Support sending photos, audio voice notes, and PDF attachments directly inside conversation threads via ImageKit/S3.
- **Message Read Receipts**: Add visual double-check indicators distinguishing between message *sent*, *delivered*, and *seen* states.
- **Web Push Notifications**: Integrate browser Push API and service workers to notify users of incoming direct messages when the application tab is closed.
- **Full-Text Message Search**: Implement text indexing in MongoDB to allow users to search historical messages across all conversations.
- **Horizontal Socket Scaling**: Integrate the `@socket.io/redis-adapter` to synchronize socket rooms across multiple backend cluster instances.

---

## My Interview Notes

*(Personal prep sheet: quick spoken summaries to explain this project confidently in an interview setting)*

### 30-Second Elevator Pitch
> *"I built a full-stack real-time chat application using the MERN stack and Socket.io. It supports instant 1-on-1 and group conversations, live typing indicators, and online presence tracking. I implemented secure JWT authentication using httpOnly cookies to guard against XSS token theft, and integrated ImageKit with Multer memory buffers so user avatars are hosted permanently on a CDN rather than being wiped by ephemeral server restarts. The frontend is built in React and styled with a custom warm editorial Tailwind design that is fully responsive."*

### 2-Minute Architectural Deep-Dive
> *"When designing this chat app, my main priority was keeping a clean separation between request-response operations and real-time event streaming.*
>
> *For bootstrapping and persistence, the React frontend talks to an Express REST API. That handles registration, login, profile editing, and fetching paginated conversation history from MongoDB. But for the messaging itself, I used Socket.io to establish a persistent full-duplex WebSocket connection. Whenever a user opens a conversation, the client joins a socket room identified by the conversation ID. When someone sends a message, the server validates it, saves it to MongoDB, and immediately broadcasts it to everyone in that room in milliseconds.*
>
> *One technical decision I focused on was storage and security. For authentication, instead of storing the JWT in localStorage where it's vulnerable to XSS attacks, I configured httpOnly cookies with strict CORS credentials, which keeps tokens inaccessible to client JavaScript. For avatar images, because platforms like Render use ephemeral containers that wipe files on restart, I used Multer with memoryStorage to buffer incoming files in RAM, validate that they're strictly JPGs under 2MB, and stream them directly to ImageKit's CDN.*
>
> *If I were taking this further, my next step would be adding a Redis adapter to Socket.io so multiple backend instances can broadcast events across each other, and adding Web Push notifications for background alerts."*
