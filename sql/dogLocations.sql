CREATE TABLE `dogLocations` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `dogId` int,
    `locationId` int,
    FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`),
    FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`),
    UNIQUE (`dogId`, `locationId`)
);