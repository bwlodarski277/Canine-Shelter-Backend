CREATE TABLE `dogBreeds` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `dogId` int,
    `breedId` int,
    `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`breedId`) REFERENCES `breeds` (`id`) ON DELETE CASCADE,
    UNIQUE (`dogId`, `breedId`)
);