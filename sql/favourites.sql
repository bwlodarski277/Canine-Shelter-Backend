CREATE TABLE `favourites` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `userId` int,
    `dogId` int,
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`) ON DELETE CASCADE,
    UNIQUE (`userId`, `dogId`)
);