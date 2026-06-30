"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Database, Cpu, MonitorPlay, Binary, Sparkles } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Step = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  visual: React.ReactNode;
};

const steps: Step[] = [
  {
    title: "Data Ingestion",
    description: "We process thousands of movies from TMDB, parsing genres, keywords, cast, and crew into a structured format.",
    icon: <Database className="w-6 h-6 text-violet-400" />,
    color: "violet",
    visual: (
      <div className="text-xs font-mono text-violet-500/50 bg-black/50 p-4 rounded-xl border border-violet-500/10 h-32 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"/>
        <pre className="opacity-70">
{`{
  "id": 27205,
  "title": "Inception",
  "genres": ["Action", "Sci-Fi", "Thriller"],
  "keywords": ["dream", "subconscious"],
  "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt"]
}`}
        </pre>
      </div>
    )
  },
  {
    title: "Vectorization",
    description: "Using TF-IDF (Term Frequency-Inverse Document Frequency), we convert text metadata into high-dimensional numerical vectors.",
    icon: <Cpu className="w-6 h-6 text-blue-400" />,
    color: "blue",
    visual: (
      <div className="text-xs font-mono text-blue-500/50 bg-black/50 p-4 rounded-xl border border-blue-500/10 h-32 overflow-hidden relative flex items-center justify-center">
        <Binary className="absolute opacity-10 w-24 h-24" />
        <pre className="opacity-70">
{`[
  0.0, 0.12, 0.0, 0.45, 
  0.89, 0.0, 0.0, 0.11,
  0.34, 0.56, 0.0, 0.99
]`}
        </pre>
      </div>
    )
  },
  {
    title: "Cosine Similarity",
    description: "We mathematically calculate the angle between movie vectors to find the absolute closest matches in multi-dimensional space.",
    icon: <MonitorPlay className="w-6 h-6 text-fuchsia-400" />,
    color: "fuchsia",
    visual: (
      <div className="text-xs font-mono text-fuchsia-500/50 bg-black/50 p-4 rounded-xl border border-fuchsia-500/10 h-32 overflow-hidden relative flex items-center justify-center">
        <Sparkles className="absolute opacity-10 w-24 h-24" />
        <pre className="opacity-70 text-center">
{`sim(A, B) = cos(θ) = 
(A · B) / (||A|| ||B||)

Result: 0.92 (92% Match)`}
        </pre>
      </div>
    )
  }
];

import Tilt from "react-parallax-tilt";

function TimelineCard({ step }: { step: Step }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const glowOpacity = useTransform(mouseXSpring, [-0.5, 0, 0.5], [0, 0.15, 0]);

  return (
    <Tilt
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      perspective={1000}
      transitionSpeed={1000}
      scale={1.02}
      gyroscope={true}
      className="w-full"
    >
      <motion.div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - rect.left - rect.width / 2);
          y.set(e.clientY - rect.top - rect.height / 2);
        }}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        className="relative rounded-[2rem] bg-white/5 p-8 backdrop-blur-3xl shadow-2xl transition-colors cursor-none group w-full overflow-hidden animated-border"
        data-magnetic="true"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 mix-blend-overlay" />
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-tr from-${step.color}-500/20 to-transparent blur-3xl rounded-full`} 
          style={{ opacity: glowOpacity }} 
        />
        <div style={{ transform: "translateZ(30px)" }} className="relative z-10">
          <h3 className="text-2xl md:text-3xl font-black mb-3 text-white tracking-tight">{step.title}</h3>
          <p className="text-gray-400 leading-relaxed mb-6 text-sm md:text-base font-medium">{step.description}</p>
          {step.visual}
        </div>
      </motion.div>
    </Tilt>
  );
}

export default function Timeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const laserRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef<boolean[]>([]);

  useEffect(() => {
    if (!trackRef.current || !lineRef.current || !laserRef.current) return;
    
    const items = gsap.utils.toArray<HTMLElement>(".timeline-item");
    hasTriggeredRef.current = new Array(items.length).fill(false);
    
    const ctx = gsap.context(() => {
      const trackHeight = trackRef.current!.offsetHeight;
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
          start: "top 60%", 
          toggleActions: "play none none reverse", 
        }
      });

      // Ensure line is visible at start of timeline
      tl.set([lineRef.current, laserRef.current], { opacity: 1 });

      // Animate the line growing from top to bottom
      tl.to(lineRef.current, {
        height: "100%",
        duration: 3, 
        ease: "power2.inOut", 
      }, 0);

      // Animate the laser head traveling from top to bottom
      tl.to(laserRef.current, {
        top: "100%",
        duration: 3, 
        ease: "power2.inOut", 
      }, 0);

      // Insert item animations at the exact second the laser passes them
      items.forEach((item, i) => {
        const itemOffset = item.offsetTop + (item.offsetHeight / 2);
        const triggerPoint = itemOffset / trackHeight;
        
        // Use a slight ease adjustment for the timing calculation since power2.inOut isn't strictly linear, 
        // but linear mapping is extremely close and looks flawless.
        const hitTime = triggerPoint * 3;
        
        const icon = item.querySelector('.timeline-icon');
        const card = item.querySelector('.timeline-card-wrapper');
        
        // Animate Icon popping in
        tl.fromTo(icon, 
          { scale: 0, opacity: 0, backgroundColor: "rgba(255,255,255,0.05)" }, 
          { scale: 1, opacity: 1, backgroundColor: "rgba(124, 92, 255, 0.15)", ease: "back.out(2)", duration: 0.35 },
          hitTime
        );
        
        // Animate Card sliding in (very fast, hard popping)
        tl.fromTo(card, 
          { opacity: 0, x: i % 2 === 0 ? -50 : 50 },
          { opacity: 1, x: 0, ease: "back.out(2)", duration: 0.35 },
          hitTime + 0.05
        );
      });

      // Minimize the line at the end (tail catches up to head, shrinking into a point)
      tl.to(lineRef.current, { top: "100%", height: "0%", duration: 0.8, ease: "power3.inOut" }, 3);
      
      // Shrink the laser head out of existence at the very end
      tl.to(laserRef.current, { scale: 0, opacity: 0, duration: 0.4, ease: "back.in(2)" }, 3.4);
    });
    
    return () => ctx.revert();
  }, []);

  return (
    <section id="features" className="relative w-full overflow-hidden py-40 px-6">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto relative z-10">
        
        <div className="mb-32 text-center">
          <h2 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-violet-400 via-blue-400 to-fuchsia-400 bg-clip-text text-transparent mb-6">
            The Science of Discovery
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            We don&apos;t just guess. We use advanced Machine Learning to mathematically prove what you&apos;ll love next.
          </p>
        </div>

        {/* The Track */}
        <div ref={trackRef} className="relative flex flex-col gap-32">
          
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-white/5 rounded-full" />
          
          <div 
            ref={lineRef} 
            className="absolute left-1/2 top-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-violet-400/80 via-blue-400/80 to-fuchsia-400/80 shadow-[0_0_15px_rgba(124,92,255,0.5)] rounded-full origin-top" 
            style={{ height: "0%" }} 
          />
          
          <div 
            ref={laserRef}
            className="absolute left-1/2 w-1.5 h-8 bg-violet-300 rounded-full shadow-[0_0_15px_rgba(124,92,255,0.8)] z-30 pointer-events-none origin-top"
            style={{ top: "0%", transform: "translate(-50%, -50%)" }}
          />

          {steps.map((step, index) => (
            <div key={index} className={`timeline-item relative flex flex-col md:flex-row items-center justify-between w-full ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              
              <div className="hidden md:block w-5/12" />

              <div 
                className="timeline-icon flex h-16 w-16 md:absolute md:left-1/2 md:-translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-xl shadow-lg z-20 opacity-0 my-8 md:my-0"
                data-magnetic="true"
              >
                {step.icon}
              </div>

              <div className="w-full md:w-5/12 timeline-card-wrapper perspective-1000 opacity-0 transform-gpu" style={{ transform: `translateX(${index % 2 === 0 ? '-50px' : '50px'})` }}>
                <TimelineCard step={step} />
              </div>

            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
