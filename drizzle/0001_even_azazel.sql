CREATE TABLE `creditTransactions` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`amount` int NOT NULL,
	`type` enum('purchase','subscription','generation','refund','bonus') NOT NULL,
	`description` text,
	`generationId` varchar(64),
	`balanceAfter` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `creditTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generations` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`originalUrl` text NOT NULL,
	`imageCount` int NOT NULL,
	`aspectRatio` varchar(32) NOT NULL DEFAULT 'portrait',
	`prompt` text NOT NULL,
	`style` varchar(128),
	`cameraAngle` varchar(128),
	`lighting` varchar(128),
	`imageUrls` text NOT NULL,
	`status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`processingTime` int,
	`modelUsed` varchar(128) NOT NULL DEFAULT 'gemini-2.5-flash',
	`isFavorite` int NOT NULL DEFAULT 0,
	`isPublic` int NOT NULL DEFAULT 0,
	`views` int NOT NULL DEFAULT 0,
	`downloads` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `generations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptionPlans` (
	`id` varchar(64) NOT NULL,
	`name` varchar(64) NOT NULL,
	`displayName` varchar(128) NOT NULL,
	`description` text,
	`monthlyCredits` int NOT NULL,
	`priceMonthly` int NOT NULL,
	`priceYearly` int NOT NULL,
	`features` text NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `subscriptionPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `credits` int DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPlan` enum('free','basic','pro','unlimited') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStatus` enum('active','cancelled','expired') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionExpiresAt` timestamp;