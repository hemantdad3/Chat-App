# Frontend PRD: Chat App (React)

## Stack
React, Tailwind CSS, Socket.io-client, Axios (or fetch), Context API for global state (auth + socket).

## Pages / Routes
| Route | Page | Access |
|---|---|---|
| /signup | Sign Up | Public |
| /login | Log In | Public |
| /chat | Main Chat Screen | Protected |

## Main Chat Screen Layout
- **Sidebar (left)**: list of conversations (direct + group), each showing name, last message preview, unread count, online dot. "New Chat" and "New Group" buttons at top.
- **Chat Window (right)**: message list (scrollable, auto-scroll to bottom on new message), typing indicator above input, message input box with send button.
- **Header (top of chat window)**: conversation name/participant, online/last-seen status.

## Components
- `AuthForm` (shared by Login/Signup)
- `Sidebar`
- `ConversationListItem`
- `NewChatModal` (search/select user)
- `NewGroupModal` (name + select members)
- `GroupInfoModal` (group details & member management)
- `ProfileModal` (edit current user avatar, username, and bio)
- `UserProfileModal` (read-only popover/modal to view another user's profile)
- `Avatar` (reusable avatar displaying image or initials fallback + presence indicator)
- `ChatWindow`
- `MessageBubble` (own vs. other styling with avatar + username in groups)
- `TypingIndicator`
- `MessageInput`
- `OnlineStatusDot`

## State Management
- **AuthContext**: current user, JWT, login/logout functions
- **SocketContext**: single socket connection, exposes emit/listen helpers
- **Chat state** (local to ChatWindow or a ChatContext): active conversation, messages, typing status

## Core Frontend Behaviors
- On login, connect socket and join rooms for all existing conversations
- Sending a message: optimistic UI update, then confirm/reconcile on server ack
- Typing indicator: emit `typing` on keypress (debounced), `stop_typing` after pause
- Online status: update dot in real time via `user_status_change` socket event
- Protected routes redirect to /login if no valid JWT
- Persist JWT in httpOnly cookie (preferred) or memory; re-check auth on app load

## Non-Goals
- No media/file attachments inside messages (v1 scope boundary)
- No push notifications
- No multi-theme switching beyond established Warm & Editorial palette
- No heavy animations beyond subtle micro-interactions

## Milestones
1. Auth pages (signup/login) + protected route wrapper
2. Sidebar with static/mock conversation list
3. Chat window with message history (REST fetch)
4. Socket connection + real-time send/receive
5. Typing indicator + online status dot
6. Group chat creation UI + member management
7. Unread counts + sort by recent activity
8. Responsive pass (mobile width)
9. UI Polish & Warm Editorial design system
10. User Profile Customization (Username, ImageKit Avatar, Bio)

---

## User Profile Customization & Avatar Display

### 1. Profile / Settings Modal (`ProfileModal.jsx`)
- **Trigger**: Accessed from the sidebar footer by clicking user's profile card or settings/edit icon.
- **Features**:
  - **Avatar Upload**: Displays current avatar. Clicking avatar opens native file picker (`image/jpeg`, `image/png`, `image/webp`, max 2MB).
  - **Loading & Error Feedback**: Shows a progress spinner during upload to ImageKit; if upload fails, displays an inline error alert while preserving previous avatar.
  - **Username Field**: Input with `@` prefix, validated for 3-30 characters (alphanumeric + underscore). Displays inline error if taken on the server.
  - **Bio Field**: Textarea with live character countdown (`{bio.length}/150`).
  - **Save Button**: Submits changes to `PATCH /api/users/me` with loading state and disabled state when inputs are invalid.

### 2. Read-Only User Profile View (`UserProfileModal.jsx`)
- **Trigger**: Clicking on another user's avatar or name in:
  - The Chat Window header (1-on-1 chats).
  - Group chat message bubbles (sender avatar/name).
  - Group details member directory.
- **Content**:
  - Full-size avatar image.
  - Full Name and `@username`.
  - Bio section (shows "No bio yet" if empty).
  - Online presence dot and last-seen timestamp.
  - Quick "Send Message" action if opened from a group or directory.

### 3. Ubiquitous Avatar + Username Display
- **Sidebar Conversation List**: Shows user's custom `avatarUrl` (or initials placeholder) alongside display name.
- **Chat Window Header**: Displays recipient's avatar image and `@username`.
- **Group Message Bubbles**: Sender avatar rendered next to incoming group messages with sender username above message bubble.
- **Search & Member Lists**: Both `NewChatModal`, `NewGroupModal`, and `GroupInfoModal` show avatar thumbnails and `@username`.
