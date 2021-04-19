CREATE TABLE `dogLocations` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `dogId` int,
    `locationId` int,
    FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`) ON DELETE CASCADE,
    UNIQUE (`dogId`, `locationId`)
);