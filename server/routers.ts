import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

// ============ CAMPAIGN ROUTER ============

const campaignRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserCampaigns(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        campaignType: z.enum(["email", "social_media", "paid_ads", "content"]),
        integrationId: z.string(),
        budget: z.number().optional(),
        targetAudience: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = uuidv4();
      const campaign = await db.createCampaign({
        id,
        userId: ctx.user.id,
        integrationId: input.integrationId,
        name: input.name,
        description: input.description,
        campaignType: input.campaignType,
        status: "draft",
        budget: input.budget ? input.budget.toString() : undefined,
        targetAudience: input.targetAudience,
      });
      return campaign;
    }),

  getById: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input }) => {
      return await db.getCampaignById(input.campaignId);
    }),

  update: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        name: z.string().optional(),
        status: z.enum(["draft", "scheduled", "running", "completed", "paused"]).optional(),
        budget: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateCampaign(input.campaignId, {
        name: input.name,
        status: input.status,
        budget: input.budget ? input.budget.toString() : undefined,
      });
      return { success: true };
    }),

  getMetrics: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input }) => {
      return await db.getCampaignMetrics(input.campaignId);
    }),

  getLatestMetrics: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input }) => {
      return await db.getLatestCampaignMetrics(input.campaignId);
    }),
});

// ============ INTEGRATION ROUTER ============

const integrationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserIntegrations(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        platform: z.enum([
          "google_analytics",
          "facebook_ads",
          "mailchimp",
          "hubspot",
          "manual_upload",
        ]),
        name: z.string().min(1),
        accessToken: z.string().optional(),
        accountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = uuidv4();
      const integration = await db.createIntegration({
        id,
        userId: ctx.user.id,
        platform: input.platform,
        name: input.name,
        accessToken: input.accessToken,
        accountId: input.accountId,
      });
      return integration;
    }),

  getById: protectedProcedure
    .input(z.object({ integrationId: z.string() }))
    .query(async ({ input }) => {
      return await db.getIntegrationById(input.integrationId);
    }),
});

// ============ PREDICTION ROUTER ============

const predictionRouter = router({
  list: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input }) => {
      return await db.getCampaignPredictions(input.campaignId);
    }),

  generatePerformancePrediction: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        historicalData: z.array(
          z.object({
            impressions: z.number(),
            clicks: z.number(),
            conversions: z.number(),
            spend: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const id = uuidv4();

      // Simple prediction logic based on historical data
      const avgCTR =
        input.historicalData.reduce((sum, d) => sum + d.clicks / d.impressions, 0) /
        input.historicalData.length;
      const avgConversionRate =
        input.historicalData.reduce((sum, d) => sum + d.conversions / d.clicks, 0) /
        input.historicalData.length;

      const predictedValue = Math.round(
        input.historicalData[input.historicalData.length - 1].impressions * avgCTR * avgConversionRate
      );

      const prediction = await db.createPrediction({
        id,
        campaignId: input.campaignId,
        predictionType: "performance",
        predictedValue: predictedValue.toString(),
        confidence: "85",
        insights: JSON.stringify({
          avgCTR: (avgCTR * 100).toFixed(2) + "%",
          avgConversionRate: (avgConversionRate * 100).toFixed(2) + "%",
        }),
        recommendation: "Based on historical data, your campaign is expected to perform well.",
      });

      return prediction;
    }),

  generateOptimalTiming: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        engagementData: z.array(
          z.object({
            hour: z.number(),
            dayOfWeek: z.number(),
            engagementRate: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const id = uuidv4();

      // Find optimal hour and day
      const optimal = input.engagementData.reduce((best, current) =>
        current.engagementRate > best.engagementRate ? current : best
      );

      const prediction = await db.createPrediction({
        id,
        campaignId: input.campaignId,
        predictionType: "optimal_timing",
        predictedValue: optimal.engagementRate.toString(),
        confidence: "78",
        insights: JSON.stringify({
          optimalHour: optimal.hour,
          optimalDay: optimal.dayOfWeek,
          expectedEngagementRate: (optimal.engagementRate * 100).toFixed(2) + "%",
        }),
        recommendation: `Send your campaign on ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][optimal.dayOfWeek]} at ${optimal.hour}:00 for maximum engagement.`,
      });

      return prediction;
    }),
});

// ============ RECOMMENDATION ROUTER ============

const recommendationRouter = router({
  list: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input }) => {
      return await db.getCampaignRecommendations(input.campaignId);
    }),

  getPending: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input }) => {
      return await db.getPendingRecommendations(input.campaignId);
    }),

  generateHeadlineOptimization: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        currentHeadline: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const id = uuidv4();

      try {
        // Use LLM to generate optimized headline
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a marketing expert. Generate 3 alternative headlines that are more engaging and conversion-focused than the original. Return only the headlines, one per line.",
            },
            {
              role: "user",
              content: `Original headline: "${input.currentHeadline}". Generate better alternatives.`,
            },
          ],
        });

        const suggestedValue = typeof response.choices[0]?.message?.content === 'string' 
          ? response.choices[0].message.content 
          : input.currentHeadline;

        const recommendation = await db.createRecommendation({
          id,
          campaignId: input.campaignId,
          recommendationType: "headline_optimization",
          currentValue: input.currentHeadline,
          suggestedValue: suggestedValue,
          expectedImpact: "15",
          priority: "high",
          status: "pending",
        });

        return recommendation;
      } catch (error) {
        console.error("Error generating headline optimization:", error);
        throw error;
      }
    }),

  generateAudienceSegmentation: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        audienceData: z.array(
          z.object({
            segment: z.string(),
            size: z.number(),
            engagementRate: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const id = uuidv4();

      // Find high-performing segments
      const topSegments = input.audienceData
        .sort((a, b) => b.engagementRate - a.engagementRate)
        .slice(0, 3);

      const recommendation = await db.createRecommendation({
        id,
        campaignId: input.campaignId,
        recommendationType: "audience_segmentation",
        currentValue: "Broad audience targeting",
        suggestedValue: `Focus on: ${topSegments.map((s) => s.segment).join(", ")}`,
        expectedImpact: "22",
        priority: "high",
        status: "pending",
      });

      return recommendation;
    }),

  applyRecommendation: protectedProcedure
    .input(z.object({ recommendationId: z.string() }))
    .mutation(async ({ input }) => {
      await db.updateRecommendation(input.recommendationId, {
        status: "applied",
        appliedAt: new Date(),
      });
      return { success: true };
    }),

  dismissRecommendation: protectedProcedure
    .input(z.object({ recommendationId: z.string() }))
    .mutation(async ({ input }) => {
      await db.updateRecommendation(input.recommendationId, {
        status: "dismissed",
      });
      return { success: true };
    }),
});

// ============ ALERT ROUTER ============

const alertRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserAlerts(ctx.user.id);
  }),

  getUnread: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUnreadAlerts(ctx.user.id);
  }),

  markAsRead: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ input }) => {
      await db.markAlertAsRead(input.alertId);
      return { success: true };
    }),
});

// ============ MAIN ROUTER ============

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  campaign: campaignRouter,
  integration: integrationRouter,
  prediction: predictionRouter,
  recommendation: recommendationRouter,
  alert: alertRouter,
});

export type AppRouter = typeof appRouter;

