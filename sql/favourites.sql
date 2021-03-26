CREATE TABLE `favourites` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `userId` int,
    `dogId` int,
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
    FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`),
    UNIQUE (`userId`, `dogId`)
);