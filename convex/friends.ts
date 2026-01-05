import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const searchUsers = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const searchQuery = args.query.toLowerCase();

    const allProfiles = await ctx.db.query("userProfiles").collect();

    const matchingProfiles = allProfiles
      .filter((profile) => {
        const username = profile.username?.toLowerCase() || "";
        return username.includes(searchQuery);
      })
      .slice(0, limit);

    return matchingProfiles.map((profile) => ({
      clerkId: profile.clerkId,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      level: profile.level,
      title: profile.title,
      xp: profile.xp,
    }));
  },
});

export const sendFriendRequest = mutation({
  args: {
    userId: v.string(),
    friendId: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.userId === args.friendId) {
      throw new Error("Cannot send friend request to yourself");
    }

    const existingRequest = await ctx.db
      .query("friendships")
      .withIndex("by_user_friend", (q) =>
        q.eq("userId", args.userId).eq("friendId", args.friendId)
      )
      .first();

    if (existingRequest) {
      throw new Error("Friend request already exists");
    }

    const reverseRequest = await ctx.db
      .query("friendships")
      .withIndex("by_user_friend", (q) =>
        q.eq("userId", args.friendId).eq("friendId", args.userId)
      )
      .first();

    if (reverseRequest) {
      if (reverseRequest.status === "pending") {
        await ctx.db.patch(reverseRequest._id, {
          status: "accepted",
          acceptedAt: Date.now(),
        });
        
        await ctx.db.insert("friendships", {
          userId: args.userId,
          friendId: args.friendId,
          status: "accepted",
          initiatedBy: args.friendId,
          createdAt: reverseRequest.createdAt,
          acceptedAt: Date.now(),
        });

        await ctx.db.insert("notifications", {
          userId: args.friendId,
          type: "friend_accepted",
          title: "Friend Request Accepted",
          message: "Your friend request was accepted!",
          metadata: { link: `/users/${args.userId}` },
          icon: "UserCheck",
          isRead: false,
          createdAt: Date.now(),
        });

        return { status: "accepted" };
      }
      throw new Error("Friendship already exists");
    }

    await ctx.db.insert("friendships", {
      userId: args.userId,
      friendId: args.friendId,
      status: "pending",
      initiatedBy: args.userId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: args.friendId,
      type: "friend_request",
      title: "New Friend Request",
      message: "You have a new friend request!",
      metadata: { link: `/users/${args.userId}` },
      icon: "UserPlus",
      isRead: false,
      createdAt: Date.now(),
    });

    return { status: "pending" };
  },
});

export const acceptFriendRequest = mutation({
  args: {
    userId: v.string(),
    friendId: v.string(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("friendships")
      .withIndex("by_user_friend", (q) =>
        q.eq("userId", args.friendId).eq("friendId", args.userId)
      )
      .first();

    if (!request || request.status !== "pending") {
      throw new Error("No pending friend request found");
    }

    await ctx.db.patch(request._id, {
      status: "accepted",
      acceptedAt: Date.now(),
    });

    await ctx.db.insert("friendships", {
      userId: args.userId,
      friendId: args.friendId,
      status: "accepted",
      initiatedBy: args.friendId,
      createdAt: request.createdAt,
      acceptedAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId: args.friendId,
      type: "friend_accepted",
      title: "Friend Request Accepted",
      message: "Your friend request was accepted!",
      metadata: { link: `/users/${args.userId}` },
      icon: "UserCheck",
      isRead: false,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

export const declineFriendRequest = mutation({
  args: {
    userId: v.string(),
    friendId: v.string(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("friendships")
      .withIndex("by_user_friend", (q) =>
        q.eq("userId", args.friendId).eq("friendId", args.userId)
      )
      .first();

    if (!request || request.status !== "pending") {
      throw new Error("No pending friend request found");
    }

    await ctx.db.delete(request._id);

    return { success: true };
  },
});

export const removeFriend = mutation({
  args: {
    userId: v.string(),
    friendId: v.string(),
  },
  handler: async (ctx, args) => {
    const friendship1 = await ctx.db
      .query("friendships")
      .withIndex("by_user_friend", (q) =>
        q.eq("userId", args.userId).eq("friendId", args.friendId)
      )
      .first();

    const friendship2 = await ctx.db
      .query("friendships")
      .withIndex("by_user_friend", (q) =>
        q.eq("userId", args.friendId).eq("friendId", args.userId)
      )
      .first();

    if (friendship1) {
      await ctx.db.delete(friendship1._id);
    }
    if (friendship2) {
      await ctx.db.delete(friendship2._id);
    }

    return { success: true };
  },
});

export const blockUser = mutation({
  args: {
    userId: v.string(),
    blockedUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user_friend", (q) =>
        q.eq("userId", args.userId).eq("friendId", args.blockedUserId)
      )
      .first();

    if (existingFriendship) {
      await ctx.db.patch(existingFriendship._id, { status: "blocked" });
    } else {
      await ctx.db.insert("friendships", {
        userId: args.userId,
        friendId: args.blockedUserId,
        status: "blocked",
        initiatedBy: args.userId,
        createdAt: Date.now(),
      });
    }

    const reverseFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user_friend", (q) =>
        q.eq("userId", args.blockedUserId).eq("friendId", args.userId)
      )
      .first();

    if (reverseFriendship) {
      await ctx.db.delete(reverseFriendship._id);
    }

    return { success: true };
  },
});

export const unblockUser = mutation({
  args: {
    userId: v.string(),
    blockedUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const block = await ctx.db
      .query("friendships")
      .withIndex("by_user_friend", (q) =>
        q.eq("userId", args.userId).eq("friendId", args.blockedUserId)
      )
      .first();

    if (block && block.status === "blocked") {
      await ctx.db.delete(block._id);
    }

    return { success: true };
  },
});

export const getFriends = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const friendships = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    const friends = await Promise.all(
      friendships.map(async (friendship) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", friendship.friendId))
          .first();

        return {
          clerkId: friendship.friendId,
          username: profile?.username,
          avatarUrl: profile?.avatarUrl,
          level: profile?.level || 1,
          title: profile?.title,
          xp: profile?.xp || 0,
          friendSince: friendship.acceptedAt,
        };
      })
    );

    return friends.filter((f) => f.username);
  },
});

export const getPendingRequests = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const incoming = await ctx.db
      .query("friendships")
      .withIndex("by_friend", (q) => q.eq("friendId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const outgoing = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const incomingWithProfiles = await Promise.all(
      incoming.map(async (request) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", request.userId))
          .first();

        return {
          clerkId: request.userId,
          username: profile?.username,
          avatarUrl: profile?.avatarUrl,
          level: profile?.level || 1,
          title: profile?.title,
          createdAt: request.createdAt,
          type: "incoming" as const,
        };
      })
    );

    const outgoingWithProfiles = await Promise.all(
      outgoing.map(async (request) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", request.friendId))
          .first();

        return {
          clerkId: request.friendId,
          username: profile?.username,
          avatarUrl: profile?.avatarUrl,
          level: profile?.level || 1,
          title: profile?.title,
          createdAt: request.createdAt,
          type: "outgoing" as const,
        };
      })
    );

    return {
      incoming: incomingWithProfiles.filter((r) => r.username),
      outgoing: outgoingWithProfiles.filter((r) => r.username),
    };
  },
});

export const getFriendshipStatus = query({
  args: {
    userId: v.string(),
    otherUserId: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.userId === args.otherUserId) {
      return { status: "self" };
    }

    const friendship = await ctx.db
      .query("friendships")
      .withIndex("by_user_friend", (q) =>
        q.eq("userId", args.userId).eq("friendId", args.otherUserId)
      )
      .first();

    if (friendship) {
      return {
        status: friendship.status,
        initiatedBy: friendship.initiatedBy,
      };
    }

    const reverseFriendship = await ctx.db
      .query("friendships")
      .withIndex("by_user_friend", (q) =>
        q.eq("userId", args.otherUserId).eq("friendId", args.userId)
      )
      .first();

    if (reverseFriendship) {
      if (reverseFriendship.status === "blocked") {
        return { status: "none" };
      }
      return {
        status: reverseFriendship.status === "pending" ? "pending_incoming" : reverseFriendship.status,
        initiatedBy: reverseFriendship.initiatedBy,
      };
    }

    return { status: "none" };
  },
});

export const getBlockedUsers = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const blocked = await ctx.db
      .query("friendships")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "blocked"))
      .collect();

    const blockedWithProfiles = await Promise.all(
      blocked.map(async (block) => {
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", block.friendId))
          .first();

        return {
          clerkId: block.friendId,
          username: profile?.username,
          avatarUrl: profile?.avatarUrl,
          blockedAt: block.createdAt,
        };
      })
    );

    return blockedWithProfiles.filter((b) => b.username);
  },
});
