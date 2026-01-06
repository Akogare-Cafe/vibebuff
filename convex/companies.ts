import { v } from "convex/values";
import { query, mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
}

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    industry: v.optional(v.string()),
    size: v.optional(v.union(
      v.literal("1-10"),
      v.literal("11-50"),
      v.literal("51-200"),
      v.literal("201-500"),
      v.literal("501-1000"),
      v.literal("1000+")
    )),
    location: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const baseSlug = generateSlug(args.name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await ctx.db
        .query("companies")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const companyId = await ctx.db.insert("companies", {
      name: args.name,
      slug,
      description: args.description,
      websiteUrl: args.websiteUrl,
      industry: args.industry,
      size: args.size,
      location: args.location,
      ownerId: args.userId,
      memberCount: 1,
      isVerified: false,
      techStackPublic: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("companyMembers", {
      companyId,
      userId: args.userId,
      role: "owner",
      joinedAt: Date.now(),
    });

    return { companyId, slug };
  },
});

export const update = mutation({
  args: {
    companyId: v.id("companies"),
    userId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    industry: v.optional(v.string()),
    size: v.optional(v.union(
      v.literal("1-10"),
      v.literal("11-50"),
      v.literal("51-200"),
      v.literal("201-500"),
      v.literal("501-1000"),
      v.literal("1000+")
    )),
    location: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    techStackPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) throw new Error("Company not found");

    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_company_user", (q) =>
        q.eq("companyId", args.companyId).eq("userId", args.userId)
      )
      .first();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Not authorized to update company");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.websiteUrl !== undefined) updates.websiteUrl = args.websiteUrl;
    if (args.industry !== undefined) updates.industry = args.industry;
    if (args.size !== undefined) updates.size = args.size;
    if (args.location !== undefined) updates.location = args.location;
    if (args.logoUrl !== undefined) updates.logoUrl = args.logoUrl;
    if (args.bannerUrl !== undefined) updates.bannerUrl = args.bannerUrl;
    if (args.techStackPublic !== undefined) updates.techStackPublic = args.techStackPublic;

    await ctx.db.patch(args.companyId, updates);

    return { success: true };
  },
});

export const deleteCompany = mutation({
  args: {
    companyId: v.id("companies"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) throw new Error("Company not found");

    if (company.ownerId !== args.userId) {
      throw new Error("Only the owner can delete the company");
    }

    const members = await ctx.db
      .query("companyMembers")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    const invites = await ctx.db
      .query("companyInvites")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    for (const invite of invites) {
      await ctx.db.delete(invite._id);
    }

    const techStack = await ctx.db
      .query("companyTechStack")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    for (const tool of techStack) {
      await ctx.db.delete(tool._id);
    }

    const sharedDecks = await ctx.db
      .query("companySharedDecks")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    for (const deck of sharedDecks) {
      await ctx.db.delete(deck._id);
    }

    await ctx.db.delete(args.companyId);

    return { success: true };
  },
});

export const inviteMember = mutation({
  args: {
    companyId: v.id("companies"),
    inviterId: v.string(),
    inviteeId: v.optional(v.string()),
    inviteeEmail: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("member")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.inviteeId && !args.inviteeEmail) {
      throw new Error("Must provide either inviteeId or inviteeEmail");
    }

    const company = await ctx.db.get(args.companyId);
    if (!company) throw new Error("Company not found");

    const inviterMembership = await ctx.db
      .query("companyMembers")
      .withIndex("by_company_user", (q) =>
        q.eq("companyId", args.companyId).eq("userId", args.inviterId)
      )
      .first();

    if (!inviterMembership || !["owner", "admin"].includes(inviterMembership.role)) {
      throw new Error("Not authorized to invite members");
    }

    if (args.inviteeId) {
      const inviteeId = args.inviteeId;
      const existingMembership = await ctx.db
        .query("companyMembers")
        .withIndex("by_company_user", (q) =>
          q.eq("companyId", args.companyId).eq("userId", inviteeId)
        )
        .first();

      if (existingMembership) {
        throw new Error("User is already a member");
      }
    }

    await ctx.db.insert("companyInvites", {
      companyId: args.companyId,
      inviterId: args.inviterId,
      inviteeId: args.inviteeId,
      inviteeEmail: args.inviteeEmail,
      status: "pending",
      role: args.role,
      message: args.message,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    if (args.inviteeId) {
      await ctx.db.insert("notifications", {
        userId: args.inviteeId,
        type: "company_invite",
        title: "Company Invitation",
        message: `You've been invited to join "${company.name}"`,
        metadata: { link: `/companies/${company.slug}` },
        icon: "Building2",
        isRead: false,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const respondToInvite = mutation({
  args: {
    companyId: v.id("companies"),
    userId: v.string(),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("companyInvites")
      .withIndex("by_invitee", (q) => q.eq("inviteeId", args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("companyId"), args.companyId),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    if (!invite) {
      throw new Error("No pending invite found");
    }

    if (invite.expiresAt < Date.now()) {
      await ctx.db.patch(invite._id, { status: "expired" });
      throw new Error("Invite has expired");
    }

    if (args.accept) {
      await ctx.db.patch(invite._id, { status: "accepted" });

      const company = await ctx.db.get(args.companyId);
      if (!company) throw new Error("Company not found");

      await ctx.db.insert("companyMembers", {
        companyId: args.companyId,
        userId: args.userId,
        role: invite.role,
        joinedAt: Date.now(),
        invitedBy: invite.inviterId,
      });

      await ctx.db.patch(args.companyId, {
        memberCount: company.memberCount + 1,
        updatedAt: Date.now(),
      });

      await ctx.db.insert("notifications", {
        userId: company.ownerId,
        type: "company_joined",
        title: "New Team Member",
        message: `Someone joined your company "${company.name}"`,
        metadata: { link: `/companies/${company.slug}` },
        icon: "UserPlus",
        isRead: false,
        createdAt: Date.now(),
      });
    } else {
      await ctx.db.patch(invite._id, { status: "declined" });
    }

    return { success: true };
  },
});

export const removeMember = mutation({
  args: {
    companyId: v.id("companies"),
    adminId: v.string(),
    memberId: v.string(),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) throw new Error("Company not found");

    const adminMembership = await ctx.db
      .query("companyMembers")
      .withIndex("by_company_user", (q) =>
        q.eq("companyId", args.companyId).eq("userId", args.adminId)
      )
      .first();

    if (!adminMembership || !["owner", "admin"].includes(adminMembership.role)) {
      throw new Error("Not authorized to remove members");
    }

    const targetMembership = await ctx.db
      .query("companyMembers")
      .withIndex("by_company_user", (q) =>
        q.eq("companyId", args.companyId).eq("userId", args.memberId)
      )
      .first();

    if (!targetMembership) {
      throw new Error("User is not a member");
    }

    if (targetMembership.role === "owner") {
      throw new Error("Cannot remove the owner");
    }

    if (targetMembership.role === "admin" && adminMembership.role !== "owner") {
      throw new Error("Only owner can remove admins");
    }

    await ctx.db.delete(targetMembership._id);

    await ctx.db.patch(args.companyId, {
      memberCount: Math.max(0, company.memberCount - 1),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const leave = mutation({
  args: {
    companyId: v.id("companies"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) throw new Error("Company not found");

    if (company.ownerId === args.userId) {
      throw new Error("Owner cannot leave. Transfer ownership or delete the company.");
    }

    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_company_user", (q) =>
        q.eq("companyId", args.companyId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this company");
    }

    await ctx.db.delete(membership._id);

    await ctx.db.patch(args.companyId, {
      memberCount: Math.max(0, company.memberCount - 1),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const addToolToStack = mutation({
  args: {
    companyId: v.id("companies"),
    toolId: v.id("tools"),
    category: v.string(),
    userId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_company_user", (q) =>
        q.eq("companyId", args.companyId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this company");
    }

    const existing = await ctx.db
      .query("companyTechStack")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .filter((q) => q.eq(q.field("toolId"), args.toolId))
      .first();

    if (existing) {
      throw new Error("Tool already in company stack");
    }

    await ctx.db.insert("companyTechStack", {
      companyId: args.companyId,
      toolId: args.toolId,
      category: args.category,
      addedBy: args.userId,
      addedAt: Date.now(),
      notes: args.notes,
    });

    return { success: true };
  },
});

export const removeToolFromStack = mutation({
  args: {
    companyId: v.id("companies"),
    toolId: v.id("tools"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_company_user", (q) =>
        q.eq("companyId", args.companyId).eq("userId", args.userId)
      )
      .first();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Not authorized to remove tools from stack");
    }

    const stackEntry = await ctx.db
      .query("companyTechStack")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .filter((q) => q.eq(q.field("toolId"), args.toolId))
      .first();

    if (!stackEntry) {
      throw new Error("Tool not in company stack");
    }

    await ctx.db.delete(stackEntry._id);

    return { success: true };
  },
});

export const shareDeck = mutation({
  args: {
    companyId: v.id("companies"),
    deckId: v.id("userDecks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("companyMembers")
      .withIndex("by_company_user", (q) =>
        q.eq("companyId", args.companyId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this company");
    }

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== args.userId) {
      throw new Error("Deck not found or not owned by user");
    }

    const existing = await ctx.db
      .query("companySharedDecks")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .filter((q) => q.eq(q.field("companyId"), args.companyId))
      .first();

    if (existing) {
      throw new Error("Deck already shared in this company");
    }

    await ctx.db.insert("companySharedDecks", {
      companyId: args.companyId,
      deckId: args.deckId,
      sharedBy: args.userId,
      sharedAt: Date.now(),
      isPinned: false,
    });

    return { success: true };
  },
});

export const getById = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) return null;

    const owner = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", company.ownerId))
      .first();

    return {
      ...company,
      owner: owner
        ? {
            clerkId: owner.clerkId,
            username: owner.username,
            avatarUrl: owner.avatarUrl,
          }
        : null,
    };
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!company) return null;

    const owner = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", company.ownerId))
      .first();

    return {
      ...company,
      owner: owner
        ? {
            clerkId: owner.clerkId,
            username: owner.username,
            avatarUrl: owner.avatarUrl,
          }
        : null,
    };
  },
});

export const getMembers = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("companyMembers")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const membersWithProfiles = await Promise.all(
      members.map(async (member) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", member.userId))
          .first();

        return {
          userId: member.userId,
          role: member.role,
          title: member.title,
          joinedAt: member.joinedAt,
          username: profile?.username,
          avatarUrl: profile?.avatarUrl,
          level: profile?.level || 1,
          userTitle: profile?.title,
        };
      })
    );

    return membersWithProfiles.sort((a, b) => {
      const roleOrder = { owner: 0, admin: 1, member: 2 };
      return roleOrder[a.role] - roleOrder[b.role];
    });
  },
});

export const getTechStack = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db.get(args.companyId);
    if (!company) return null;

    const stackEntries = await ctx.db
      .query("companyTechStack")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const stackWithTools = await Promise.all(
      stackEntries.map(async (entry) => {
        const tool = await ctx.db.get(entry.toolId);
        const addedBy = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", entry.addedBy))
          .first();

        return {
          ...entry,
          tool: tool
            ? {
                _id: tool._id,
                name: tool.name,
                slug: tool.slug,
                tagline: tool.tagline,
                logoUrl: tool.logoUrl,
              }
            : null,
          addedByUser: addedBy
            ? {
                clerkId: addedBy.clerkId,
                username: addedBy.username,
              }
            : null,
        };
      })
    );

    const grouped = stackWithTools.reduce((acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = [];
      }
      acc[entry.category].push(entry);
      return acc;
    }, {} as Record<string, typeof stackWithTools>);

    return grouped;
  },
});

export const getSharedDecks = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const sharedDecks = await ctx.db
      .query("companySharedDecks")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .collect();

    const decksWithDetails = await Promise.all(
      sharedDecks.map(async (shared) => {
        const deck = await ctx.db.get(shared.deckId);
        const sharer = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", shared.sharedBy))
          .first();

        if (!deck) return null;

        return {
          ...shared,
          deck: {
            _id: deck._id,
            name: deck.name,
            description: deck.description,
            toolIds: deck.toolIds,
          },
          sharer: sharer
            ? {
                clerkId: sharer.clerkId,
                username: sharer.username,
                avatarUrl: sharer.avatarUrl,
              }
            : null,
        };
      })
    );

    return decksWithDetails.filter(Boolean);
  },
});

export const getUserCompanies = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("companyMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const companies = await Promise.all(
      memberships.map(async (membership) => {
        const company = await ctx.db.get(membership.companyId);
        if (!company) return null;

        return {
          ...company,
          role: membership.role,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return companies.filter(Boolean);
  },
});

export const getPendingInvites = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const invites = await ctx.db
      .query("companyInvites")
      .withIndex("by_invitee", (q) => q.eq("inviteeId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const invitesWithDetails = await Promise.all(
      invites.map(async (invite) => {
        const company = await ctx.db.get(invite.companyId);
        const inviter = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", invite.inviterId))
          .first();

        if (!company) return null;

        return {
          ...invite,
          company: {
            _id: company._id,
            name: company.name,
            slug: company.slug,
            memberCount: company.memberCount,
            logoUrl: company.logoUrl,
            industry: company.industry,
          },
          inviter: inviter
            ? {
                clerkId: inviter.clerkId,
                username: inviter.username,
                avatarUrl: inviter.avatarUrl,
              }
            : null,
        };
      })
    );

    return invitesWithDetails.filter(Boolean);
  },
});

export const search = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const searchQuery = args.query.toLowerCase();

    const companies = await ctx.db
      .query("companies")
      .filter((q) => q.eq(q.field("techStackPublic"), true))
      .collect();

    const matchingCompanies = companies
      .filter((company) => {
        const name = company.name.toLowerCase();
        const description = company.description?.toLowerCase() || "";
        const industry = company.industry?.toLowerCase() || "";
        return (
          name.includes(searchQuery) ||
          description.includes(searchQuery) ||
          industry.includes(searchQuery)
        );
      })
      .slice(0, limit);

    return matchingCompanies;
  },
});

export const getToolsForMatching = internalQuery({
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return tools.map((tool) => ({
      id: tool._id,
      name: tool.name,
      slug: tool.slug,
      tags: tool.tags,
    }));
  },
});

export const createAiTechStackRecord = internalMutation({
  args: {
    companyId: v.id("companies"),
    scrapedBy: v.string(),
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("companyAiTechStack")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "scraping",
        scrapedAt: Date.now(),
        sourceUrl: args.sourceUrl,
        error: undefined,
      });
      return existing._id;
    }

    return await ctx.db.insert("companyAiTechStack", {
      companyId: args.companyId,
      scrapedAt: Date.now(),
      status: "scraping",
      sourceUrl: args.sourceUrl,
      aiTools: [],
      scrapedBy: args.scrapedBy,
    });
  },
});

export const updateAiTechStackResult = internalMutation({
  args: {
    recordId: v.id("companyAiTechStack"),
    status: v.union(
      v.literal("completed"),
      v.literal("failed")
    ),
    aiTools: v.optional(v.array(v.object({
      name: v.string(),
      category: v.string(),
      confidence: v.number(),
      description: v.optional(v.string()),
      matchedToolId: v.optional(v.id("tools")),
    }))),
    rawData: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.recordId, {
      status: args.status,
      aiTools: args.aiTools || [],
      rawData: args.rawData,
      error: args.error,
    });
  },
});

export const scrapeAiTechStack = action({
  args: {
    companyId: v.id("companies"),
    userId: v.string(),
    websiteUrl: v.optional(v.string()),
    companyName: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    message: string;
    aiTools?: Array<{
      name: string;
      category: string;
      confidence: number;
      description?: string;
    }>;
  }> => {
    const recordId = await ctx.runMutation(internal.companies.createAiTechStackRecord, {
      companyId: args.companyId,
      scrapedBy: args.userId,
      sourceUrl: args.websiteUrl,
    });

    const tools = await ctx.runQuery(internal.companies.getToolsForMatching);

    const aiGatewayKey = process.env.VERCEL_AI_GATEWAY_API_KEY;

    if (!aiGatewayKey) {
      await ctx.runMutation(internal.companies.updateAiTechStackResult, {
        recordId,
        status: "failed",
        error: "AI Gateway not configured",
      });
      return {
        success: false,
        message: "AI Gateway not configured. Please set VERCEL_AI_GATEWAY_API_KEY.",
      };
    }

    const prompt = `You are a tech stack researcher. Research and identify the AI/ML technology stack used by the company "${args.companyName}"${args.websiteUrl ? ` (website: ${args.websiteUrl})` : ""}.

Based on your knowledge, identify what AI tools, frameworks, and services this company likely uses or has publicly mentioned using.

Focus on:
1. LLM providers (OpenAI, Anthropic, Google AI, etc.)
2. ML frameworks (TensorFlow, PyTorch, etc.)
3. Vector databases (Pinecone, Weaviate, etc.)
4. AI development platforms (Hugging Face, Replicate, etc.)
5. AI coding assistants (GitHub Copilot, Cursor, etc.)
6. AI infrastructure (AWS SageMaker, Google Vertex AI, etc.)
7. AI APIs and services (Stability AI, ElevenLabs, etc.)

AVAILABLE TOOLS IN OUR DATABASE (try to match to these when possible):
${JSON.stringify(tools.slice(0, 100).map(t => ({ name: t.name, slug: t.slug })), null, 2)}

Respond in this exact JSON format:
{
  "aiTools": [
    {
      "name": "Tool Name",
      "category": "LLM Provider|ML Framework|Vector Database|AI Platform|AI Assistant|AI Infrastructure|AI API",
      "confidence": 85,
      "description": "Brief description of how they use it",
      "matchedSlug": "tool-slug-if-matched"
    }
  ],
  "reasoning": "Brief explanation of how you determined this stack"
}

If you cannot find any information about their AI stack, return an empty aiTools array with a reasoning explaining why.
Only include tools you have reasonable confidence they actually use (confidence > 50).`;

    try {
      const response = await fetch("https://gateway.ai.vercel.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${aiGatewayKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful tech stack researcher. Always respond with valid JSON. Base your answers on publicly available information about companies.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        await ctx.runMutation(internal.companies.updateAiTechStackResult, {
          recordId,
          status: "failed",
          error: `API error: ${response.status} - ${errorText}`,
        });
        return {
          success: false,
          message: `Failed to scrape: API error ${response.status}`,
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        await ctx.runMutation(internal.companies.updateAiTechStackResult, {
          recordId,
          status: "failed",
          error: "No content in AI response",
        });
        return {
          success: false,
          message: "Failed to get AI response",
        };
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        await ctx.runMutation(internal.companies.updateAiTechStackResult, {
          recordId,
          status: "failed",
          error: "Could not parse AI response as JSON",
          rawData: content,
        });
        return {
          success: false,
          message: "Failed to parse AI response",
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const aiTools = (parsed.aiTools || []).map((tool: {
        name: string;
        category: string;
        confidence: number;
        description?: string;
        matchedSlug?: string;
      }) => {
        const matchedTool = tool.matchedSlug
          ? tools.find((t) => t.slug === tool.matchedSlug)
          : tools.find((t) => t.name.toLowerCase() === tool.name.toLowerCase());

        return {
          name: tool.name,
          category: tool.category,
          confidence: tool.confidence,
          description: tool.description,
          matchedToolId: matchedTool?.id,
        };
      });

      await ctx.runMutation(internal.companies.updateAiTechStackResult, {
        recordId,
        status: "completed",
        aiTools,
        rawData: parsed.reasoning,
      });

      return {
        success: true,
        message: `Found ${aiTools.length} AI tools in tech stack`,
        aiTools,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await ctx.runMutation(internal.companies.updateAiTechStackResult, {
        recordId,
        status: "failed",
        error: errorMessage,
      });
      return {
        success: false,
        message: `Scraping failed: ${errorMessage}`,
      };
    }
  },
});

export const getAiTechStack = query({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("companyAiTechStack")
      .withIndex("by_company", (q) => q.eq("companyId", args.companyId))
      .first();

    if (!record) return null;

    const toolsWithDetails = await Promise.all(
      record.aiTools.map(async (aiTool) => {
        let matchedTool = null;
        if (aiTool.matchedToolId) {
          const tool = await ctx.db.get(aiTool.matchedToolId);
          if (tool) {
            matchedTool = {
              _id: tool._id,
              name: tool.name,
              slug: tool.slug,
              logoUrl: tool.logoUrl,
              tagline: tool.tagline,
            };
          }
        }
        return {
          ...aiTool,
          matchedTool,
        };
      })
    );

    return {
      ...record,
      aiTools: toolsWithDetails,
    };
  },
});

export const listAll = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    const companies = await ctx.db
      .query("companies")
      .filter((q) => q.eq(q.field("techStackPublic"), true))
      .order("desc")
      .take(limit);

    const companiesWithAiStack = await Promise.all(
      companies.map(async (company) => {
        const aiStack = await ctx.db
          .query("companyAiTechStack")
          .withIndex("by_company", (q) => q.eq("companyId", company._id))
          .first();

        return {
          ...company,
          hasAiStack: !!aiStack && aiStack.status === "completed",
          aiToolCount: aiStack?.aiTools?.length || 0,
        };
      })
    );

    return companiesWithAiStack;
  },
});
