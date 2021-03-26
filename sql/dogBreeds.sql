CREATE TABLE `dogBreeds` (
    `id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `dogId` int,
    `breedId` int,
    FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`),
    FOREIGN KEY (`breedId`) REFERENCES `breeds` (`id`),
    UNIQUE (`dogId`, `breedId`)
);