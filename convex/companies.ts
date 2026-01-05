import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

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
