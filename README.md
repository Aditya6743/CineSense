## 🌐 Live Demo

Experience CineSense live here:

**🔗https://cinesense-aditya.vercel.app/**

<div align="center">
  <br />
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Clapper%20Board.png" alt="Clapper Board" width="80" height="80" />
  
  <h1 align="center">C I N E S E N S E</h1>

  <p align="center">
    <strong>Shattering the Flat Web. The Future of Cinematic Exploration.</strong>
    <br />
    <br />
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://threejs.org/"><img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" /></a>
    <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
    <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" /></a>
  </p>
</div>

<br />

## 🌌 The Vision

*"Why should movies be displayed on a boring, flat grid when they can be explored in a physical, three-dimensional space?"*

**CineSense** is an ultra-premium, interactive 3D movie discovery platform. It abandons traditional UI patterns used by modern streaming services in favor of an immersive, spatial environment powered by AI. Navigating CineSense isn't just about finding a movie; it's a cinematic journey through a futuristic digital art gallery.

<br />

## ✨ Jaw-Dropping Features

### 🧠 Gemini AI Mood Matcher
Don't know what to watch? Tell the AI your vibe, how much time you have, and your favorite cinema era. The integrated Google Gemini AI engine will analyze your inputs and recommend the *perfect* movie, completely bypassing the endless scrolling paradox.

### 🎬 Real-time Movie Sync
Watching with friends but can't agree on a movie? Create a **Movie Sync** session, share the unique link with your group (up to any size), and swipe through AI-generated recommendations in real-time. When everyone votes "Yes" on the same movie, the room ignites with confetti! Powered by Supabase Realtime.

### 🚀 The Neon Tunnel (3D Core)
Scroll through a massive, continuously rotating corridor of glowing neon accelerator rings. As you fly through the tunnel:
- **Spatial Emergence:** Movie posters dynamically scale and materialize out of the rings as you scroll forward.
- **Interactive Backplates:** Hovering over any poster makes it pop out in 3D (Z-axis) while its metallic backplate ignites with an intense neon bloom.

### 🔮 Interactive Poster Sphere
An interactive, draggable 3D sphere of trending movie posters floating in the void. Users can grab, spin, and interact with movies in a zero-gravity environment.

### 📚 Seamless Library Management
- **Watchlist & Watched Tracking:** Securely store the movies you want to see and the ones you've already conquered. Persistent sessions keep you logged in.
- **Supabase Auth:** Fast, secure, passwordless magic-link and Google OAuth integration.

### 🎞️ Cinematic UI & Scroll
- **Lenis Smooth Scroll:** Buttery 120 FPS scroll hijacking that perfectly maps your mouse wheel to camera velocity in 3D space.
- **Hardware-Accelerated Transitions:** Framer Motion handles gorgeous UI pop-outs, scale entrances, and parallax effects entirely on the GPU.

<br />

## 🛠️ Architecture & Tech Stack

CineSense bridges the gap between high-performance 3D graphics on the client and robust AI processing on the server.

- **Frontend:** Next.js 16 (App Router), React Three Fiber, Tailwind CSS, Framer Motion, GSAP, Lenis Scroll.
- **Backend:** Embedded FastAPI (Python) for API routes seamlessly integrated with Next.js on Vercel.
- **Database & Auth:** Supabase (PostgreSQL) for user management, real-time voting sessions, and library storage.
- **AI & Data:** Google Gemini 2.5 Flash for natural language recommendation processing, and TMDB API for rich cinematic metadata.

<br />

## 💻 Getting Started Locally

To run CineSense locally and experience the 3D web:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Aditya6743/CineSense.git
   cd CineSense/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the `frontend/` directory with your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_postgres_url
   TMDB_API_TOKEN=your_tmdb_read_access_token
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Ignite the server:**
   ```bash
   npm run dev
   ```

5. **Experience the magic:** 
   Open [http://localhost:3000](http://localhost:3000) in your browser.

<br />

---
<div align="center">
  <p>Crafted with ❤️ for the love of cinema, AI, & cutting-edge web technology.</p>
</div>
