CREATE TABLE `favourites` (
    `userId` int,
    `dogId` int,
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
    FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`),
    PRIMARY KEY (`userId`, `dogId`)
);