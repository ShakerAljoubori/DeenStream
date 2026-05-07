# DeenStream

A full-stack Islamic content streaming platform — think Netflix meets Spotify, built for Islamic education. Watch lecture series, listen to audiobooks, track your progress, and engage with content through comments and reactions.

---

## Tech Stack

**Frontend**
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion — shared-element morphs, stagger entrances, tab slides
- GSAP — page-level transitions (fade/Y-shift, horizontal slide, scale bloom)

**Backend**
- Node.js + Express.js v5
- MongoDB + Mongoose
- JWT authentication (bcryptjs, 7-day expiry)

---

## Features

### Video Streaming
- Custom HTML5 video player with full keyboard controls (`Space`/`K` play/pause, `←`/`→` seek ±5s, `↑`/`↓` volume, `M` mute, `F` fullscreen)
- Buffering spinner with automatic controls visibility management
- Episode switching with smooth Framer Motion transitions
- Two-column layout: player + episode list with sticky scroll

### Audio Streaming
- Persistent sticky audio player (sits above mobile nav bar)
- Spotify-style Continue Listening rows with real-time progress bar and "X min left" countdown
- In-place play/pause without navigating away

### Progress Tracking
- **Continue Watching** — saves episode + timestamp every 10s and on pause; green progress bar on cards; resumes from exact position
- **Continue Listening** — same system for audiobooks
- **Server sync** — progress synced to MongoDB for logged-in users; localStorage used as offline cache and for guests
- **Per-account isolation** — each user's progress stored under their own key; switching accounts loads the correct data

### Authentication & Accounts
- Register / Login with JWT; session persists across refreshes via `/api/users/me`
- Settings page: edit display name, change email, change password, upload/crop profile photo
- Avatar upload — drag-to-reposition + scroll-to-zoom crop modal, exported as 200×200 JPEG to MongoDB
- Account deletion with cascading cleanup (progress, comments, reactions)

### Favorites & Playlists
- Heart button (series-level) + bookmark button (episode-level), both server-backed
- Favorites page with three tabs: Saved Series, Saved Lectures, Liked Videos
- Tapping a saved episode jumps directly to that episode

### Comments
- Threaded replies (one level deep) with `@mention` pre-fill
- Edit own comments, like/dislike (mutually exclusive, server-enforced)
- Animated entrance (GSAP spring), animated delete (slide + height collapse)
- 1000-character limit with live counter

### Video Reactions
- Per-episode like/dislike, fully server-backed
- Live like/dislike ratio bar with "X% liked" label

### Search
- Debounced (150ms) dropdown in the navbar
- Searches across series, audiobooks, and individual episodes
- Results grouped by type; clicking navigates directly and clears the input

### Browse & Discovery
- Category filter tabs (derived dynamically from data) on both the home page and audiobooks page
- Series cards with thumbnail, category badge, and heart button

### UI & Animations
- Shared-element morphs: card thumbnail expands into the detail page header (`layoutId`)
- GSAP page transitions: subtle fade + Y-shift for normal navigation, horizontal slide for settings, scale bloom for login success
- Mobile-responsive: bottom nav bar on small screens, responsive layout adjustments
- Confirmation modal before removing Continue Watching entries
- Sign-out toast notification

---

## Project Structure

```
DeenStream/
├── src/
│   ├── App.tsx                  # App shell, routing, page transitions, overlay state
│   ├── Navbar.tsx               # Fixed top bar with search dropdown
│   ├── Sidebar.tsx              # Fixed left sidebar + mobile bottom nav
│   ├── Hero.tsx                 # Home page hero section
│   ├── SeriesBrowse.tsx         # Browsable series card grid with category filter
│   ├── ContinueWatching.tsx     # Resume video cards with progress bars
│   ├── ContinueListening.tsx    # Resume audio rows with real-time progress
│   ├── VideoDetailsPage.tsx     # Video player overlay: player, episode list, comments
│   ├── VideoPlayer.tsx          # Custom HTML5 player with keyboard shortcuts
│   ├── AudioBooksPage.tsx       # Audiobook browse grid with category filter
│   ├── AudioPlayerPage.tsx      # Audio player overlay with episode list
│   ├── AudioStickyPlayer.tsx    # Persistent bottom audio bar
│   ├── Favorites.tsx            # Saved Series / Saved Lectures / Liked Videos tabs
│   ├── SettingsPage.tsx         # Profile, email, password, avatar, account deletion
│   ├── Login.tsx / Register.tsx # Auth forms with inline status banners
│   ├── contexts/
│   │   ├── AuthContext.tsx           # userId for per-account localStorage namespacing
│   │   ├── WatchProgressContext.tsx  # Video progress (localStorage + server sync)
│   │   ├── AudioProgressContext.tsx  # Audio progress (localStorage + server sync)
│   │   ├── AudioPlayerContext.tsx    # Global audio playback state
│   │   └── FavoritesContext.tsx      # Favorites state
│   └── utils.ts                 # Shared formatTime utility
└── server/
    ├── index.js                 # Express entry point, MongoDB connection, route mounting
    ├── models/
    │   ├── User.js
    │   ├── Comment.js
    │   ├── WatchProgress.js
    │   ├── AudioProgress.js
    │   └── VideoReaction.js
    └── routes/
        ├── userRoutes.js
        ├── commentRoutes.js
        ├── watchProgressRoutes.js
        ├── audioProgressRoutes.js
        └── videoReactionRoutes.js
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)

### Backend

```bash
cd server
npm install
```

Create `server/.env`:

```
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/deenstream
JWT_SECRET=your_secret_here
PORT=5000
```

```bash
node index.js          # production
npx nodemon index.js   # development (auto-restart)
```

### Frontend

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` and calls the backend at `http://localhost:5000`.

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register` | — | Create account |
| POST | `/api/users/login` | — | Login, returns JWT |
| GET | `/api/users/me` | ✓ | Restore session |
| PUT | `/api/users/profile` | ✓ | Update display name |
| PUT | `/api/users/email` | ✓ | Change email |
| PUT | `/api/users/password` | ✓ | Change password |
| PUT | `/api/users/avatar` | ✓ | Upload profile photo |
| DELETE | `/api/users/account` | ✓ | Delete account + all data |
| GET | `/api/comments/:seriesId/:episodeId` | — | Fetch comments + replies |
| POST | `/api/comments` | ✓ | Post comment or reply |
| PUT | `/api/comments/:id` | ✓ | Edit own comment |
| DELETE | `/api/comments/:id` | ✓ | Delete own comment (cascades replies) |
| POST | `/api/comments/:id/like` | ✓ | Toggle like |
| POST | `/api/comments/:id/dislike` | ✓ | Toggle dislike |
| GET | `/api/watch-progress` | ✓ | Get all video progress |
| POST | `/api/watch-progress` | ✓ | Save/update video progress |
| DELETE | `/api/watch-progress/:seriesId/:episodeId` | ✓ | Remove video progress entry |
| GET | `/api/audio-progress` | ✓ | Get all audio progress |
| POST | `/api/audio-progress` | ✓ | Save/update audio progress |
| DELETE | `/api/audio-progress/:bookId/:episodeId` | ✓ | Remove audio progress entry |
| GET | `/api/video-reactions/liked` | ✓ | Get liked episodes |
| GET | `/api/video-reactions/:seriesId/:episodeId` | — | Get reaction counts |
| POST | `/api/video-reactions` | ✓ | Toggle like/dislike on episode |
