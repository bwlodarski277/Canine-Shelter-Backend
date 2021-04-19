CREATE TABLE `staff` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `userId` int,
    `locationId` int,
    `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`) ON DELETE CASCADE,
    UNIQUE (`userId`, `locationId`)
);