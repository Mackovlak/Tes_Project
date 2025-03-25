-- CreateTable
CREATE TABLE `asset_information` (
    `AssetID` INTEGER NOT NULL,
    `SerialNumber` VARCHAR(20) NOT NULL,
    `ProductNumber` VARCHAR(11) NOT NULL,
    `SiteAccountID` INTEGER NULL,
    `ContactID` INTEGER NULL,

    INDEX `SiteAccountID`(`SiteAccountID`),
    INDEX `ContactID`(`ContactID`),
    INDEX `ProductNumber`(`ProductNumber`),
    PRIMARY KEY (`AssetID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `caseinformation` (
    `CaseID` INTEGER NOT NULL,
    `SiteAccountID` INTEGER NULL,
    `ContactID` INTEGER NULL,
    `AssetID` INTEGER NULL,
    `CaseSubject` VARCHAR(255) NULL,
    `CaseType` VARCHAR(100) NULL,
    `KCI_Flag` BOOLEAN NULL DEFAULT false,
    `IncomingChannel` VARCHAR(100) NULL,
    `CaseStatus` VARCHAR(50) NULL,
    `CasePriority` VARCHAR(50) NULL,
    `CustomerSeverity` VARCHAR(50) NULL,
    `CreatedOn` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `CaseClosedDate` DATETIME(0) NULL,
    `CaseNote` TEXT NULL,
    `SymptomCode` VARCHAR(50) NULL,
    `CaseResolution` TEXT NULL,

    INDEX `AssetID`(`AssetID`),
    INDEX `ContactID`(`ContactID`),
    INDEX `SiteAccountID`(`SiteAccountID`),
    PRIMARY KEY (`CaseID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `casenotes` (
    `NoteID` INTEGER NOT NULL AUTO_INCREMENT,
    `CaseID` INTEGER NULL,
    `LogType` VARCHAR(50) NULL,
    `ActionType` VARCHAR(50) NULL,
    `Template` VARCHAR(100) NULL,
    `VisibleExternally` BOOLEAN NULL DEFAULT false,
    `MinutesSpent` INTEGER NULL,
    `Note` TEXT NULL,
    `CreatedOn` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `CaseID`(`CaseID`),
    PRIMARY KEY (`NoteID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_information` (
    `ContactID` INTEGER NOT NULL AUTO_INCREMENT,
    `SiteAccountID` INTEGER NULL,
    `Salutation` VARCHAR(20) NULL,
    `FirstName` VARCHAR(100) NOT NULL,
    `LastName` VARCHAR(100) NOT NULL,
    `Email` VARCHAR(255) NULL,
    `PreferredLanguage` VARCHAR(50) NULL,
    `Phone` VARCHAR(50) NULL,
    `Mobile` VARCHAR(50) NULL,
    `WorkPhone` VARCHAR(50) NULL,
    `WorkExtension` VARCHAR(10) NULL,
    `OtherPhone` VARCHAR(50) NULL,
    `OtherExtension` VARCHAR(10) NULL,
    `Fax` VARCHAR(50) NULL,
    `AddressLine1` VARCHAR(255) NULL,
    `AddressLine2` VARCHAR(255) NULL,
    `City` VARCHAR(100) NULL,
    `StateProvince` VARCHAR(100) NULL,
    `Country` VARCHAR(100) NULL,
    `ZipPostalCode` VARCHAR(20) NULL,

    INDEX `SiteAccountID`(`SiteAccountID`),
    PRIMARY KEY (`ContactID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materialorder` (
    `MOID` INTEGER NOT NULL AUTO_INCREMENT,
    `WOID` INTEGER NULL,
    `OrderNumber` VARCHAR(100) NULL,
    `OrderStatus` VARCHAR(50) NULL,
    `OrderType` VARCHAR(50) NULL,
    `CreatedOn` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `SalesOrderNumber` VARCHAR(100) NULL,
    `RMANumber` VARCHAR(100) NULL,
    `ReadyForClosureDate` DATETIME(0) NULL,
    `Owner` VARCHAR(100) NULL,

    INDEX `WOID`(`WOID`),
    PRIMARY KEY (`MOID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materialorderlineitems` (
    `LineItemID` INTEGER NOT NULL AUTO_INCREMENT,
    `MOID` INTEGER NULL,
    `LineNumber` INTEGER NULL,
    `PartNumber` VARCHAR(100) NULL,
    `Description` TEXT NULL,
    `ATPStatus` VARCHAR(50) NULL,
    `Price` DECIMAL(10, 2) NULL,
    `Quantity` INTEGER NULL,

    INDEX `MOID`(`MOID`),
    PRIMARY KEY (`LineItemID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicecatalog` (
    `ServiceCatalogID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProductNumber` VARCHAR(100) NULL,
    `ProductName` VARCHAR(255) NULL,
    `SerialNumber` VARCHAR(100) NULL,
    `WarrantyStatus` VARCHAR(50) NULL,
    `Currency` VARCHAR(10) NULL,
    `Price` DECIMAL(10, 2) NULL,
    `Tax` DECIMAL(10, 2) NULL,
    `Total` DECIMAL(10, 2) NULL,

    PRIMARY KEY (`ServiceCatalogID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servicecatalog_parts` (
    `PartID` INTEGER NOT NULL AUTO_INCREMENT,
    `ServiceCatalogID` INTEGER NULL,
    `PartNumber` VARCHAR(100) NULL,
    `Keyword` VARCHAR(100) NULL,
    `PartDescription` TEXT NULL,
    `Orderability` VARCHAR(50) NULL,
    `RestrictionReason` TEXT NULL,
    `CSR_Flag` BOOLEAN NULL DEFAULT false,
    `ROHS_Flag` BOOLEAN NULL DEFAULT false,
    `Returnable_Flag` BOOLEAN NULL DEFAULT false,
    `HardRoll_Flag` BOOLEAN NULL DEFAULT false,
    `DangerousGoods_Flag` BOOLEAN NULL DEFAULT false,
    `LithiumBattery_Flag` BOOLEAN NULL DEFAULT false,
    `Oversize_Flag` BOOLEAN NULL DEFAULT false,
    `Heavy_Flag` BOOLEAN NULL DEFAULT false,
    `Price` DECIMAL(10, 2) NULL,
    `FreightPrice` DECIMAL(10, 2) NULL,
    `Tax` DECIMAL(10, 2) NULL,
    `Total` DECIMAL(10, 2) NULL,

    INDEX `ServiceCatalogID`(`ServiceCatalogID`),
    PRIMARY KEY (`PartID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_account` (
    `SiteAccountID` INTEGER NOT NULL AUTO_INCREMENT,
    `Company` VARCHAR(255) NOT NULL,
    `Email` VARCHAR(255) NULL,
    `PrimaryPhone` VARCHAR(50) NULL,
    `AddressLine1` VARCHAR(255) NOT NULL,
    `AddressLine2` VARCHAR(255) NULL,
    `City` VARCHAR(100) NOT NULL,
    `StateProvince` VARCHAR(100) NULL,
    `Country` VARCHAR(100) NOT NULL,
    `ZipPostalCode` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`SiteAccountID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workorder` (
    `WOID` INTEGER NOT NULL AUTO_INCREMENT,
    `CaseID` INTEGER NULL,
    `ServiceCatalogID` INTEGER NULL,
    `WorkOrderNumber` VARCHAR(100) NULL,
    `WorkOrderType` VARCHAR(50) NULL,
    `Priority` VARCHAR(50) NULL,
    `SystemStatus` VARCHAR(50) NULL,
    `SubStatus` VARCHAR(50) NULL,
    `PreferredDay` DATE NULL,
    `PreferredTime` TIME(0) NULL,
    `ShipmentCountry` VARCHAR(50) NULL,
    `ShipmentState` VARCHAR(50) NULL,
    `CreatedOn` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `Owner` VARCHAR(100) NULL,

    INDEX `CaseID`(`CaseID`),
    PRIMARY KEY (`WOID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_information` (
    `ProductNumber` VARCHAR(11) NOT NULL,
    `ProductLine` VARCHAR(3) NOT NULL,
    `ProductName` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`ProductNumber`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `asset_information` ADD CONSTRAINT `asset_information_ibfk_1` FOREIGN KEY (`SiteAccountID`) REFERENCES `site_account`(`SiteAccountID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `asset_information` ADD CONSTRAINT `asset_information_ibfk_2` FOREIGN KEY (`ContactID`) REFERENCES `contact_information`(`ContactID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `asset_information` ADD CONSTRAINT `asset_information_ibfk_3` FOREIGN KEY (`ProductNumber`) REFERENCES `product_information`(`ProductNumber`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `caseinformation` ADD CONSTRAINT `caseinformation_ibfk_1` FOREIGN KEY (`SiteAccountID`) REFERENCES `site_account`(`SiteAccountID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `caseinformation` ADD CONSTRAINT `caseinformation_ibfk_2` FOREIGN KEY (`ContactID`) REFERENCES `contact_information`(`ContactID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `caseinformation` ADD CONSTRAINT `caseinformation_ibfk_3` FOREIGN KEY (`AssetID`) REFERENCES `asset_information`(`AssetID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `casenotes` ADD CONSTRAINT `casenotes_ibfk_1` FOREIGN KEY (`CaseID`) REFERENCES `caseinformation`(`CaseID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `contact_information` ADD CONSTRAINT `contact_information_ibfk_1` FOREIGN KEY (`SiteAccountID`) REFERENCES `site_account`(`SiteAccountID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `materialorder` ADD CONSTRAINT `materialorder_ibfk_1` FOREIGN KEY (`WOID`) REFERENCES `workorder`(`WOID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `materialorderlineitems` ADD CONSTRAINT `materialorderlineitems_ibfk_1` FOREIGN KEY (`MOID`) REFERENCES `materialorder`(`MOID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `servicecatalog_parts` ADD CONSTRAINT `servicecatalog_parts_ibfk_1` FOREIGN KEY (`ServiceCatalogID`) REFERENCES `servicecatalog`(`ServiceCatalogID`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `workorder` ADD CONSTRAINT `workorder_ibfk_1` FOREIGN KEY (`CaseID`) REFERENCES `caseinformation`(`CaseID`) ON DELETE RESTRICT ON UPDATE RESTRICT;
