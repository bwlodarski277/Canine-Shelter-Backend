CREATE TABLE `chats` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `locationId` int NOT NULL,
    `userId` int NOT NULL,
    FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    UNIQUE(`locationId`, `userId`)
);