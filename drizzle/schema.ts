import {
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  int,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Integrations table - stores connected marketing platforms
 */
export const integrations = mysqlTable("integrations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  platform: mysqlEnum("platform", [
    "google_analytics",
    "facebook_ads",
    "mailchimp",
    "hubspot",
    "manual_upload",
  ]).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accountId: varchar("accountId", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

/**
 * Campaigns table - stores marketing campaigns
 */
export const campaigns = mysqlTable("campaigns", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  integrationId: varchar("integrationId", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  campaignType: mysqlEnum("campaignType", [
    "email",
    "social_media",
    "paid_ads",
    "content",
  ]).notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "running", "completed", "paused"]).default("draft").notNull(),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  targetAudience: text("targetAudience"), // JSON stringified
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

/**
 * Campaign metrics table - stores performance data
 */
export const campaignMetrics = mysqlTable("campaignMetrics", {
  id: varchar("id", { length: 64 }).primaryKey(),
  campaignId: varchar("campaignId", { length: 64 }).notNull(),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  conversions: int("conversions").default(0),
  spend: decimal("spend", { precision: 10, scale: 2 }).default("0"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).default("0"), // Click-through rate
  cpc: decimal("cpc", { precision: 10, scale: 2 }).default("0"), // Cost per click
  roas: decimal("roas", { precision: 5, scale: 2 }).default("0"), // Return on ad spend
  engagementRate: decimal("engagementRate", { precision: 5, scale: 2 }).default("0"),
  recordedAt: timestamp("recordedAt").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type CampaignMetric = typeof campaignMetrics.$inferSelect;
export type InsertCampaignMetric = typeof campaignMetrics.$inferInsert;

/**
 * Predictive analytics table - stores AI predictions
 */
export const predictions = mysqlTable("predictions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  campaignId: varchar("campaignId", { length: 64 }).notNull(),
  predictionType: mysqlEnum("predictionType", [
    "performance",
    "conversion_rate",
    "optimal_timing",
    "audience_segment",
    "content_performance",
  ]).notNull(),
  predictedValue: decimal("predictedValue", { precision: 10, scale: 2 }),
  confidence: decimal("confidence", { precision: 5, scale: 2 }), // 0-100
  insights: text("insights"), // JSON stringified insights
  recommendation: text("recommendation"),
  actualValue: decimal("actualValue", { precision: 10, scale: 2 }),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }), // 0-100
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = typeof predictions.$inferInsert;

/**
 * Recommendations table - stores AI-generated recommendations
 */
export const recommendations = mysqlTable("recommendations", {
  id: varchar("id", { length: 64 }).primaryKey(),
  campaignId: varchar("campaignId", { length: 64 }).notNull(),
  recommendationType: mysqlEnum("recommendationType", [
    "headline_optimization",
    "audience_segmentation",
    "send_time_optimization",
    "budget_allocation",
    "content_suggestion",
  ]).notNull(),
  currentValue: text("currentValue"),
  suggestedValue: text("suggestedValue"),
  expectedImpact: decimal("expectedImpact", { precision: 5, scale: 2 }), // Percentage improvement
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  status: mysqlEnum("status", ["pending", "applied", "dismissed"]).default("pending").notNull(),
  appliedAt: timestamp("appliedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

/**
 * Alerts table - stores anomalies and important events
 */
export const alerts = mysqlTable("alerts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  campaignId: varchar("campaignId", { length: 64 }),
  alertType: mysqlEnum("alertType", [
    "performance_drop",
    "budget_threshold",
    "anomaly_detected",
    "recommendation_available",
    "integration_error",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  actionUrl: varchar("actionUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow(),
  readAt: timestamp("readAt"),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

