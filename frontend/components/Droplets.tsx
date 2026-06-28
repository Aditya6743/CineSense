/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { motion, useScroll, useTransform, MotionValue, useMotionValue, useSpring, useAnimationFrame } from "framer-motion";
import { useEffect, useState, useRef } from "react";

type Droplet = {
  id: number;
  left: number;
  top: number;
  size: number;
  speed: number;
  opacity: number;
  duration: number;
  color: string;
};

// Global mouse tracker to avoid passing props down heavily
const globalMouse = { x: -1000, y: -1000 };

export default function Droplets() {
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(1000);
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const colors = ["bg-cyan-400", "bg-emerald-400", "bg-teal-400", "bg-blue-400"];
    const initialDroplets = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 20 + 5,
      speed: Math.random() * 0.8 + 0.2,
      opacity: Math.random() * 0.5 + 0.2,
      duration: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setDroplets(initialDroplets);

    const handleResize = () => setWindowHeight(document.body.scrollHeight);
    handleResize();
    window.addEventListener("resize", handleResize);
    
    const handleMouse = (e: MouseEvent) => {
      globalMouse.x = e.clientX;
      globalMouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouse);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden h-full w-full">
      {droplets.map((drop) => (
        <DropletItem key={drop.id} drop={drop} scrollY={scrollY} windowHeight={windowHeight} />
      ))}
    </div>
  );
}

function DropletItem({ drop, scrollY, windowHeight }: { drop: Droplet, scrollY: MotionValue<number>, windowHeight: number }) {
  const yScroll = useTransform(scrollY, [0, windowHeight], [0, windowHeight * drop.speed]);
  const ref = useRef<HTMLDivElement>(null);
  
  const pushX = useMotionValue(0);
  const pushY = useMotionValue(0);
  const smoothPushX = useSpring(pushX, { damping: 12, stiffness: 200, mass: 0.5 });
  const smoothPushY = useSpring(pushY, { damping: 12, stiffness: 200, mass: 0.5 });

  const finalY = useTransform(() => yScroll.get() + smoothPushY.get());

  useAnimationFrame(() => {
    if (!ref.current) return;
    
    // Calculate center purely mathematically to avoid DOM layout thrashing!
    // getBoundingClientRect() inside requestAnimationFrame causes brutal lag.
    const dropCenterX = (drop.left / 100) * window.innerWidth + smoothPushX.get();
    const dropCenterY = (drop.top / 100) * windowHeight + finalY.get();
    
    const dx = dropCenterX - globalMouse.x;
    const dy = dropCenterY - globalMouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const threshold = 180; // Distance at which droplets start running away
    
    if (distance < threshold && distance > 0) {
      // Calculate repulsion force
      const force = Math.pow((threshold - distance) / threshold, 2);
      const dirX = dx / distance;
      const dirY = dy / distance;
      
      // Push droplet away
      pushX.set(pushX.get() + dirX * force * 15);
      pushY.set(pushY.get() + dirY * force * 15);
    } else {
      // Slowly return to original floating position
      pushX.set(pushX.get() * 0.95);
      pushY.set(pushY.get() * 0.95);
    }
  });

  return (
    <motion.div
      ref={ref}
      style={{
        x: smoothPushX,
        y: finalY,
        left: `${drop.left}%`,
        top: `${drop.top}%`,
        width: drop.size,
        height: drop.size,
      }}
      animate={{
        opacity: [drop.opacity, drop.opacity * 1.5, drop.opacity],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration: drop.duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`absolute rounded-full ${drop.color} blur-[3px] shadow-[0_0_20px_rgba(34,211,238,0.5)] mix-blend-screen`}
    />
  );
}
