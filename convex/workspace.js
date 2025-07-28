import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const CreateWorkspace = mutation({
  args: {
    messages: v.any(),
    designSchema: v.optional(v.any()), // allow designSchema
    userAnswers: v.optional(v.any()),
    includeMobile: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const workspaceId = await ctx.db.insert("workspace", {
      messages: args.messages,
      designSchema: args.designSchema, // store designSchema if provided
      userAnswers: args.userAnswers, // store userAnswers if provided
      includeMobile: args.includeMobile, // store includeMobile if provided
    });
    return workspaceId;
  },
});

export const GetWorkspace = query({
  args: { workspaceId: v.id("workspace") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workspaceId);
  },
});

export const UpdateWorkspace = mutation({
  args: {
    workspaceId: v.id("workspace"),
    messages: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.workspaceId, {
      messages: args.messages,
    });
  },
});

export const UpdateFiles = mutation({
  args: {
    workspaceId: v.id("workspace"),
    files: v.any(),
    flutterFiles: v.optional(v.any()),
    rnFiles: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.workspaceId, {
      fileData: args.files,
      flutterFiles: args.flutterFiles,
      rnFiles: args.rnFiles,
    });
  },
});

export const UpdateDesignSchema = mutation({
  args: {
    workspaceId: v.id("workspace"),
    designSchema: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.workspaceId, {
      designSchema: args.designSchema
    });
  },
});

export const UpdateCustomizations = mutation({
  args: {
    workspaceId: v.id("workspace"),
    customizations: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.workspaceId, {
      customizations: args.customizations
    });
  },
});

export const UpdateUserAnswers = mutation({
  args: {
    workspaceId: v.id("workspace"),
    userAnswers: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.workspaceId, {
      userAnswers: args.userAnswers
    });
  },
});

export const ResetWorkspace = mutation({
  args: {
    workspaceId: v.id("workspace"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.workspaceId, {
      fileData: undefined,
      designSchema: undefined,
      customizations: undefined,
      userAnswers: undefined,
      flutterFiles: undefined,
      rnFiles: undefined,
    });
  },
});

export const SaveFigmaData = mutation({
  args: {
    workspaceId: v.id("workspace"),
    figmaData: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.workspaceId, {
      figmaData: args.figmaData
    });
  },
});

