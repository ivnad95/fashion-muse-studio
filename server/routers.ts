import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addCredits, createGeneration, deductCredits, deleteGeneration, getActiveSubscriptionPlans, getGeneration, getUser, getUserCredits, getUserGenerations, seedSubscriptionPlans, updateGeneration } from "./db";
import { generateImagesWithGemini, buildFashionPrompt } from "./_core/geminiImageGen";
// Post-processing removed - let Gemini handle image quality
import { storagePut } from "./storage";
import { createCheckoutSession, CREDIT_PACKAGES, handlePaymentSuccess } from "./_core/stripe";

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

    // Stripe payment integration
    getPackages: publicProcedure.query(() => {
      return CREDIT_PACKAGES;
    }),

    createCheckout: protectedProcedure
      .input(z.object({ 
        packageId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await getUser(ctx.user.id);
        if (!user) throw new Error("User not found");

        const session = await createCheckoutSession({
          userId: ctx.user.id,
          userEmail: user.email || '',
          packageId: input.packageId,
          successUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/plans?success=true`,
          cancelUrl: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/plans?canceled=true`,
        });

        return session;
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
        originalUrl: z.string(), // Can be URL or base64 data URI
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
        
        // Upload original image to S3 first (to avoid storing large base64 in DB)
        let originalImageUrl = "";
        try {
          if (input.originalUrl.startsWith('data:')) {
            // Extract base64 and upload to S3
            const base64Match = input.originalUrl.match(/^data:image\/([a-z]+);base64,(.+)$/);
            if (base64Match && base64Match[2]) {
              const imageType = base64Match[1];
              const base64Data = base64Match[2];
              const imageBuffer = Buffer.from(base64Data, 'base64');
              
              const generationId = crypto.randomUUID();
              const fileName = `originals/${ctx.user.id}/${generationId}.${imageType}`;
              const uploadResult = await storagePut(fileName, imageBuffer, `image/${imageType}`);
              originalImageUrl = uploadResult.url;
              console.log("[Generation] Original image uploaded to S3:", originalImageUrl);
            } else {
              throw new Error("Invalid data URI format");
            }
          } else {
            originalImageUrl = input.originalUrl;
          }
        } catch (error) {
          console.error("[Generation] Error uploading original image:", error);
          throw new Error("Failed to upload original image");
        }
        
        // Create generation record with S3 URL
        const generationId = crypto.randomUUID();
        const generation = await createGeneration({
          id: generationId,
          userId: ctx.user.id,
          originalUrl: originalImageUrl,
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
        
        // Generate images with AI in background
        (async () => {
          try {
            const startTime = Date.now();
            const imageUrls: string[] = [];
            
            // Extract base64 from data URI (uploaded from device)
            let referenceImageBase64 = "";
            try {
              if (input.originalUrl.startsWith('data:')) {
                // Extract base64 from data URI
                const base64Match = input.originalUrl.match(/^data:image\/[a-z]+;base64,(.+)$/);
                if (base64Match && base64Match[1]) {
                  referenceImageBase64 = base64Match[1];
                  console.log("[Generation] Using base64 image from device upload");
                } else {
                  throw new Error("Invalid data URI format");
                }
              } else {
                throw new Error("Only base64 data URIs are supported. Please upload an image from your device.");
              }
            } catch (error) {
              console.error("[Generation] Error processing reference image:", error);
              throw new Error(`Failed to process reference image: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
            
            // Generate multiple images using Gemini with reference image
            try {
              console.log(`[Generation ${generationId}] Generating ${input.imageCount} images...`);
              
              // Generate each image separately (Gemini API generates 1 image per call)
              for (let i = 0; i < input.imageCount; i++) {
                try {
                  console.log(`[Generation ${generationId}] Generating image ${i + 1}/${input.imageCount}...`);
                  
                  const result = await generateImagesWithGemini({
                    prompt: buildFashionPrompt({
                      style: input.style,
                      cameraAngle: input.cameraAngle,
                      lighting: input.lighting,
                    }),
                    imageBase64: referenceImageBase64,
                    mimeType: "image/jpeg",
                    style: input.style,
                    cameraAngle: input.cameraAngle,
                    lighting: input.lighting,
                  });
                  
                  // Upload generated image directly to S3 without post-processing
                  if (result.images.length > 0) {
                    // Convert base64 to buffer (no post-processing)
                    const imageBuffer = Buffer.from(result.images[0], "base64");
                    
                    // Upload directly to S3
                    const fileName = `generations/${generationId}/image-${i + 1}-${Date.now()}.png`;
                    const uploadResult = await storagePut(fileName, imageBuffer, "image/png");
                    
                    console.log(`[Generation ${generationId}] Uploaded image ${i + 1} to S3`);
                    imageUrls.push(uploadResult.url);
                  } else {
                    throw new Error("No image data returned from Gemini");
                  }
                } catch (imageError) {
                  console.error(`Error generating image ${i + 1}:`, imageError);
                  imageUrls.push(`https://placehold.co/600x800/0A133B/F5F7FA?text=Generation+Error`);
                }
              }
            } catch (error) {
              console.error("Gemini generation error:", error);
              // Fallback to placeholder images
              for (let i = 0; i < input.imageCount; i++) {
                imageUrls.push(`https://placehold.co/600x800/0A133B/F5F7FA?text=Generation+Error`);
              }
            }
            
            const processingTime = Date.now() - startTime;
            
            await updateGeneration(generationId, {
              status: "completed",
              imageUrls: JSON.stringify(imageUrls),
              completedAt: new Date(),
              processingTime,
            });
          } catch (error) {
            console.error("Generation error:", error);
            await updateGeneration(generationId, {
              status: "failed",
              errorMessage: error instanceof Error ? error.message : "Unknown error",
            });
          }
        })();
        
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
    
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const success = await deleteGeneration(input.id, ctx.user.id);
        if (!success) {
          throw new Error("Failed to delete generation. It may not exist or you may not have permission.");
        }
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

