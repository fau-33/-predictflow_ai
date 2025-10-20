import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  campaigns,
  integrations,
  campaignMetrics,
  predictions,
  recommendations,
  alerts,
  InsertCampaign,
  InsertIntegration,
  InsertCampaignMetric,
  InsertPrediction,
  InsertRecommendation,
  InsertAlert,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onDuplicateKeyUpdate({
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ CAMPAIGN OPERATIONS ============

export async function createCampaign(data: InsertCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(campaigns).values(data);
  return data;
}

export async function getUserCampaigns(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.userId, userId))
    .orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(campaignId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateCampaign(
  campaignId: string,
  updates: Partial<InsertCampaign>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(campaigns)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(campaigns.id, campaignId));
}

// ============ INTEGRATION OPERATIONS ============

export async function createIntegration(data: InsertIntegration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(integrations).values(data);
  return data;
}

export async function getUserIntegrations(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(integrations)
    .where(eq(integrations.userId, userId))
    .orderBy(desc(integrations.createdAt));
}

export async function getIntegrationById(integrationId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(integrations)
    .where(eq(integrations.id, integrationId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============ CAMPAIGN METRICS OPERATIONS ============

export async function createCampaignMetric(data: InsertCampaignMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(campaignMetrics).values(data);
  return data;
}

export async function getCampaignMetrics(campaignId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(campaignMetrics)
    .where(eq(campaignMetrics.campaignId, campaignId))
    .orderBy(desc(campaignMetrics.recordedAt));
}

export async function getLatestCampaignMetrics(campaignId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(campaignMetrics)
    .where(eq(campaignMetrics.campaignId, campaignId))
    .orderBy(desc(campaignMetrics.recordedAt))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============ PREDICTION OPERATIONS ============

export async function createPrediction(data: InsertPrediction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(predictions).values(data);
  return data;
}

export async function getCampaignPredictions(campaignId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(predictions)
    .where(eq(predictions.campaignId, campaignId))
    .orderBy(desc(predictions.createdAt));
}

export async function getLatestPrediction(campaignId: string, predictionType: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(predictions)
    .where(
      and(
        eq(predictions.campaignId, campaignId),
        eq(predictions.predictionType, predictionType as any)
      )
    )
    .orderBy(desc(predictions.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// ============ RECOMMENDATION OPERATIONS ============

export async function createRecommendation(data: InsertRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(recommendations).values(data);
  return data;
}

export async function getCampaignRecommendations(campaignId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.campaignId, campaignId))
    .orderBy(desc(recommendations.createdAt));
}

export async function getPendingRecommendations(campaignId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(recommendations)
    .where(
      and(
        eq(recommendations.campaignId, campaignId),
        eq(recommendations.status, "pending")
      )
    )
    .orderBy(desc(recommendations.priority));
}

export async function updateRecommendation(
  recommendationId: string,
  updates: Partial<InsertRecommendation>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(recommendations)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(recommendations.id, recommendationId));
}

// ============ ALERT OPERATIONS ============

export async function createAlert(data: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(alerts).values(data);
  return data;
}

export async function getUserAlerts(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(alerts)
    .where(eq(alerts.userId, userId))
    .orderBy(desc(alerts.createdAt));
}

export async function getUnreadAlerts(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(alerts)
    .where(and(eq(alerts.userId, userId), eq(alerts.isRead, false)))
    .orderBy(desc(alerts.createdAt));
}

export async function markAlertAsRead(alertId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(alerts)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(alerts.id, alertId));
}

