<div align="center">
  <br />
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Clapper%20Board.png" alt="Clapper Board" width="80" height="80" />
  
  <h1 align="center">C I N E S E N S E</h1>

  <p align="center">
    <strong>Shattering the Flat Web. The Future of Cinematic Exploration.</strong>
    <br />
    <br />
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
    <a href="https://threejs.org/"><img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://www.framer.com/motion/"><img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  </p>
</div>

<br />

## 🌌 The Vision

*"Why should movies be displayed on a boring, flat grid when they can be explored in a physical, three-dimensional space?"*

**CineSense** is an ultra-premium, interactive 3D movie discovery platform. It abandons traditional UI patterns used by modern streaming services in favor of an immersive, spatial environment. Navigating CineSense isn't just about finding a movie; it's a cinematic journey through a futuristic digital art gallery.

<br />

## ✨ Jaw-Dropping Features

### 🚀 The Neon Tunnel (Core USP)
Scroll through a massive, continuously rotating corridor of glowing neon accelerator rings. As you fly through the tunnel:
- **Spatial Emergence:** Movie posters dynamically scale and materialize out of the rings as you scroll forward.
- **Interactive Backplates:** Hovering over any poster makes it pop out in 3D (Z-axis) while its metallic backplate ignites with an intense neon bloom.
- **Cinematic Dissolve:** Posters gracefully fade into transparency as they pass the camera, keeping the view clean and immersive.

### 🔮 Interactive Poster Sphere
An interactive, draggable 3D sphere of trending movie posters floating in the void. Users can grab, spin, and interact with movies in a zero-gravity environment.

### ✨ Premium Particle Engine
Standard web typography is dead. CineSense features text ("Aditya says hello to you") and UI elements (like the scroll chevron) that dynamically assemble from hundreds of shiny, metallic 3D particles.

### 🎞️ Cinematic UI & Scroll
- **Lenis Smooth Scroll:** Buttery 120 FPS scroll hijacking that perfectly maps your mouse wheel to camera velocity in 3D space.
- **Hardware-Accelerated Transitions:** Framer Motion handles gorgeous UI pop-outs, scale entrances, and parallax effects entirely on the GPU.
- **Deep Bloom Post-Processing:** Heavy GPU bloom effects for that rich, high-end sci-fi aesthetic without sacrificing performance.

<br />

## 🛠️ Architecture & Performance

Despite rendering hundreds of 3D objects and heavy post-processing filters, CineSense is strictly optimized to hit **120 FPS**:
- **Geometry Instancing & Re-use:** Custom `PlaneGeometry` usage minimizes vertex load.
- **Smart Culling:** Off-screen geometry is culled, and transparent elements dissolve before clipping the camera.
- **Zero-Paint Layouts:** UI animations use strict `will-change: transform, opacity` to prevent main-thread layout thrashing.

<br />

## 💻 Getting Started

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

3. **Ignite the server:**
   ```bash
   npm run dev
   ```

4. **Experience the magic:** 
   Open [http://localhost:3000](http://localhost:3000) in your browser.

<br />

---
<div align="center">
  <p>Crafted with ❤️ for the love of cinema & cutting-edge web technology.</p>
</div>
