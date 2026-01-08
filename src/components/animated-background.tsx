"use client";

import { useEffect, useState, useMemo } from "react";

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => {
    if (typeof window === "undefined") return [];
    const count = 12;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 8,
      duration: Math.random() * 10 + 20,
    }));
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-red-500/5" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-red-500/5" />
      
      <div 
        className="absolute rounded-full animate-float-slow"
        style={{
          width: 400,
          height: 400,
          left: "10%",
          top: "20%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div 
        className="absolute rounded-full animate-float-slower"
        style={{
          width: 300,
          height: 300,
          right: "15%",
          top: "40%",
          background: "radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <pattern id="hexGrid" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            <path
              d="M25,0 L50,14.4 L50,43.4 L25,43.4 L0,28.9 L0,14.4 Z"
              fill="none"
              stroke="rgba(59, 130, 246, 0.04)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
      </svg>

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-particle"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
            backgroundColor: "rgba(59, 130, 246, 0.5)",
            boxShadow: `0 0 ${particle.size * 2}px rgba(59, 130, 246, 0.3)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent" />
    </div>
  );
}
