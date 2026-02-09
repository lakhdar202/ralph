import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get all candidates for a position
export const listByPosition = query({
    args: { positionId: v.id("positions") },
    handler: async (ctx, args) => {
        const candidates = await ctx.db
            .query("candidates")
            .withIndex("by_position", (q) => q.eq("positionId", args.positionId))
            .order("desc")
            .collect();
        return candidates;
    },
});

// Query to get a single candidate by ID
export const get = query({
    args: { id: v.id("candidates") },
    handler: async (ctx, args) => {
        const candidate = await ctx.db.get(args.id);
        return candidate;
    },
});

// Query to count candidates for a position
export const countByPosition = query({
    args: { positionId: v.id("positions") },
    handler: async (ctx, args) => {
        const candidates = await ctx.db
            .query("candidates")
            .withIndex("by_position", (q) => q.eq("positionId", args.positionId))
            .collect();
        return candidates.length;
    },
});

// Query to get total candidate count
export const count = query({
    args: {},
    handler: async (ctx) => {
        const candidates = await ctx.db.query("candidates").collect();
        return candidates.length;
    },
});

// Mutation to create a new candidate
export const create = mutation({
    args: {
        positionId: v.id("positions"),
        name: v.string(),
        data: v.array(v.object({
            attributeName: v.string(),
            value: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const candidateId = await ctx.db.insert("candidates", {
            positionId: args.positionId,
            name: args.name,
            data: args.data,
            createdAt: Date.now(),
        });
        return candidateId;
    },
});

// Mutation to create multiple candidates (bulk import)
export const createMany = mutation({
    args: {
        positionId: v.id("positions"),
        candidates: v.array(v.object({
            name: v.string(),
            data: v.array(v.object({
                attributeName: v.string(),
                value: v.number(),
            })),
        })),
    },
    handler: async (ctx, args) => {
        const ids = [];
        for (const candidate of args.candidates) {
            const id = await ctx.db.insert("candidates", {
                positionId: args.positionId,
                name: candidate.name,
                data: candidate.data,
                createdAt: Date.now(),
            });
            ids.push(id);
        }
        return ids;
    },
});

// Mutation to update a candidate
export const update = mutation({
    args: {
        id: v.id("candidates"),
        name: v.string(),
        data: v.array(v.object({
            attributeName: v.string(),
            value: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
        return id;
    },
});

// Mutation to delete a candidate
export const remove = mutation({
    args: { id: v.id("candidates") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return args.id;
    },
});

// Mutation to delete all candidates for a position
export const removeAllByPosition = mutation({
    args: { positionId: v.id("positions") },
    handler: async (ctx, args) => {
        const candidates = await ctx.db
            .query("candidates")
            .withIndex("by_position", (q) => q.eq("positionId", args.positionId))
            .collect();

        for (const candidate of candidates) {
            await ctx.db.delete(candidate._id);
        }

        return candidates.length;
    },
});
