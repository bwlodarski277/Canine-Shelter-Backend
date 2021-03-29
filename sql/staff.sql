CREATE TABLE `staff` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `userId` int,
    `locationId` int,
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
    FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`),
    UNIQUE (`userId`, `locationId`)
);