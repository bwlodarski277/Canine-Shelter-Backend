CREATE TABLE `chats` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `locationId` int NOT NULL,
    `userId` int NOT NULL,
    FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`),
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
    UNIQUE(`locationId`, `userId`)
);