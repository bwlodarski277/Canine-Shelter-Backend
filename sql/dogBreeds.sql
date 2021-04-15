CREATE TABLE `dogBreeds` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `dogId` int,
    `breedId` int,
    FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`breedId`) REFERENCES `breeds` (`id`) ON DELETE CASCADE,
    UNIQUE (`dogId`, `breedId`)
);