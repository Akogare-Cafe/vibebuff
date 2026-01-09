import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

const nodeValidator = v.object({
  id: v.string(),
  type: v.string(),
  position: v.object({ x: v.number(), y: v.number() }),
  data: v.object({
    label: v.string(),
    toolId: v.optional(v.id("tools")),
    category: v.string(),
    description: v.optional(v.string()),
  }),
});

const edgeValidator = v.object({
  id: v.string(),
  source: v.string(),
  target: v.string(),
  label: v.optional(v.string()),
  animated: v.optional(v.boolean()),
});

const CURSOR_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getRandomColor(existingColors: string[]): string {
  const available = CURSOR_COLORS.filter((c) => !existingColors.includes(c));
  if (available.length === 0) {
    return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

export const createSession = mutation({
  args: {
    name: v.string(),
    hostUserId: v.string(),
    hostName: v.string(),
    hostAvatarUrl: v.optional(v.string()),
    initialNodes: v.optional(v.array(nodeValidator)),
    initialEdges: v.optional(v.array(edgeValidator)),
  },
  handler: async (ctx, args) => {
    let shareCode = generateShareCode();
    let existing = await ctx.db
      .query("stackBuilderSessions")
      .withIndex("by_share_code", (q) => q.eq("shareCode", shareCode))
      .first();
    
    while (existing) {
      shareCode = generateShareCode();
      existing = await ctx.db
        .query("stackBuilderSessions")
        .withIndex("by_share_code", (q) => q.eq("shareCode", shareCode))
        .first();
    }

    const sessionId = await ctx.db.insert("stackBuilderSessions", {
      name: args.name,
      hostUserId: args.hostUserId,
      hostName: args.hostName,
      hostAvatarUrl: args.hostAvatarUrl,
      shareCode,
      nodes: args.initialNodes || [],
      edges: args.initialEdges || [],
      isActive: true,
      maxParticipants: 10,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("stackBuilderParticipants", {
      sessionId,
      userId: args.hostUserId,
      userName: args.hostName,
      userAvatarUrl: args.hostAvatarUrl,
      cursorColor: CURSOR_COLORS[0],
      isActive: true,
      lastSeen: Date.now(),
      joinedAt: Date.now(),
    });

    return { sessionId, shareCode };
  },
});

export const getSession = query({
  args: { sessionId: v.id("stackBuilderSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || !session.isActive) return null;
    return session;
  },
});

export const getSessionByShareCode = query({
  args: { shareCode: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("stackBuilderSessions")
      .withIndex("by_share_code", (q) => q.eq("shareCode", args.shareCode.toUpperCase()))
      .first();
    
    if (!session || !session.isActive) return null;
    return session;
  },
});

export const joinSession = mutation({
  args: {
    shareCode: v.string(),
    userId: v.string(),
    userName: v.string(),
    userAvatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("stackBuilderSessions")
      .withIndex("by_share_code", (q) => q.eq("shareCode", args.shareCode.toUpperCase()))
      .first();

    if (!session || !session.isActive) {
      throw new Error("Session not found or inactive");
    }

    const existingParticipant = await ctx.db
      .query("stackBuilderParticipants")
      .withIndex("by_session_user", (q) =>
        q.eq("sessionId", session._id).eq("userId", args.userId)
      )
      .first();

    if (existingParticipant) {
      await ctx.db.patch(existingParticipant._id, {
        isActive: true,
        lastSeen: Date.now(),
        userName: args.userName,
        userAvatarUrl: args.userAvatarUrl,
      });
      return { sessionId: session._id, participantId: existingParticipant._id };
    }

    const activeParticipants = await ctx.db
      .query("stackBuilderParticipants")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (activeParticipants.length >= session.maxParticipants) {
      throw new Error("Session is full");
    }

    const usedColors = activeParticipants.map((p) => p.cursorColor);
    const cursorColor = getRandomColor(usedColors);

    const participantId = await ctx.db.insert("stackBuilderParticipants", {
      sessionId: session._id,
      userId: args.userId,
      userName: args.userName,
      userAvatarUrl: args.userAvatarUrl,
      cursorColor,
      isActive: true,
      lastSeen: Date.now(),
      joinedAt: Date.now(),
    });

    return { sessionId: session._id, participantId };
  },
});

export const leaveSession = mutation({
  args: {
    sessionId: v.id("stackBuilderSessions"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("stackBuilderParticipants")
      .withIndex("by_session_user", (q) =>
        q.eq("sessionId", args.sessionId).eq("userId", args.userId)
      )
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        isActive: false,
        lastSeen: Date.now(),
      });
    }
  },
});

export const endSession = mutation({
  args: {
    sessionId: v.id("stackBuilderSessions"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.hostUserId !== args.userId) {
      throw new Error("Only the host can end the session");
    }

    await ctx.db.patch(args.sessionId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    const participants = await ctx.db
      .query("stackBuilderParticipants")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const participant of participants) {
      await ctx.db.patch(participant._id, {
        isActive: false,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getParticipants = query({
  args: { sessionId: v.id("stackBuilderSessions") },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("stackBuilderParticipants")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return participants;
  },
});

export const updateCursor = mutation({
  args: {
    sessionId: v.id("stackBuilderSessions"),
    userId: v.string(),
    position: v.object({ x: v.number(), y: v.number() }),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("stackBuilderParticipants")
      .withIndex("by_session_user", (q) =>
        q.eq("sessionId", args.sessionId).eq("userId", args.userId)
      )
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        cursorPosition: args.position,
        lastSeen: Date.now(),
      });
    }
  },
});

export const updateNodes = mutation({
  args: {
    sessionId: v.id("stackBuilderSessions"),
    nodes: v.array(nodeValidator),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || !session.isActive) {
      throw new Error("Session not found or inactive");
    }

    await ctx.db.patch(args.sessionId, {
      nodes: args.nodes,
      updatedAt: Date.now(),
    });
  },
});

export const updateEdges = mutation({
  args: {
    sessionId: v.id("stackBuilderSessions"),
    edges: v.array(edgeValidator),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || !session.isActive) {
      throw new Error("Session not found or inactive");
    }

    await ctx.db.patch(args.sessionId, {
      edges: args.edges,
      updatedAt: Date.now(),
    });
  },
});

export const updateSessionState = mutation({
  args: {
    sessionId: v.id("stackBuilderSessions"),
    nodes: v.array(nodeValidator),
    edges: v.array(edgeValidator),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || !session.isActive) {
      throw new Error("Session not found or inactive");
    }

    await ctx.db.patch(args.sessionId, {
      nodes: args.nodes,
      edges: args.edges,
      updatedAt: Date.now(),
    });
  },
});

export const updateAiScore = mutation({
  args: {
    sessionId: v.id("stackBuilderSessions"),
    aiScore: v.object({
      overall: v.number(),
      completeness: v.number(),
      coherence: v.number(),
      scalability: v.number(),
      costEfficiency: v.number(),
      feedback: v.array(v.string()),
      lastUpdated: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || !session.isActive) {
      throw new Error("Session not found or inactive");
    }

    await ctx.db.patch(args.sessionId, {
      aiScore: args.aiScore,
      updatedAt: Date.now(),
    });
  },
});

export const getUserSessions = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("stackBuilderSessions")
      .withIndex("by_host", (q) => q.eq("hostUserId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const heartbeat = mutation({
  args: {
    sessionId: v.id("stackBuilderSessions"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const participant = await ctx.db
      .query("stackBuilderParticipants")
      .withIndex("by_session_user", (q) =>
        q.eq("sessionId", args.sessionId).eq("userId", args.userId)
      )
      .first();

    if (participant) {
      await ctx.db.patch(participant._id, {
        lastSeen: Date.now(),
        isActive: true,
      });
    }
  },
});

export const cleanupInactiveParticipants = mutation({
  args: { sessionId: v.id("stackBuilderSessions") },
  handler: async (ctx, args) => {
    const INACTIVE_THRESHOLD = 30000;
    const now = Date.now();

    const participants = await ctx.db
      .query("stackBuilderParticipants")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const participant of participants) {
      if (now - participant.lastSeen > INACTIVE_THRESHOLD) {
        await ctx.db.patch(participant._id, {
          isActive: false,
        });
      }
    }
  },
});

export const calculateStackScore = action({
  args: {
    sessionId: v.id("stackBuilderSessions"),
  },
  handler: async (ctx, args): Promise<{
    overall: number;
    completeness: number;
    coherence: number;
    scalability: number;
    costEfficiency: number;
    feedback: string[];
  }> => {
    const session = await ctx.runQuery(api.stackBuilderCollab.getSession, {
      sessionId: args.sessionId,
    });

    if (!session) {
      throw new Error("Session not found");
    }

    const nodes = session.nodes;
    const edges = session.edges;
    const feedback: string[] = [];

    let completeness = 0;
    let coherence = 0;
    let scalability = 0;
    let costEfficiency = 0;

    const categories = new Set(nodes.map((n) => n.data.category));
    const essentialCategories = ["frontend", "backend", "database"];
    const hasEssentials = essentialCategories.filter((c) => categories.has(c));
    completeness = Math.min(100, (hasEssentials.length / 3) * 60 + nodes.length * 5);

    if (!categories.has("frontend")) {
      feedback.push("Consider adding a frontend framework");
    }
    if (!categories.has("backend")) {
      feedback.push("Consider adding a backend solution");
    }
    if (!categories.has("database")) {
      feedback.push("Consider adding a database");
    }
    if (!categories.has("deployment")) {
      feedback.push("Add a deployment platform for production");
    }

    const connectionRatio = nodes.length > 1 ? edges.length / (nodes.length - 1) : 0;
    coherence = Math.min(100, connectionRatio * 50 + (edges.length > 0 ? 30 : 0));

    if (edges.length === 0 && nodes.length > 1) {
      feedback.push("Connect your tools to show data flow");
    }

    const hasScalableDb = nodes.some((n) =>
      ["database", "backend"].includes(n.data.category) &&
      ["Supabase", "Firebase", "MongoDB", "PostgreSQL", "Convex", "PlanetScale"].some((db) =>
        n.data.label.toLowerCase().includes(db.toLowerCase())
      )
    );
    const hasCloudDeployment = nodes.some((n) =>
      n.data.category === "deployment" &&
      ["Vercel", "AWS", "GCP", "Azure", "Railway", "Fly.io", "Render"].some((cloud) =>
        n.data.label.toLowerCase().includes(cloud.toLowerCase())
      )
    );
    scalability = (hasScalableDb ? 50 : 20) + (hasCloudDeployment ? 50 : 20);

    if (!hasScalableDb) {
      feedback.push("Consider a scalable database solution");
    }
    if (!hasCloudDeployment) {
      feedback.push("Add cloud deployment for scalability");
    }

    const openSourceCount = nodes.filter((n) =>
      ["React", "Next.js", "Vue", "Svelte", "Node.js", "Express", "PostgreSQL", "MongoDB"].some((os) =>
        n.data.label.toLowerCase().includes(os.toLowerCase())
      )
    ).length;
    costEfficiency = Math.min(100, 40 + (openSourceCount / Math.max(1, nodes.length)) * 60);

    if (nodes.length > 8) {
      feedback.push("Consider simplifying - fewer tools can mean lower costs");
    }

    const overall = Math.round(
      completeness * 0.3 + coherence * 0.25 + scalability * 0.25 + costEfficiency * 0.2
    );

    if (overall >= 80) {
      feedback.unshift("Excellent stack architecture!");
    } else if (overall >= 60) {
      feedback.unshift("Good foundation, some improvements possible");
    } else if (overall >= 40) {
      feedback.unshift("Stack needs more components");
    } else {
      feedback.unshift("Add more tools to build a complete stack");
    }

    const score = {
      overall: Math.round(overall),
      completeness: Math.round(completeness),
      coherence: Math.round(coherence),
      scalability: Math.round(scalability),
      costEfficiency: Math.round(costEfficiency),
      feedback: feedback.slice(0, 5),
    };

    await ctx.runMutation(api.stackBuilderCollab.updateAiScore, {
      sessionId: args.sessionId,
      aiScore: {
        ...score,
        lastUpdated: Date.now(),
      },
    });

    return score;
  },
});
