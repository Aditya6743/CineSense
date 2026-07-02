"use client";

export default function CustomCursor() {
  // Custom JS cursors cause severe lag on heavy WebGL sites.
  // Returning null allows the hardware-accelerated OS native cursor to be used for buttery smooth performance.
  return null;
}
