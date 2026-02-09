import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get all positions
export const list = query({
    args: {},
    handler: async (ctx) => {
        const positions = await ctx.db.query("positions").order("desc").collect();
        return positions;
    },
});

// Query to get a single position by ID
export const get = query({
    args: { id: v.id("positions") },
    handler: async (ctx, args) => {
        const position = await ctx.db.get(args.id);
        return position;
    },
});

// Mutation to create a new position
export const create = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        attributes: v.array(v.object({
            name: v.string(),
            type: v.union(v.literal("number"), v.literal("rating")),
            weight: v.number(),
            beneficial: v.boolean(),
            min: v.optional(v.number()),
            max: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        const positionId = await ctx.db.insert("positions", {
            name: args.name,
            description: args.description,
            attributes: args.attributes,
            createdAt: Date.now(),
        });
        return positionId;
    },
});

// Mutation to update a position
export const update = mutation({
    args: {
        id: v.id("positions"),
        name: v.string(),
        description: v.string(),
        attributes: v.array(v.object({
            name: v.string(),
            type: v.union(v.literal("number"), v.literal("rating")),
            weight: v.number(),
            beneficial: v.boolean(),
            min: v.optional(v.number()),
            max: v.optional(v.number()),
        })),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
        return id;
    },
});

// Mutation to delete a position
export const remove = mutation({
    args: { id: v.id("positions") },
    handler: async (ctx, args) => {
        // Delete all candidates for this position first
        const candidates = await ctx.db
            .query("candidates")
            .withIndex("by_position", (q) => q.eq("positionId", args.id))
            .collect();

        for (const candidate of candidates) {
            await ctx.db.delete(candidate._id);
        }

        // Delete all analyses for this position
        const analyses = await ctx.db
            .query("analyses")
            .withIndex("by_position", (q) => q.eq("positionId", args.id))
            .collect();

        for (const analysis of analyses) {
            await ctx.db.delete(analysis._id);
        }

        // Finally delete the position
        await ctx.db.delete(args.id);
        return args.id;
    },
});
