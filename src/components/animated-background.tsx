"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  type: "dot" | "ring" | "diamond";
}

interface FloatingOrb {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface EnergyLine {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delay: number;
}

export function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [orbs, setOrbs] = useState<FloatingOrb[]>([]);
  const [energyLines, setEnergyLines] = useState<EnergyLine[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isHovering, setIsHovering] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothSpring = { damping: 30, stiffness: 200, mass: 0.5 };
  const laggySpring = { damping: 20, stiffness: 100, mass: 1 };
  const snappySpring = { damping: 40, stiffness: 400 };
  
  const cursorX = useSpring(mouseX, smoothSpring);
  const cursorY = useSpring(mouseY, smoothSpring);
  const lagCursorX = useSpring(mouseX, laggySpring);
  const lagCursorY = useSpring(mouseY, laggySpring);
  const trailCursorX = useSpring(mouseX, { damping: 15, stiffness: 50 });
  const trailCursorY = useSpring(mouseY, { damping: 15, stiffness: 50 });

  // Pre-compute all useTransform values to avoid conditional hook calls
  const trailX = useTransform(trailCursorX, (x) => x - 300);
  const trailY = useTransform(trailCursorY, (y) => y - 300);
  const lagX = useTransform(lagCursorX, (x) => x - 200);
  const lagY = useTransform(lagCursorY, (y) => y - 200);
  const cursorGlowX = useTransform(cursorX, (x) => x - 125);
  const cursorGlowY = useTransform(cursorY, (y) => y - 125);
  const hoverRingX = useTransform(cursorX, (x) => x - 20);
  const hoverRingY = useTransform(cursorY, (y) => y - 20);
  const hoverOuterRingX = useTransform(lagCursorX, (x) => x - 30);
  const hoverOuterRingY = useTransform(lagCursorY, (y) => y - 30);
  const hoverDotX = useTransform(cursorX, (x) => x - 4);
  const hoverDotY = useTransform(cursorY, (y) => y - 4);

  const colors = useMemo(() => ({
    blue: [
      "rgba(59, 130, 246, 0.8)",
      "rgba(59, 130, 246, 0.5)",
      "rgba(96, 165, 250, 0.6)",
    ],
    red: [
      "rgba(239, 68, 68, 0.6)",
      "rgba(248, 113, 113, 0.4)",
    ],
    white: [
      "rgba(255, 255, 255, 0.4)",
      "rgba(226, 232, 240, 0.3)",
    ],
  }), []);

  const allColors = useMemo(() => [...colors.blue, ...colors.red, ...colors.white], [colors]);

  const generateParticles = useCallback((width: number, height: number) => {
    const newParticles: Particle[] = [];
    const particleCount = Math.min(50, Math.floor((width * height) / 35000));
    const types: ("dot" | "ring" | "diamond")[] = ["dot", "dot", "dot", "ring", "diamond"];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 6 + 2,
        color: allColors[Math.floor(Math.random() * allColors.length)],
        delay: Math.random() * 8,
        duration: Math.random() * 15 + 20,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }
    return newParticles;
  }, [allColors]);

  const generateOrbs = useCallback((width: number, height: number) => {
    const newOrbs: FloatingOrb[] = [];
    const orbCount = 5;
    
    for (let i = 0; i < orbCount; i++) {
      newOrbs.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 300 + 200,
        color: i % 2 === 0 ? "rgba(59, 130, 246, 0.08)" : "rgba(239, 68, 68, 0.05)",
        duration: Math.random() * 30 + 40,
        delay: Math.random() * 10,
      });
    }
    return newOrbs;
  }, []);

  const generateEnergyLines = useCallback((width: number, height: number) => {
    const lines: EnergyLine[] = [];
    const lineCount = 8;
    
    for (let i = 0; i < lineCount; i++) {
      const isHorizontal = Math.random() > 0.5;
      lines.push({
        id: i,
        x1: isHorizontal ? 0 : Math.random() * width,
        y1: isHorizontal ? Math.random() * height : 0,
        x2: isHorizontal ? width : Math.random() * width,
        y2: isHorizontal ? Math.random() * height : height,
        delay: Math.random() * 15,
      });
    }
    return lines;
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      setParticles(generateParticles(dimensions.width, dimensions.height));
      setOrbs(generateOrbs(dimensions.width, dimensions.height));
      setEnergyLines(generateEnergyLines(dimensions.width, dimensions.height));
    }
  }, [dimensions, generateParticles, generateOrbs, generateEnergyLines]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);
    
    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseenter", handleMouseEnter);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  const renderParticle = (particle: Particle) => {
    const baseStyle = {
      left: particle.x,
      top: particle.y,
    };

    if (particle.type === "ring") {
      return (
        <motion.div
          key={particle.id}
          className="absolute rounded-full border"
          style={{
            ...baseStyle,
            width: particle.size * 2,
            height: particle.size * 2,
            borderColor: particle.color,
            borderWidth: 1,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.sin(particle.id) * 30, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      );
    }

    if (particle.type === "diamond") {
      return (
        <motion.div
          key={particle.id}
          className="absolute"
          style={{
            ...baseStyle,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: "rotate(45deg)",
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.cos(particle.id) * 20, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: particle.duration * 0.8,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      );
    }

    return (
      <motion.div
        key={particle.id}
        className="absolute rounded-full"
        style={{
          ...baseStyle,
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
          boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
        }}
        animate={{
          y: [0, -60, 0],
          x: [0, Math.sin(particle.id * 0.5) * 25, 0],
          opacity: [0.4, 1, 0.4],
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: particle.duration,
          delay: particle.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    );
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: [orb.x, orb.x + 100, orb.x - 50, orb.x],
            y: [orb.y, orb.y - 80, orb.y + 60, orb.y],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          x: trailX,
          y: trailY,
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.04) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          x: lagX,
          y: lagY,
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(96, 165, 250, 0.1) 30%, transparent 60%)",
          filter: "blur(40px)",
        }}
      />

      <motion.div
        className="absolute rounded-full"
        style={{
          width: 250,
          height: 250,
          x: cursorGlowX,
          y: cursorGlowY,
          background: "radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(248, 113, 113, 0.05) 40%, transparent 60%)",
          filter: "blur(30px)",
        }}
      />

      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <pattern id="hexGrid" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            <path
              d="M25,0 L50,14.4 L50,43.4 L25,43.4 L0,28.9 L0,14.4 Z"
              fill="none"
              stroke="rgba(59, 130, 246, 0.04)"
              strokeWidth="0.5"
            />
          </pattern>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexGrid)" />
        
        {energyLines.map((line) => (
          <motion.line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.4, 0],
            }}
            transition={{
              duration: 8,
              delay: line.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {particles.map(renderParticle)}

      <AnimatePresence>
        {isHovering && (
          <>
            <motion.div
              className="absolute rounded-full border border-primary/30"
              style={{
                width: 40,
                height: 40,
                x: hoverRingX,
                y: hoverRingY,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 180, 360],
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              }}
            />

            <motion.div
              className="absolute rounded-full border border-red-400/20"
              style={{
                width: 60,
                height: 60,
                x: hoverOuterRingX,
                y: hoverOuterRingY,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.4, 0.2],
                rotate: [360, 180, 0],
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 15, repeat: Infinity, ease: "linear" },
              }}
            />

            <motion.div
              className="absolute"
              style={{
                width: 8,
                height: 8,
                x: hoverDotX,
                y: hoverDotY,
                backgroundColor: "rgba(59, 130, 246, 0.8)",
                boxShadow: "0 0 20px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.3)",
                transform: "rotate(45deg)",
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            />
          </>
        )}
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent" />
    </div>
  );
}
