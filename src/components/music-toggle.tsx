"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

// 8-bit chiptune melody generator using Web Audio API
class ChiptunePlayer {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private timeoutIds: NodeJS.Timeout[] = [];

  // Simple 8-bit melody notes (frequencies in Hz)
  private melody = [
    // Main theme loop - upbeat retro game vibe
    { freq: 392, duration: 200 },  // G4
    { freq: 440, duration: 200 },  // A4
    { freq: 523, duration: 400 },  // C5
    { freq: 440, duration: 200 },  // A4
    { freq: 392, duration: 200 },  // G4
    { freq: 330, duration: 400 },  // E4
    { freq: 294, duration: 200 },  // D4
    { freq: 330, duration: 200 },  // E4
    { freq: 392, duration: 400 },  // G4
    { freq: 330, duration: 200 },  // E4
    { freq: 294, duration: 200 },  // D4
    { freq: 262, duration: 600 },  // C4
    { freq: 0, duration: 200 },    // Rest
    { freq: 294, duration: 200 },  // D4
    { freq: 330, duration: 200 },  // E4
    { freq: 392, duration: 200 },  // G4
    { freq: 440, duration: 400 },  // A4
    { freq: 392, duration: 200 },  // G4
    { freq: 330, duration: 200 },  // E4
    { freq: 294, duration: 400 },  // D4
    { freq: 262, duration: 200 },  // C4
    { freq: 294, duration: 200 },  // D4
    { freq: 330, duration: 600 },  // E4
    { freq: 0, duration: 400 },    // Rest
  ];

  init() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 0.15; // Keep volume low
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  private playNote(frequency: number, startTime: number, duration: number) {
    if (!this.audioContext || !this.gainNode || frequency === 0) return;

    const oscillator = this.audioContext.createOscillator();
    const noteGain = this.audioContext.createGain();

    // Square wave for that classic 8-bit sound
    oscillator.type = "square";
    oscillator.frequency.value = frequency;

    // Add slight pitch wobble for retro feel
    oscillator.detune.value = Math.random() * 10 - 5;

    noteGain.gain.value = 0;
    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    noteGain.gain.setValueAtTime(0.3, startTime + duration / 1000 - 0.02);
    noteGain.gain.linearRampToValueAtTime(0, startTime + duration / 1000);

    oscillator.connect(noteGain);
    noteGain.connect(this.gainNode);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration / 1000 + 0.05);
  }

  private playMelody() {
    if (!this.audioContext || !this.isPlaying) return;

    let currentTime = this.audioContext.currentTime;

    this.melody.forEach((note) => {
      this.playNote(note.freq, currentTime, note.duration);
      currentTime += note.duration / 1000;
    });

    // Loop the melody
    const totalDuration = this.melody.reduce((acc, note) => acc + note.duration, 0);
    const timeoutId = setTimeout(() => {
      if (this.isPlaying) {
        this.playMelody();
      }
    }, totalDuration);
    this.timeoutIds.push(timeoutId);
  }

  async play() {
    this.init();
    if (this.audioContext?.state === "suspended") {
      await this.audioContext.resume();
    }
    this.isPlaying = true;
    this.playMelody();
  }

  stop() {
    this.isPlaying = false;
    this.timeoutIds.forEach(clearTimeout);
    this.timeoutIds = [];
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }
}

export function MusicToggle() {
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<ChiptunePlayer | null>(null);

  useEffect(() => {
    playerRef.current = new ChiptunePlayer();
    return () => {
      playerRef.current?.stop();
    };
  }, []);

  const toggleMusic = useCallback(async () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.stop();
      setIsPlaying(false);
    } else {
      await playerRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  return (
    <button
      onClick={toggleMusic}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 
                 border-4 border-[#3b82f6] bg-[#0a1628] hover:bg-[#1e3a5f] 
                 transition-colors cursor-pointer group"
      aria-label={isPlaying ? "Mute music" : "Play music"}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-4 h-4 text-[#60a5fa]" />
          <span className="text-[8px] text-[#60a5fa] uppercase hidden sm:inline">
            ♪ Playing
          </span>
          {/* Animated music bars */}
          <div className="flex gap-[2px] items-end h-3">
            <div className="w-[3px] bg-[#3b82f6] animate-music-bar-1" />
            <div className="w-[3px] bg-[#60a5fa] animate-music-bar-2" />
            <div className="w-[3px] bg-[#3b82f6] animate-music-bar-3" />
          </div>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4 text-[#3b82f6] group-hover:text-[#60a5fa]" />
          <span className="text-[8px] text-[#3b82f6] group-hover:text-[#60a5fa] uppercase hidden sm:inline">
            Music Off
          </span>
        </>
      )}
    </button>
  );
}
