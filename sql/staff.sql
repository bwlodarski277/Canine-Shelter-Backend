CREATE TABLE `staff` (
    `id` int PRIMARY KEY,
    `userId` int,
    `locationId` int,
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
    FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`)
);