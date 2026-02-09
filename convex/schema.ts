import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    positions: defineTable({
        name: v.string(),           // "Senior Developer"
        description: v.string(),    // Job description
        attributes: v.array(v.object({
            name: v.string(),         // "Years of Experience"
            type: v.union(v.literal("number"), v.literal("rating")),
            weight: v.number(),       // 0.0 - 1.0 (importance)
            beneficial: v.boolean(),  // true = higher is better
            min: v.optional(v.number()),
            max: v.optional(v.number()),
        })),
        createdAt: v.number(),
    }),

    candidates: defineTable({
        positionId: v.id("positions"),
        name: v.string(),
        data: v.array(v.object({
            attributeName: v.string(),
            value: v.number(),
        })),
        createdAt: v.number(),
    }).index("by_position", ["positionId"]),

    analyses: defineTable({
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
        createdAt: v.number(),
    }).index("by_position", ["positionId"]),
});
