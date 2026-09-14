## Design System: Warm & Editorial Palette
The application follows a curated Warm & Editorial aesthetic:
- **Cream**: `#FAF6F0` (base background), `#F5EFEB` (secondary/dark cream background)
- **Sand**: `#EFE7DC` (cards, received message bubbles, input fields), `#E5DACB` (hover/dark sand), `#F7F2EB` (card surfaces)
- **Terracotta**: `#C1502E` (primary accents, sent message bubbles, active buttons), `#A63F20` (hover states)
- **Ink**: `#2B2B2B` (primary text), `#6E675F` (muted text/subtitles), `#A8A096` (faint icons/placeholders), `#DDD5C7` (borders)
- **Sage**: `#4A6C4A` (online presence indicators, unread counters, admin badges)
- **Typography**: Editorial serif headings (`font-serif`) for headers, modal titles, and prominent names; clean sans-serif for UI labels, chat messages, and timestamps.

## Pages / Routes
| Route | Page | Access | Notes |
|---|---|---|---|
| `/signup` | Sign Up | Public | Name, required `@username`, email, password, optional JPG avatar |
| `/login` | Log In | Public | Clean card starting at "Welcome Back" |
| `/chat` | Main Chat Screen | Protected | Sidebar + active conversation window |

## Main Chat Screen Layout
- **Sidebar (left)**:
  - Header with app brand, "Start Direct Chat" (`NewChatModal`) and "Create Group" (`NewGroupModal`) buttons.
  - Conversation list: Cards showing avatar with presence badge, contact display name, timestamp, last message snippet, and unread counter badge. Note: `@username` is intentionally omitted from conversation cards for visual clarity.
  - Footer: Current user profile display (avatar, display name, `@username`), Edit Profile button (`ProfileModal`), and Logout button.
- **Chat Window (right)**:
  - Header: Recipient avatar (**without** overlapping status dot), contact display name, `@username`, and a single presence dot next to the "Online/Offline" status text. Clicking the avatar or header opens `UserProfileModal`.
  - Message history list with automatic smooth scroll to bottom.
  - Typing indicator bar above input.
  - Message input form with send action.

## Components
- `AuthForm`: Shared auth card for `/login` and `/signup`. Clean header starting at "Create an Account" / "Welcome Back" with zero stray elements. Sign Up requires Full Name, unique Username (`@username`), Email, Password, and optional avatar upload (JPG only, under 2MB).
- `Sidebar`: Left pane containing conversation list and user profile footer.
- `ConversationListItem`: Card showing avatar with status dot, display name, timestamp, and message preview (no `@username`).
- `NewChatModal`: Direct chat creation. Search contacts by username; contact list shows avatar, display name, `@username`, and "Chat" action button (bio excluded).
- `NewGroupModal`: Multi-user group creation. Input group name and select members with search checklist showing avatar, name, and `@username`.
- `GroupInfoModal`: Group settings, rename group (admin only), member directory with admin badge, add/remove member controls.
- `ProfileModal`: Edit current user avatar, username (`@username`), and bio (live `[len]/150` character counter). Avatar features overlapping eye icon button (to open full-size lightbox) and camera icon button (to upload new JPG). Redundant text buttons removed. Format text displays "JPG only, under 2MB".
- `UserProfileModal`: Read-only popover/modal when inspecting another user. Displays large avatar, eye icon button opening full-size lightbox preview, display name, `@username`, presence indicator/last seen, bio, and "Send Message" action.
- `Avatar`: Reusable avatar component supporting ImageKit CDN URLs, initials fallback (`ui-avatars.com`), sizes (`xs` to `2xl`), and optional online presence dot.
- `ChatWindow`: Active conversation view with header, message stream, and input form.
- `MessageBubble`: Sent (`#C1502E`) vs received (`#EFE7DC`) styling. Group chat messages show sender avatar, name, and `@username`, with click trigger to view profile.
- `TypingIndicator`: Animated indicator showing when others are composing messages.
- `MessageInput`: Text input with auto-debounce typing emission and send button.
- `OnlineStatusDot`: Sage green indicator dot for live presence.

## State Management
- **AuthContext**: User authentication, session restore via httpOnly cookie, profile update, and avatar upload.
- **SocketContext**: Single persistent WebSocket connection, online presence tracking, room joining, and real-time event distribution.
- **ChatContext**: Active conversation, conversation list sorting by recent activity, paginated messages, optimistic message delivery, and unread counters.

## User Profile Customization & Avatar Display

### 1. Profile / Settings Modal (`ProfileModal.jsx`)
- **Trigger**: Click Edit Profile button in sidebar footer.
- **Features**:
  - **Avatar Upload**: Displays current avatar. Camera icon badge triggers native file input strictly restricted to JPG/JPEG images under 2MB (`accept="image/jpeg,image/pjpeg,.jpg,.jpeg"`).
  - **View Avatar Lightbox**: Small eye icon badge opens full-size avatar lightbox modal with backdrop blur and close button.
  - **Clean Format Guidance**: Displays "JPG only, under 2MB" without mentioning internal storage providers.
  - **Username Field**: Input with `@` prefix, validated for 3–30 characters (alphanumeric + underscore). Displays inline error if taken on the server.
  - **Bio Field**: Textarea with live character countdown (`{bio.length}/150`).
  - **Save Button**: Submits changes with loading state and disabled state when inputs are invalid.

### 2. Read-Only User Profile View (`UserProfileModal.jsx`)
- **Trigger**: Clicking on another user's avatar or name in the Chat Window header, group messages, or group member list.
- **Content**:
  - Full-size avatar image with an eye icon button to open full-resolution lightbox preview.
  - Full Name and `@username`.
  - Bio section (displays "No bio provided yet." if empty).
  - Online presence dot and last-seen timestamp.
  - "Send Message" action.

### 3. Ubiquitous Avatar + Profile Integration
- **Sidebar Conversation List**: Shows user's avatar with presence dot alongside display name (no `@username` clutter).
- **Chat Window Header**: Displays recipient avatar, display name, `@username`, and a single online status dot.
- **Group Message Bubbles**: Sender avatar rendered next to incoming group messages with sender username above message bubble.
- **Search & Member Lists**: Both `NewChatModal`, `NewGroupModal`, and `GroupInfoModal` show avatar thumbnails and `@username`.
