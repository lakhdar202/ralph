import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query to get the latest analysis for a position
export const getLatest = query({
    args: { positionId: v.id("positions") },
    handler: async (ctx, args) => {
        const analyses = await ctx.db
            .query("analyses")
            .withIndex("by_position", (q) => q.eq("positionId", args.positionId))
            .order("desc")
            .take(1);
        return analyses[0] || null;
    },
});

// Query to get all analyses for a position
export const listByPosition = query({
    args: { positionId: v.id("positions") },
    handler: async (ctx, args) => {
        const analyses = await ctx.db
            .query("analyses")
            .withIndex("by_position", (q) => q.eq("positionId", args.positionId))
            .order("desc")
            .collect();
        return analyses;
    },
});

// Query to get a single analysis by ID
export const get = query({
    args: { id: v.id("analyses") },
    handler: async (ctx, args) => {
        const analysis = await ctx.db.get(args.id);
        return analysis;
    },
});

// Query to get all recent analyses (for dashboard)
export const listRecent = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const limit = args.limit || 10;
        const analyses = await ctx.db
            .query("analyses")
            .order("desc")
            .take(limit);

        // Enrich with position names
        const enriched = await Promise.all(
            analyses.map(async (analysis) => {
                const position = await ctx.db.get(analysis.positionId);
                return {
                    ...analysis,
                    positionName: position?.name || "Unknown Position",
                };
            })
        );

        return enriched;
    },
});

// Query to count total analyses
export const count = query({
    args: {},
    handler: async (ctx) => {
        const analyses = await ctx.db.query("analyses").collect();
        return analyses.length;
    },
});

// Mutation to create/save a new analysis
export const create = mutation({
    args: {
        positionId: v.id("positions"),
        results: v.array(v.object({
            candidateId: v.id("candidates"),
            candidateName: v.string(),
            closenessScore: v.number(),
            distanceToBest: v.number(),
            distanceToWorst: v.number(),
            rank: v.number(),
        })),
        idealBest: v.array(v.number()),
        idealWorst: v.array(v.number()),
    },
    handler: async (ctx, args) => {
        const analysisId = await ctx.db.insert("analyses", {
            positionId: args.positionId,
            results: args.results,
            idealBest: args.idealBest,
            idealWorst: args.idealWorst,
            createdAt: Date.now(),
        });
        return analysisId;
    },
});

// Mutation to delete an analysis
export const remove = mutation({
    args: { id: v.id("analyses") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return args.id;
    },
});

// Mutation to delete all analyses for a position
export const removeAllByPosition = mutation({
    args: { positionId: v.id("positions") },
    handler: async (ctx, args) => {
        const analyses = await ctx.db
            .query("analyses")
            .withIndex("by_position", (q) => q.eq("positionId", args.positionId))
            .collect();

        for (const analysis of analyses) {
            await ctx.db.delete(analysis._id);
        }

        return analyses.length;
    },
});
