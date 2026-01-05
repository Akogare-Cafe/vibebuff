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
    groupType: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("invite_only")
    ),
    tags: v.array(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const baseSlug = generateSlug(args.name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await ctx.db
        .query("groups")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      slug,
      description: args.description,
      groupType: args.groupType,
      ownerId: args.userId,
      memberCount: 1,
      tags: args.tags,
      isVerified: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("groupMembers", {
      groupId,
      userId: args.userId,
      role: "owner",
      joinedAt: Date.now(),
    });

    return { groupId, slug };
  },
});

export const update = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    groupType: v.optional(
      v.union(
        v.literal("public"),
        v.literal("private"),
        v.literal("invite_only")
      )
    ),
    tags: v.optional(v.array(v.string())),
    avatarUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      throw new Error("Not authorized to update group");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.groupType !== undefined) updates.groupType = args.groupType;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;
    if (args.bannerUrl !== undefined) updates.bannerUrl = args.bannerUrl;

    await ctx.db.patch(args.groupId, updates);

    return { success: true };
  },
});

export const deleteGroup = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    if (group.ownerId !== args.userId) {
      throw new Error("Only the owner can delete the group");
    }

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    const invites = await ctx.db
      .query("groupInvites")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const invite of invites) {
      await ctx.db.delete(invite._id);
    }

    const sharedDecks = await ctx.db
      .query("groupSharedDecks")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const deck of sharedDecks) {
      await ctx.db.delete(deck._id);
    }

    const sharedStacks = await ctx.db
      .query("groupSharedStacks")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const stack of sharedStacks) {
      await ctx.db.delete(stack._id);
    }

    await ctx.db.delete(args.groupId);

    return { success: true };
  },
});

export const join = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    if (group.groupType !== "public") {
      throw new Error("Cannot join non-public group directly");
    }

    const existingMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (existingMembership) {
      throw new Error("Already a member of this group");
    }

    await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId: args.userId,
      role: "member",
      joinedAt: Date.now(),
    });

    await ctx.db.patch(args.groupId, {
      memberCount: group.memberCount + 1,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: group.ownerId,
      type: "group_joined",
      title: "New Group Member",
      message: `Someone joined your group "${group.name}"`,
      metadata: { link: `/groups/${group.slug}` },
      icon: "UserPlus",
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const leave = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    if (group.ownerId === args.userId) {
      throw new Error("Owner cannot leave the group. Transfer ownership or delete the group.");
    }

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this group");
    }

    await ctx.db.delete(membership._id);

    await ctx.db.patch(args.groupId, {
      memberCount: Math.max(0, group.memberCount - 1),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const inviteMember = mutation({
  args: {
    groupId: v.id("groups"),
    inviterId: v.string(),
    inviteeId: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    const inviterMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.inviterId)
      )
      .first();

    if (!inviterMembership || !["owner", "admin", "moderator"].includes(inviterMembership.role)) {
      throw new Error("Not authorized to invite members");
    }

    const existingMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.inviteeId)
      )
      .first();

    if (existingMembership) {
      throw new Error("User is already a member");
    }

    const existingInvite = await ctx.db
      .query("groupInvites")
      .withIndex("by_invitee", (q) => q.eq("inviteeId", args.inviteeId))
      .filter((q) =>
        q.and(
          q.eq(q.field("groupId"), args.groupId),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    if (existingInvite) {
      throw new Error("Invite already pending");
    }

    await ctx.db.insert("groupInvites", {
      groupId: args.groupId,
      inviterId: args.inviterId,
      inviteeId: args.inviteeId,
      status: "pending",
      message: args.message,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    await ctx.db.insert("notifications", {
      userId: args.inviteeId,
      type: "group_invite",
      title: "Group Invitation",
      message: `You've been invited to join "${group.name}"`,
      metadata: { link: `/groups/${group.slug}` },
      icon: "Users",
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const respondToInvite = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.string(),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("groupInvites")
      .withIndex("by_invitee", (q) => q.eq("inviteeId", args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("groupId"), args.groupId),
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

      const group = await ctx.db.get(args.groupId);
      if (!group) throw new Error("Group not found");

      await ctx.db.insert("groupMembers", {
        groupId: args.groupId,
        userId: args.userId,
        role: "member",
        joinedAt: Date.now(),
        invitedBy: invite.inviterId,
      });

      await ctx.db.patch(args.groupId, {
        memberCount: group.memberCount + 1,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(invite._id, { status: "declined" });
    }

    return { success: true };
  },
});

export const removeMember = mutation({
  args: {
    groupId: v.id("groups"),
    adminId: v.string(),
    memberId: v.string(),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    const adminMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.adminId)
      )
      .first();

    if (!adminMembership || !["owner", "admin"].includes(adminMembership.role)) {
      throw new Error("Not authorized to remove members");
    }

    const targetMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.memberId)
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

    await ctx.db.patch(args.groupId, {
      memberCount: Math.max(0, group.memberCount - 1),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateMemberRole = mutation({
  args: {
    groupId: v.id("groups"),
    adminId: v.string(),
    memberId: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("moderator"),
      v.literal("member")
    ),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    if (group.ownerId !== args.adminId) {
      throw new Error("Only owner can change roles");
    }

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.memberId)
      )
      .first();

    if (!membership) {
      throw new Error("User is not a member");
    }

    if (membership.role === "owner") {
      throw new Error("Cannot change owner role");
    }

    await ctx.db.patch(membership._id, { role: args.role });

    return { success: true };
  },
});

export const shareDeck = mutation({
  args: {
    groupId: v.id("groups"),
    deckId: v.id("userDecks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("Not a member of this group");
    }

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== args.userId) {
      throw new Error("Deck not found or not owned by user");
    }

    const existing = await ctx.db
      .query("groupSharedDecks")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .first();

    if (existing) {
      throw new Error("Deck already shared in this group");
    }

    await ctx.db.insert("groupSharedDecks", {
      groupId: args.groupId,
      deckId: args.deckId,
      sharedBy: args.userId,
      sharedAt: Date.now(),
      isPinned: false,
    });

    return { success: true };
  },
});

export const unshareDeck = mutation({
  args: {
    groupId: v.id("groups"),
    deckId: v.id("userDecks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const shared = await ctx.db
      .query("groupSharedDecks")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .first();

    if (!shared) {
      throw new Error("Deck not shared in this group");
    }

    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (shared.sharedBy !== args.userId && (!membership || !["owner", "admin"].includes(membership.role))) {
      throw new Error("Not authorized to unshare this deck");
    }

    await ctx.db.delete(shared._id);

    return { success: true };
  },
});

export const getById = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) return null;

    const owner = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", group.ownerId))
      .first();

    return {
      ...group,
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
    const group = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!group) return null;

    const owner = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", group.ownerId))
      .first();

    return {
      ...group,
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
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
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
          joinedAt: member.joinedAt,
          username: profile?.username,
          avatarUrl: profile?.avatarUrl,
          level: profile?.level || 1,
          title: profile?.title,
        };
      })
    );

    return membersWithProfiles.sort((a, b) => {
      const roleOrder = { owner: 0, admin: 1, moderator: 2, member: 3 };
      return roleOrder[a.role] - roleOrder[b.role];
    });
  },
});

export const getSharedDecks = query({
  args: {
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    const sharedDecks = await ctx.db
      .query("groupSharedDecks")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
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

export const getUserGroups = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group) return null;

        return {
          ...group,
          role: membership.role,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return groups.filter(Boolean);
  },
});

export const getPendingInvites = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const invites = await ctx.db
      .query("groupInvites")
      .withIndex("by_invitee", (q) => q.eq("inviteeId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const invitesWithDetails = await Promise.all(
      invites.map(async (invite) => {
        const group = await ctx.db.get(invite.groupId);
        const inviter = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", invite.inviterId))
          .first();

        if (!group) return null;

        return {
          ...invite,
          group: {
            _id: group._id,
            name: group.name,
            slug: group.slug,
            memberCount: group.memberCount,
            avatarUrl: group.avatarUrl,
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

    const publicGroups = await ctx.db
      .query("groups")
      .withIndex("by_type", (q) => q.eq("groupType", "public"))
      .collect();

    const matchingGroups = publicGroups
      .filter((group) => {
        const name = group.name.toLowerCase();
        const description = group.description?.toLowerCase() || "";
        const tags = group.tags.map((t) => t.toLowerCase());
        return (
          name.includes(searchQuery) ||
          description.includes(searchQuery) ||
          tags.some((t) => t.includes(searchQuery))
        );
      })
      .slice(0, limit);

    return matchingGroups;
  },
});

export const getPopular = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const groups = await ctx.db
      .query("groups")
      .withIndex("by_type", (q) => q.eq("groupType", "public"))
      .collect();

    return groups
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, limit);
  },
});
