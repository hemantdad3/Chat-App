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
- `ChatWindow`
- `MessageBubble` (own vs. other styling)
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
- No media/file upload UI
- No push notifications
- No dark mode / theming (v1 is single style)
- No animations beyond basic transitions

## Milestones
1. Auth pages (signup/login) + protected route wrapper
2. Sidebar with static/mock conversation list
3. Chat window with message history (REST fetch)
4. Socket connection + real-time send/receive
5. Typing indicator + online status dot
6. Group chat creation UI + member management
7. Unread counts + sort by recent activity
8. Responsive pass (mobile width)
