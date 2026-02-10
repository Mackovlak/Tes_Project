-- DropForeignKey
ALTER TABLE `asset_information` DROP FOREIGN KEY `asset_information_ibfk_1`;

-- DropForeignKey
ALTER TABLE `asset_information` DROP FOREIGN KEY `asset_information_ibfk_2`;

-- DropForeignKey
ALTER TABLE `asset_information` DROP FOREIGN KEY `asset_information_ibfk_3`;

-- DropForeignKey
ALTER TABLE `caseinformation` DROP FOREIGN KEY `caseinformation_ibfk_1`;

-- DropForeignKey
ALTER TABLE `caseinformation` DROP FOREIGN KEY `caseinformation_ibfk_2`;

-- DropForeignKey
ALTER TABLE `caseinformation` DROP FOREIGN KEY `caseinformation_ibfk_3`;

-- DropForeignKey
ALTER TABLE `caseinformation` DROP FOREIGN KEY `caseinformation_ibfk_4`;

-- DropForeignKey
ALTER TABLE `caseinformation` DROP FOREIGN KEY `caseinformation_ibfk_5`;

-- DropForeignKey
ALTER TABLE `casenotes` DROP FOREIGN KEY `casenotes_ibfk_1`;

-- DropForeignKey
ALTER TABLE `contact_information` DROP FOREIGN KEY `contact_information_ibfk_1`;

-- DropForeignKey
ALTER TABLE `product_information` DROP FOREIGN KEY `product_information_ibfk_1`;

-- AddForeignKey
ALTER TABLE `asset_information` ADD CONSTRAINT `asset_information_ibfk_1` FOREIGN KEY (`SiteAccountID`) REFERENCES `site_account`(`SiteAccountID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_information` ADD CONSTRAINT `asset_information_ibfk_2` FOREIGN KEY (`ContactID`) REFERENCES `contact_information`(`ContactID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_information` ADD CONSTRAINT `asset_information_ibfk_3` FOREIGN KEY (`ProductNumber`) REFERENCES `product_information`(`ProductNumber`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caseinformation` ADD CONSTRAINT `caseinformation_ibfk_1` FOREIGN KEY (`SiteAccountID`) REFERENCES `site_account`(`SiteAccountID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caseinformation` ADD CONSTRAINT `caseinformation_ibfk_2` FOREIGN KEY (`ContactID`) REFERENCES `contact_information`(`ContactID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caseinformation` ADD CONSTRAINT `caseinformation_ibfk_3` FOREIGN KEY (`AssetID`) REFERENCES `asset_information`(`AssetID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caseinformation` ADD CONSTRAINT `caseinformation_ibfk_4` FOREIGN KEY (`CaseNote`) REFERENCES `casenotes`(`NoteID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `caseinformation` ADD CONSTRAINT `caseinformation_ibfk_5` FOREIGN KEY (`SymptomCode`) REFERENCES `symptom_codes`(`SymptomCodeID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `casenotes` ADD CONSTRAINT `casenotes_ibfk_1` FOREIGN KEY (`CaseID`) REFERENCES `caseinformation`(`CaseID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_information` ADD CONSTRAINT `contact_information_ibfk_1` FOREIGN KEY (`SiteAccountID`) REFERENCES `site_account`(`SiteAccountID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_information` ADD CONSTRAINT `product_information_ibfk_1` FOREIGN KEY (`ProductTypeID`) REFERENCES `product_type`(`ProductTypeID`) ON DELETE RESTRICT ON UPDATE CASCADE;
