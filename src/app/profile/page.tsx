"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Swords,
  Bell,
  Edit,
  BarChart3,
  GitBranch,
  Backpack,
  Trophy,
  Home,
  MessageSquare,
  User,
  Play,
  Lock,
  Laptop,
  Terminal,
  Database,
  Send,
  Coffee,
  PlusCircle,
  Bug,
  GitCommit,
  GraduationCap,
  FileCode,
  Palette,
  Code,
  Blocks,
} from "lucide-react";

const characterStats = [
  { name: "Intelligence (JS)", value: 78, max: 100, color: "bg-blue-500", shadow: "shadow-[0_0_8px_rgba(59,130,246,0.5)]" },
  { name: "Agility (CSS)", value: 92, max: 100, color: "bg-pink-500", shadow: "shadow-[0_0_8px_rgba(236,72,153,0.5)]" },
  { name: "Strength (Backend)", value: 45, max: 100, color: "bg-orange-500", shadow: "shadow-[0_0_8px_rgba(249,115,22,0.5)]" },
  { name: "Wisdom (Git/Ops)", value: 60, max: 100, color: "bg-cyan-500", shadow: "shadow-[0_0_8px_rgba(6,182,212,0.5)]" },
];

const skillTreeNodes = [
  { id: "html", name: "HTML5", icon: FileCode, color: "text-orange-500", unlocked: true, maxed: true },
  { id: "css", name: "CSS3", icon: Palette, color: "text-blue-500", unlocked: true, maxed: true },
  { id: "js", name: "ES6+", icon: Code, color: "text-yellow-400", unlocked: true, maxed: false, level: 8 },
  { id: "react", name: "React", icon: Blocks, color: "text-cyan-400", unlocked: false },
];

const inventoryItems = [
  { id: 1, name: "MacBook Pro M2", type: "Legendary Weapon", stat: "+25 Compile Speed", icon: Laptop, iconColor: "text-blue-400", equipped: true },
  { id: 2, name: "VS Code", type: "Epic IDE", stat: "+15 IntelliSense", icon: Terminal, iconColor: "text-purple-400", equipped: true },
  { id: 3, name: "Firebase SDK", type: "Rare Tool", stat: "Lvl 5 Required", icon: Database, iconColor: "text-orange-400", equipped: false },
  { id: 4, name: "Postman", type: "Uncommon Relic", stat: "+5 Debugging", icon: Send, iconColor: "text-green-400", equipped: false },
  { id: 5, name: "Infinite Coffee", type: "Consumable", stat: "+100 Energy (1h)", icon: Coffee, iconColor: "text-yellow-300", equipped: false },
];

const badges = [
  { id: 1, name: "Bug Slayer", icon: Bug, gradient: "from-yellow-600 to-yellow-800", border: "border-yellow-400", unlocked: true },
  { id: 2, name: "100 Commits", icon: GitCommit, gradient: "from-purple-600 to-indigo-800", border: "border-indigo-400", unlocked: true },
  { id: 3, name: "Scholar", icon: GraduationCap, gradient: "from-green-600 to-emerald-800", border: "border-green-400", unlocked: true },
];

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  const frequentlyUsedRaw = useQuery(
    api.toolUsage.getFrequentlyUsed,
    user?.id ? { userId: user.id, limit: 6 } : "skip"
  );

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="quest-card p-8 text-center max-w-md">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground mb-2">Login Required</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Please login to view your character profile
          </p>
          <Link href="/sign-in">
            <button className="quest-btn px-6 py-2 font-bold">
              Connect
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const userName = user.firstName || "Adventurer";
  const userClass = "Frontend Mage";
  const userLevel = 12;
  const xpCurrent = 3450;
  const xpMax = 5000;
  const xpPercent = Math.round((xpCurrent / xpMax) * 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-6">
            <div className="bg-card border border-border rounded-xl overflow-hidden relative group">
              <div className="h-32 bg-gradient-to-b from-primary/30 to-card relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
              </div>
              <div className="px-6 pb-6 pt-0 relative">
                <div className="size-24 rounded-xl border-4 border-card bg-card absolute -top-12 left-6 overflow-hidden shadow-xl">
                  {user.imageUrl ? (
                    <img
                      alt="Avatar"
                      className="w-full h-full object-cover bg-primary/10"
                      src={user.imageUrl}
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                      <User className="w-10 h-10 text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex justify-end pt-3 mb-2">
                  <button className="text-xs bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors flex items-center gap-1">
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="mt-8">
                  <h1 className="text-2xl font-bold text-foreground">{userName}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-primary font-bold text-sm tracking-wide">{userClass}</span>
                    <span className="size-1 bg-muted-foreground rounded-full" />
                    <span className="text-muted-foreground text-sm">Level {userLevel}</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground mb-1">
                      <span>Experience</span>
                      <span>{xpPercent}%</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-purple-400"
                        style={{ width: `${xpPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-background p-3 rounded border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase">Rank</div>
                      <div className="text-lg font-bold text-foreground">#4,201</div>
                    </div>
                    <div className="bg-background p-3 rounded border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase">Quests</div>
                      <div className="text-lg font-bold text-foreground">42</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 size-24 bg-primary/10 rounded-full blur-2xl" />
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-yellow-500" />
                Character Stats
              </h3>
              <div className="space-y-4">
                {characterStats.map((stat) => (
                  <div key={stat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-300 font-medium">{stat.name}</span>
                      <span className="text-primary font-bold text-sm">{stat.value}/{stat.max}</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-1.5">
                      <div
                        className={`${stat.color} h-1.5 rounded-full ${stat.shadow}`}
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">2 Stat Points Available</p>
                <button className="mt-2 text-xs font-bold text-primary border border-primary/30 bg-primary/10 px-3 py-1.5 rounded hover:bg-primary hover:text-white transition-all w-full">
                  Distribute Points
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1 flex flex-col gap-8 min-w-0">
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <GitBranch className="w-6 h-6 text-purple-400" />
                  Skill Tree
                </h2>
                <span className="text-xs bg-card border border-border px-3 py-1 rounded text-muted-foreground">
                  Next: Unlock React Hooks
                </span>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 overflow-x-auto inventory-scroll relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(127,19,236,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(127,19,236,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                <div className="flex items-center min-w-[600px] justify-between gap-4 py-8 relative z-10">
                  {skillTreeNodes.map((node, index) => (
                    <div key={node.id} className="flex items-center">
                      <div className={`group relative flex flex-col items-center gap-2 ${!node.unlocked ? 'opacity-60' : ''}`}>
                        {node.unlocked && !node.maxed && (
                          <div className="absolute -inset-2 rounded-full border border-dashed border-yellow-500 animate-spin pointer-events-none opacity-50" style={{ animationDuration: '10s' }} />
                        )}
                        <div
                          className={`size-16 rounded-full bg-card border-2 ${
                            node.unlocked
                              ? node.maxed
                                ? 'border-primary shadow-[0_0_15px_rgba(127,19,236,0.4)]'
                                : 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                              : 'border-border'
                          } flex items-center justify-center relative z-10 cursor-pointer hover:scale-110 transition-transform`}
                        >
                          <node.icon className={`w-8 h-8 ${node.color}`} />
                          {node.unlocked && (
                            <div
                              className={`absolute -bottom-1 -right-1 ${
                                node.maxed ? 'bg-primary' : 'bg-yellow-600'
                              } text-white text-[10px] px-1.5 py-0.5 rounded-full border border-card font-bold`}
                            >
                              {node.maxed ? 'MAX' : `LVL ${node.level}`}
                            </div>
                          )}
                          {!node.unlocked && (
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                              <Lock className="w-5 h-5 text-white/50" />
                            </div>
                          )}
                        </div>
                        <span className={`text-xs font-bold ${node.unlocked ? 'text-foreground' : 'text-muted-foreground'} bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm`}>
                          {node.name}
                        </span>
                      </div>
                      {index < skillTreeNodes.length - 1 && (
                        <div className={`h-1 w-16 mx-4 rounded-full ${
                          node.unlocked && skillTreeNodes[index + 1].unlocked
                            ? 'bg-primary shadow-[0_0_10px_rgba(127,19,236,0.3)]'
                            : node.unlocked && !skillTreeNodes[index + 1].unlocked
                            ? 'bg-border relative overflow-hidden'
                            : 'bg-border'
                        }`}>
                          {node.unlocked && !skillTreeNodes[index + 1].unlocked && (
                            <div className="absolute top-0 left-0 h-full w-1/2 bg-yellow-500/50" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Backpack className="w-6 h-6 text-primary" />
                  Inventory
                </h2>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-card border border-border text-muted-foreground">
                    Slots: 12/20
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {inventoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 bg-card border ${
                      item.equipped ? 'border-primary/40' : 'border-border hover:border-primary/30'
                    } rounded-lg p-3 relative overflow-hidden group hover:bg-secondary transition-colors cursor-pointer`}
                  >
                    {item.equipped && (
                      <div className="absolute top-0 right-0 bg-primary/20 px-2 py-0.5 rounded-bl text-[10px] text-primary uppercase font-bold">
                        Equipped
                      </div>
                    )}
                    <div className={`size-14 bg-background rounded flex items-center justify-center border ${
                      item.equipped ? 'border-primary/30 shadow-[0_0_10px_rgba(127,19,236,0.2)]' : 'border-white/10'
                    }`}>
                      <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground font-bold text-sm truncate">{item.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{item.type}</p>
                      <div className={`text-[10px] mt-1 ${item.stat.includes('+') ? 'text-green-400' : 'text-gray-400'}`}>
                        {item.stat}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-center gap-3 bg-card/30 border border-dashed border-border rounded-lg p-3 min-h-[80px] group hover:bg-card hover:border-primary/50 transition-colors cursor-pointer">
                  <PlusCircle className="w-5 h-5 text-border group-hover:text-primary transition-colors" />
                  <span className="text-xs text-muted-foreground font-medium">Empty Slot</span>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Badges & Trophies
              </h2>
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex flex-wrap gap-4">
                  {badges.map((badge) => (
                    <div key={badge.id} className="flex flex-col items-center gap-2 group cursor-pointer">
                      <div className={`size-12 rounded-full bg-gradient-to-br ${badge.gradient} border-2 ${badge.border} flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform`}>
                        <badge.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors">
                        {badge.name}
                      </span>
                    </div>
                  ))}
                  {[1, 2].map((i) => (
                    <div key={`locked-${i}`} className="flex flex-col items-center gap-2 opacity-40">
                      <div className="size-12 rounded-full bg-secondary border-2 border-white/10 flex items-center justify-center shadow-inner">
                        <Lock className="w-5 h-5 text-white/50" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">Locked</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="skill-bar">
          <Link href="/">
            <button className="skill-btn">
              <Home className="w-5 h-5" />
              <span className="absolute -bottom-2 bg-black text-[10px] text-gray-400 px-1 rounded border border-gray-800">1</span>
            </button>
          </Link>
          <Link href="/tools">
            <button className="skill-btn">
              <Backpack className="w-5 h-5" />
              <span className="absolute -bottom-2 bg-black text-[10px] text-gray-400 px-1 rounded border border-gray-800">2</span>
            </button>
          </Link>
          <div className="w-px h-8 bg-border mx-1" />
          <button className="skill-btn skill-btn-primary">
            <Play className="w-8 h-8" />
            <span className="absolute -bottom-2.5 bg-black text-[10px] text-primary font-bold px-1.5 rounded border border-primary/50">SPACE</span>
          </button>
          <div className="w-px h-8 bg-border mx-1" />
          <button className="skill-btn">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -bottom-2 bg-black text-[10px] text-gray-400 px-1 rounded border border-gray-800">3</span>
          </button>
          <button className="skill-btn border-primary shadow-[0_0_15px_rgba(127,19,236,0.4)] -translate-y-1">
            <User className="w-5 h-5 text-primary" />
            <span className="absolute -bottom-2 bg-black text-[10px] text-primary px-1 rounded border border-primary/50">4</span>
            <div className="absolute inset-0 bg-primary/10 rounded-lg" />
          </button>
        </div>
      </div>
    </div>
  );
}
