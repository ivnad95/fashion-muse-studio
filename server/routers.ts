import { COOKIE_NAME } from "@shared/const";
import {
  GENERATION_STYLES,
  CAMERA_ANGLES,
  LIGHTING_OPTIONS,
  MAX_IMAGES_PER_GENERATION,
  DEFAULT_ASPECT_RATIO,
  MAX_PROMPT_LENGTH,
  VALID_ASPECT_RATIOS,
} from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addCredits,
  createGeneration,
  deductCredits,
  getActiveSubscriptionPlans,
  getGeneration,
  getUser,
  getUserCredits,
  getUserGenerations,
  refundGenerationCredits,
  seedSubscriptionPlans,
  updateGeneration,
} from "./db";
import { generateImagesWithGemini } from "./_core/geminiImageGen";
import { storagePut } from "./storage";

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
        features: (() => {
          try {
            return JSON.parse(plan.features);
          } catch {
            console.error("Failed to parse features for plan", plan.id);
            return [];
          }
        })(),
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
        imageUrls: (() => {
          try {
            return JSON.parse(gen.imageUrls);
          } catch {
            console.error("Failed to parse imageUrls for generation", gen.id);
            return [];
          }
        })(),
      }));
    }),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const generation = await getGeneration(input.id);
        if (!generation || generation.userId !== ctx.user.id) return null;
        return {
          ...generation,
          imageUrls: JSON.parse(generation.imageUrls),
        };
      }),

    create: protectedProcedure
      .input(
        z.object({
          originalUrl: z.string().url(),
          imageCount: z.number().min(1).max(MAX_IMAGES_PER_GENERATION),
          aspectRatio: z
            .enum(VALID_ASPECT_RATIOS)
            .default(DEFAULT_ASPECT_RATIO),
          style: z.enum(GENERATION_STYLES).optional(),
          cameraAngle: z.enum(CAMERA_ANGLES).optional(),
          lighting: z.enum(LIGHTING_OPTIONS).optional(),
          prompt: z.string().min(1).max(MAX_PROMPT_LENGTH),
        })
      )
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

        // Generate images with AI in background
        (async () => {
          try {
            const startTime = Date.now();
            const imageUrls: string[] = [];

            // Download reference image and convert to base64
            let referenceImageBase64 = "";
            try {
              const imageResponse = await fetch(input.originalUrl);
              if (imageResponse.ok) {
                const imageBuffer = Buffer.from(
                  await imageResponse.arrayBuffer()
                );
                referenceImageBase64 = imageBuffer.toString("base64");
              } else {
                throw new Error(
                  `Failed to download image: ${imageResponse.statusText}`
                );
              }
            } catch (error) {
              console.error("Error downloading reference image:", error);
              throw new Error("Failed to download reference image");
            }

            // Generate images using Gemini with reference image
            try {
              const result = await generateImagesWithGemini({
                prompt: input.prompt,
                referenceImageBase64: referenceImageBase64,
                numberOfImages: input.imageCount,
                style: input.style,
                cameraAngle: input.cameraAngle,
                lighting: input.lighting,
              });

              // Upload generated images to S3 and get URLs
              let uploadFailures = 0;
              for (let i = 0; i < result.images.length; i++) {
                try {
                  const base64Data = result.images[i];
                  const buffer = Buffer.from(base64Data, "base64");

                  // Upload to S3
                  const fileName = `generations/${generationId}/image-${i + 1}-${Date.now()}.png`;
                  const uploadResult = await storagePut(
                    fileName,
                    buffer,
                    "image/png"
                  );

                  imageUrls.push(uploadResult.url);
                } catch (uploadError) {
                  console.error(`Error uploading image ${i + 1}:`, uploadError);
                  uploadFailures++;
                }
              }

              // Fail the entire generation if any images failed to upload
              if (uploadFailures > 0) {
                throw new Error(
                  `Failed to upload ${uploadFailures} image(s) to storage`
                );
              }
            } catch (error) {
              console.error("Gemini generation error:", error);
              throw error;
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
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";

            // Mark as failed
            await updateGeneration(generationId, {
              status: "failed",
              errorMessage,
            });

            // Attempt to refund credits
            try {
              await refundGenerationCredits(generationId);
            } catch (refundError) {
              console.error("Failed to refund credits:", refundError);
            }
          }
        })();

        return { id: generationId, status: "processing" };
      }),

    toggleFavorite: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const generation = await getGeneration(input.id);
        if (!generation || generation.userId !== ctx.user.id) {
          throw new Error("Generation not found or access denied");
        }

        await updateGeneration(input.id, {
          isFavorite: generation.isFavorite ? 0 : 1,
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
