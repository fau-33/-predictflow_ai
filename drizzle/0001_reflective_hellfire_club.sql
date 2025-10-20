CREATE TABLE `alerts` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`campaignId` varchar(64),
	`alertType` enum('performance_drop','budget_threshold','anomaly_detected','recommendation_available','integration_error') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`isRead` boolean NOT NULL DEFAULT false,
	`actionUrl` varchar(500),
	`createdAt` timestamp DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaignMetrics` (
	`id` varchar(64) NOT NULL,
	`campaignId` varchar(64) NOT NULL,
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`conversions` int DEFAULT 0,
	`spend` decimal(10,2) DEFAULT '0',
	`revenue` decimal(10,2) DEFAULT '0',
	`ctr` decimal(5,2) DEFAULT '0',
	`cpc` decimal(10,2) DEFAULT '0',
	`roas` decimal(5,2) DEFAULT '0',
	`engagementRate` decimal(5,2) DEFAULT '0',
	`recordedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `campaignMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`integrationId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`campaignType` enum('email','social_media','paid_ads','content') NOT NULL,
	`status` enum('draft','scheduled','running','completed','paused') NOT NULL DEFAULT 'draft',
	`budget` decimal(10,2),
	`startDate` timestamp,
	`endDate` timestamp,
	`targetAudience` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `integrations` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`platform` enum('google_analytics','facebook_ads','mailchimp','hubspot','manual_upload') NOT NULL,
	`name` varchar(255) NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`accountId` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` varchar(64) NOT NULL,
	`campaignId` varchar(64) NOT NULL,
	`predictionType` enum('performance','conversion_rate','optimal_timing','audience_segment','content_performance') NOT NULL,
	`predictedValue` decimal(10,2),
	`confidence` decimal(5,2),
	`insights` text,
	`recommendation` text,
	`actualValue` decimal(10,2),
	`accuracy` decimal(5,2),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` varchar(64) NOT NULL,
	`campaignId` varchar(64) NOT NULL,
	`recommendationType` enum('headline_optimization','audience_segmentation','send_time_optimization','budget_allocation','content_suggestion') NOT NULL,
	`currentValue` text,
	`suggestedValue` text,
	`expectedImpact` decimal(5,2),
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('pending','applied','dismissed') NOT NULL DEFAULT 'pending',
	`appliedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `recommendations_id` PRIMARY KEY(`id`)
);
