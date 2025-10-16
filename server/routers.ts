import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addCredits, createGeneration, deductCredits, getActiveSubscriptionPlans, getGeneration, getUser, getUserCredits, getUserGenerations, seedSubscriptionPlans, updateGeneration } from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  credits: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const credits = await getUserCredits(ctx.user.id);
      return { credits };
    }),
    
    addBonus: protectedProcedure
      .input(z.object({ amount: z.number().min(1) }))
      .mutation(async ({ ctx, input }) => {
        await addCredits(ctx.user.id, input.amount, "bonus", "Bonus credits");
        return { success: true };
      }),
  }),

  plans: router({
    list: publicProcedure.query(async () => {
      const plans = await getActiveSubscriptionPlans();
      return plans.map(plan => ({
        ...plan,
        features: JSON.parse(plan.features),
      }));
    }),
    
    seedPlans: protectedProcedure.mutation(async () => {
      await seedSubscriptionPlans();
      return { success: true };
    }),
  }),

  generations: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const generations = await getUserGenerations(ctx.user.id);
      return generations.map(gen => ({
        ...gen,
        imageUrls: JSON.parse(gen.imageUrls),
      }));
    }),
    
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const generation = await getGeneration(input.id);
        if (!generation) return null;
        return {
          ...generation,
          imageUrls: JSON.parse(generation.imageUrls),
        };
      }),
    
    create: protectedProcedure
      .input(z.object({
        originalUrl: z.string().url(),
        imageCount: z.number().min(1).max(8),
        aspectRatio: z.enum(["portrait", "landscape", "square"]).default("portrait"),
        style: z.string().optional(),
        cameraAngle: z.string().optional(),
        lighting: z.string().optional(),
        prompt: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if user has enough credits
        const credits = await getUserCredits(ctx.user.id);
        if (credits < input.imageCount) {
          throw new Error("Insufficient credits");
        }
        
        // Create generation record
        const generationId = crypto.randomUUID();
        const generation = await createGeneration({
          id: generationId,
          userId: ctx.user.id,
          originalUrl: input.originalUrl,
          imageCount: input.imageCount,
          aspectRatio: input.aspectRatio,
          prompt: input.prompt,
          style: input.style,
          cameraAngle: input.cameraAngle,
          lighting: input.lighting,
          imageUrls: JSON.stringify([]),
          status: "processing",
        });
        
        // Deduct credits
        await deductCredits(ctx.user.id, input.imageCount, generationId);
        
        // TODO: Implement actual image generation with Gemini API
        // For now, simulate processing
        setTimeout(async () => {
          const mockImageUrls = Array(input.imageCount).fill(null).map((_, i) => 
            `https://placehold.co/600x800/1a1a2e/ffffff?text=Generated+Image+${i + 1}`
          );
          
          await updateGeneration(generationId, {
            status: "completed",
            imageUrls: JSON.stringify(mockImageUrls),
            completedAt: new Date(),
            processingTime: 3000,
          });
        }, 3000);
        
        return { id: generationId, status: "processing" };
      }),
    
    toggleFavorite: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const generation = await getGeneration(input.id);
        if (!generation) throw new Error("Generation not found");
        
        await updateGeneration(input.id, {
          isFavorite: generation.isFavorite ? 0 : 1,
        });
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

