CREATE TABLE `dogLocations` (
    `dogId` int,
    `locationId` int,
    FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`),
    FOREIGN KEY (`locationId`) REFERENCES `locations` (`id`),
    PRIMARY KEY (`dogId`, `locationId`)
);