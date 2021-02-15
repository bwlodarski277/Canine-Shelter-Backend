CREATE TABLE `dogBreeds` (
    `dogId` int,
    `breedId` int,
    FOREIGN KEY (`dogId`) REFERENCES `dogs` (`id`),
    FOREIGN KEY (`breedId`) REFERENCES `breeds` (`id`),
    PRIMARY KEY (`dogId`, `breedId`)
);