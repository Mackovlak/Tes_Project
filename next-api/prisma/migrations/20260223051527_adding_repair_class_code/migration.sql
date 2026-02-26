-- AlterTable
ALTER TABLE `caseinformation` ADD COLUMN `IsRerepair` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `RerepairCode` VARCHAR(3) NULL;

-- AddForeignKey
ALTER TABLE `caseinformation` ADD CONSTRAINT `caseinformation_RerepairCode_fkey` FOREIGN KEY (`RerepairCode`) REFERENCES `repairClassCode`(`Code`) ON DELETE RESTRICT ON UPDATE CASCADE;
