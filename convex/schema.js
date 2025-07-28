import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspace: defineTable({
    messages: v.any(),
    fileData: v.optional(v.any()),
    designSchema: v.optional(v.any()),
    customizations: v.optional(v.any()),
    userAnswers: v.optional(v.any()),
    includeMobile: v.optional(v.boolean()),
    flutterFiles: v.optional(v.any()),
    rnFiles: v.optional(v.any()),
  }),
});