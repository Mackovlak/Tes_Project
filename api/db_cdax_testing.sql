-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 27, 2025 at 05:15 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_cdax_testing`
--

-- --------------------------------------------------------

--
-- Table structure for table `asset_information`
--

CREATE TABLE `asset_information` (
  `AssetID` int(11) NOT NULL,
  `SerialNumber` varchar(20) NOT NULL,
  `ProductNumber` varchar(11) NOT NULL,
  `SiteAccountID` int(11) DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `asset_information`
--

INSERT INTO `asset_information` (`AssetID`, `SerialNumber`, `ProductNumber`, `SiteAccountID`, `ContactID`) VALUES
(1, '5CD2355XDD', '6G1L7PA', 1, 3),
(2, '5CG1329SV6', '483R7PA', 1, 2),
(3, '5CG1329SV7', '483R7PA', NULL, 1),
(4, '5CG2172BXY', '61G62PA', 4, 7),
(5, '5CG2202BXY', '483R7PA', 6, 11),
(6, '5CD2375XDD', '6G1L7PA', 3, 5),
(11, '5CG9087V5T', '6G1L7PA', NULL, 8),
(13, 'jojo', '67', 8, 13),
(14, '5CG1987SV6', '6G1L7PQ', 3, 5),
(15, '5CG2037CSB', '6G1L7PA', NULL, NULL),
(16, '5CG1329GST', '6G1LGL8', NULL, 15);

-- --------------------------------------------------------

--
-- Table structure for table `caseinformation`
--

CREATE TABLE `caseinformation` (
  `CaseID` int(11) NOT NULL,
  `SiteAccountID` int(11) DEFAULT NULL,
  `ContactID` int(11) DEFAULT NULL,
  `AssetID` int(11) DEFAULT NULL,
  `CaseSubject` varchar(255) DEFAULT NULL,
  `CaseType` varchar(100) DEFAULT NULL,
  `KCI_Flag` tinyint(1) DEFAULT 0,
  `IncomingChannel` varchar(100) DEFAULT NULL,
  `CaseStatus` varchar(50) DEFAULT NULL,
  `CasePriority` varchar(50) DEFAULT NULL,
  `CustomerSeverity` varchar(50) DEFAULT NULL,
  `CreatedOn` datetime DEFAULT current_timestamp(),
  `CaseClosedDate` datetime DEFAULT NULL,
  `CaseNote` text DEFAULT NULL,
  `SymptomCode` varchar(50) DEFAULT NULL,
  `CaseResolution` text DEFAULT NULL,
  `CreatedBy` int(11) DEFAULT NULL,
  `Owner` int(11) DEFAULT NULL,
  `WorkGround` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `caseinformation`
--

INSERT INTO `caseinformation` (`CaseID`, `SiteAccountID`, `ContactID`, `AssetID`, `CaseSubject`, `CaseType`, `KCI_Flag`, `IncomingChannel`, `CaseStatus`, `CasePriority`, `CustomerSeverity`, `CreatedOn`, `CaseClosedDate`, `CaseNote`, `SymptomCode`, `CaseResolution`, `CreatedBy`, `Owner`, `WorkGround`) VALUES
(1, 1, 3, 1, 'Ngawur', 'aaa', 0, NULL, NULL, NULL, NULL, '2025-03-22 13:10:17', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1801, 1, 2, 2, 'asdasd', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-27 08:52:40', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(5492, 8, 13, 13, 'juju', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-26 06:05:10', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(8644, 1, 2, 2, 'Kerusakan LCD', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-24 07:52:15', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(9811, NULL, 1, 3, 'a', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-22 09:56:09', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(10716, NULL, 1, 3, 'asd', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-27 11:58:04', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(28827, 1, 3, 1, 'asdasdasd', 'Item2', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-23 18:05:23', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(38197, 1, 3, 1, 'aasdasd', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-24 02:52:55', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(38541, NULL, 15, 16, 'asasa', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-27 15:47:17', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(42741, 1, 2, 1, '9820192891', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-24 07:39:54', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(54186, 6, 11, 5, 'asdasd', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-25 22:13:41', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(57599, 1, 2, 2, 'sadsd', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-27 09:18:22', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(64562, 1, 2, 2, 'asdas', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-25 22:04:13', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(71341, 1, 2, 1, '9820192891', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-24 07:39:54', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(74486, 4, 7, 4, 'sadas', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-25 22:21:47', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(81919, 1, 3, 1, 'asad', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-25 22:03:51', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(82129, 1, 2, 2, 'a', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-22 09:51:12', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(83521, NULL, 8, 11, 'asdasd', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-27 15:40:31', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(85893, 4, 7, 4, 'aset', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-25 20:53:28', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(87388, 3, 5, 14, 'sadas', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-27 05:58:33', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(91574, 1, 3, 1, 'as', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-25 21:07:28', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(92136, NULL, 13, 13, 'asdsad', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-27 09:56:18', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(97609, 1, 3, 1, 'asdasdasd', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-22 10:34:16', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL),
(99098, 4, 7, 4, 'sdasa', 'Depot Repair', 0, 'Email', 'Open', 'Medium', 'Normal', '2025-03-25 22:04:34', NULL, 'This is a sample case note.', 'General Issue', '', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `casenotes`
--

CREATE TABLE `casenotes` (
  `NoteID` int(11) NOT NULL,
  `CaseID` int(11) DEFAULT NULL,
  `LogType` varchar(50) DEFAULT NULL,
  `ActionType` varchar(50) DEFAULT NULL,
  `Template` varchar(100) DEFAULT NULL,
  `VisibleExternally` tinyint(1) DEFAULT 0,
  `MinutesSpent` int(11) DEFAULT NULL,
  `Note` text DEFAULT NULL,
  `CreatedOn` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contact_information`
--

CREATE TABLE `contact_information` (
  `ContactID` int(11) NOT NULL,
  `SiteAccountID` int(11) DEFAULT NULL,
  `Salutation` varchar(20) DEFAULT NULL,
  `FirstName` varchar(100) NOT NULL,
  `LastName` varchar(100) NOT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `PreferredLanguage` varchar(50) DEFAULT NULL,
  `Phone` varchar(50) DEFAULT NULL,
  `Mobile` varchar(50) DEFAULT NULL,
  `WorkPhone` varchar(50) DEFAULT NULL,
  `WorkExtension` varchar(10) DEFAULT NULL,
  `OtherPhone` varchar(50) DEFAULT NULL,
  `OtherExtension` varchar(10) DEFAULT NULL,
  `Fax` varchar(50) DEFAULT NULL,
  `AddressLine1` varchar(255) DEFAULT NULL,
  `AddressLine2` varchar(255) DEFAULT NULL,
  `City` varchar(100) DEFAULT NULL,
  `StateProvince` varchar(100) DEFAULT NULL,
  `Country` varchar(100) DEFAULT NULL,
  `ZipPostalCode` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contact_information`
--

INSERT INTO `contact_information` (`ContactID`, `SiteAccountID`, `Salutation`, `FirstName`, `LastName`, `Email`, `PreferredLanguage`, `Phone`, `Mobile`, `WorkPhone`, `WorkExtension`, `OtherPhone`, `OtherExtension`, `Fax`, `AddressLine1`, `AddressLine2`, `City`, `StateProvince`, `Country`, `ZipPostalCode`) VALUES
(1, NULL, 'Mr. ', 'RAFA', 'ELFARIZI', 'rafaelfarizi1@gmail.com', 'Bahasa Indonesia', '083834685279', '', '', '', '', '', '', 'Dukuh Cenang Desa Cenggini RT 03 RW 04', '', 'Kabupaten tegal', 'Jawa Tengah', 'Indonesia', '40511'),
(2, 1, 'Mrs. ', 'Mey', 'Almasya', 'mey-miku21@gmail.com', 'English', '085755162771', '085755162771', '', '', '', '', '', 'Surakarta', '', 'Solo', 'Jawa Tengah', 'Indonesia', '40511'),
(3, 1, 'Mr. ', 'Miku21', 'Margareth', 'mikucomunity21@gmail.com', 'English', '087731137512', '085755162771', '', '', '', '', '', 'Tegal', '', 'Kabupaten tegal', 'Jawa Tengah', 'Indonesia', '40511'),
(4, 2, 'Mrs. ', 'Meisa', 'Putra', 'meisaputra@gmail.co.id', 'Spanish', '089677544227', '087731137512', '', '', '', '', '', 'Dukuh Cenang Desa Cenggini RT 03 RW 04', '', 'Kabupaten tegal', 'Jawa Tengah', '', '40511'),
(5, 3, 'Mrs. ', 'Miku21', 'Margareth', 'mikucomunity21@gmail.com', 'Spanish', '087731137512', '', '', '', '', '', '', 'Dukuh Cenang Desa Cenggini RT 03 RW 04', '', 'Kabupaten tegal', 'Jawa Tengah', '', '40511'),
(6, NULL, 'Mrs. ', 'Meisa', 'Putra', 'Meisaputra@gmail.com', 'Spanish', '087731137512', '', '', '', '', '', '', 'Dukuh Cenang Desa Cenggini RT 03 RW 04', '', '', '', 'Indonesia', ''),
(7, 4, 'Mr. ', 'Aprilia', 'Margaret', 'afmmargareth@gmail.com', 'Bahasa Indonesia', '6287712341234', '', '', '', '', '', '', 'Jakarta Selatan', '', 'Jakarta', 'DKI Jakarta', 'Indonesia', '40511'),
(8, NULL, 'Mrs. ', 'Joko', 'Wi', 'jokowi@gmail.com', 'English', '89271123', '8928123', '', '', '', '', '', 'Jakarta Utara', '', 'Jakarta', 'bandung', 'Indonesia', '88201'),
(9, 4, 'Mrs. ', 'Fidelis', 'Margareth', 'mikucomunity21@gmail.com', 'English', '087731137512', '', '', '', '', '', '', 'Dukuh Cenang Desa Cenggini RT 03 RW 04', '', 'Kabupaten tegal', 'Jawa Tengah', '', '40511'),
(11, 6, 'Mrs. ', 'Aprilia', 'Margareth', 'mikucomunity21@gmail.com', 'English', '087731137512', '', '', '', '', '', '', 'Dukuh Cenang Desa Cenggini RT 03 RW 04', '', 'Kabupaten tegal', 'Jawa Tengah', '', '40511'),
(12, 7, 'Mr. ', 'RAFA', 'ELFARIZI', 'rafaelfarizi1@gmail.com', 'English', '083834685279', '', '', '', '', '', '', 'Dukuh Cenang Desa Cenggini RT 03 RW 04', '', 'Kabupaten tegal', 'Jawa Tengah', '', '40511'),
(13, 8, 'Mrs. ', 'Hida', 'Bee', 'Hildabee@gmail.com', 'Bahasa Indonesia', '878787', '9999', 'Cenggini', '', '', '', '', 'Yogyakarta', '', 'jau', 'nuuu', 'Singapura', '2222'),
(15, NULL, 'Mr. ', 'Ajax', 'Query', 'ajax@gmail.com', 'English', '082121212121', '082121212121', '', '', '', '', '', 'Java', '', 'Jawa', 'Jawa Tengah', 'Indonesia', '40511');

-- --------------------------------------------------------

--
-- Table structure for table `materialorder`
--

CREATE TABLE `materialorder` (
  `MOID` int(11) NOT NULL,
  `WOID` int(11) DEFAULT NULL,
  `OrderNumber` varchar(100) DEFAULT NULL,
  `OrderStatus` varchar(50) DEFAULT NULL,
  `OrderType` varchar(50) DEFAULT NULL,
  `CreatedOn` datetime DEFAULT current_timestamp(),
  `SalesOrderNumber` varchar(100) DEFAULT NULL,
  `RMANumber` varchar(100) DEFAULT NULL,
  `ReadyForClosureDate` datetime DEFAULT NULL,
  `Owner` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `materialorderlineitems`
--

CREATE TABLE `materialorderlineitems` (
  `LineItemID` int(11) NOT NULL,
  `MOID` int(11) DEFAULT NULL,
  `LineNumber` int(11) DEFAULT NULL,
  `PartNumber` varchar(100) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `ATPStatus` varchar(50) DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `Quantity` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product_information`
--

CREATE TABLE `product_information` (
  `ProductNumber` varchar(11) NOT NULL,
  `ProductLine` varchar(3) NOT NULL,
  `ProductName` varchar(255) NOT NULL,
  `ProductTypeID` int(11) NOT NULL,
  `end_of_sales_date` date DEFAULT NULL,
  `end_of_support_date` date DEFAULT NULL,
  `vendor` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_information`
--

INSERT INTO `product_information` (`ProductNumber`, `ProductLine`, `ProductName`, `ProductTypeID`, `end_of_sales_date`, `end_of_support_date`, `vendor`) VALUES
('483R7PA', 'KV', 'HP 14s-cf2500TX', 5, NULL, NULL, 'HP'),
('61G62PA', '6U', 'HP 245 G8', 5, NULL, NULL, 'HP'),
('67', 'jk', 'juju', 7, NULL, NULL, NULL),
('6G1L7PA', 'M7', 'Victus by HP 15.6 inch Gaming Laptop 15-fb0000 (598V1AV)', 5, NULL, NULL, 'HP'),
('6G1L7PQ', 'M7', 'Yui', 7, NULL, NULL, NULL),
('6G1LGL8', 'M7', 'Calculator X7', 7, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `product_type`
--

CREATE TABLE `product_type` (
  `ProductTypeID` int(11) NOT NULL,
  `ProductType` varchar(50) NOT NULL,
  `ProductTower` enum('PSG','IPG','') DEFAULT NULL,
  `ProductGroup` enum('Commercial','Consumer','') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_type`
--

INSERT INTO `product_type` (`ProductTypeID`, `ProductType`, `ProductTower`, `ProductGroup`) VALUES
(1, 'Accessories', 'PSG', 'Commercial'),
(2, 'Desktop', 'PSG', 'Consumer'),
(3, 'Tablet', 'PSG', 'Consumer'),
(4, 'Monitor', 'PSG', 'Consumer'),
(5, 'Notebook/Laptop', 'PSG', 'Consumer'),
(6, 'Desktop - C ', 'PSG', 'Consumer'),
(7, 'Calculator', 'PSG', 'Consumer');

-- --------------------------------------------------------

--
-- Table structure for table `servicecatalog`
--

CREATE TABLE `servicecatalog` (
  `ServiceCatalogID` int(11) NOT NULL,
  `ProductNumber` varchar(100) DEFAULT NULL,
  `ProductName` varchar(255) DEFAULT NULL,
  `SerialNumber` varchar(100) DEFAULT NULL,
  `WarrantyStatus` varchar(50) DEFAULT NULL,
  `Currency` varchar(10) DEFAULT NULL,
  `Price` decimal(10,2) DEFAULT NULL,
  `Tax` decimal(10,2) DEFAULT NULL,
  `Total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `servicecatalog_parts`
--

CREATE TABLE `servicecatalog_parts` (
  `PartID` int(11) NOT NULL,
  `ServiceCatalogID` int(11) DEFAULT NULL,
  `PartNumber` varchar(100) DEFAULT NULL,
  `Keyword` varchar(100) DEFAULT NULL,
  `PartDescription` text DEFAULT NULL,
  `Orderability` varchar(50) DEFAULT NULL,
  `RestrictionReason` text DEFAULT NULL,
  `CSR_Flag` tinyint(1) DEFAULT 0,
  `ROHS_Flag` tinyint(1) DEFAULT 0,
  `Returnable_Flag` tinyint(1) DEFAULT 0,
  `HardRoll_Flag` tinyint(1) DEFAULT 0,
  `DangerousGoods_Flag` tinyint(1) DEFAULT 0,
  `LithiumBattery_Flag` tinyint(1) DEFAULT 0,
  `Oversize_Flag` tinyint(1) DEFAULT 0,
  `Heavy_Flag` tinyint(1) DEFAULT 0,
  `Price` decimal(10,2) DEFAULT NULL,
  `FreightPrice` decimal(10,2) DEFAULT NULL,
  `Tax` decimal(10,2) DEFAULT NULL,
  `Total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `site_account`
--

CREATE TABLE `site_account` (
  `SiteAccountID` int(11) NOT NULL,
  `Company` varchar(255) NOT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `PrimaryPhone` varchar(50) DEFAULT NULL,
  `AddressLine1` varchar(255) NOT NULL,
  `AddressLine2` varchar(255) DEFAULT NULL,
  `City` varchar(100) NOT NULL,
  `StateProvince` varchar(100) DEFAULT NULL,
  `Country` varchar(100) NOT NULL,
  `ZipPostalCode` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `site_account`
--

INSERT INTO `site_account` (`SiteAccountID`, `Company`, `Email`, `PrimaryPhone`, `AddressLine1`, `AddressLine2`, `City`, `StateProvince`, `Country`, `ZipPostalCode`) VALUES
(1, 'Miku21 Store', 'mikucomunity21@gmail.com', '087731137512', 'Virtual', '', 'Virtual World', 'Virtual World', '', '40511'),
(2, 'PT Kapal Api', 'kapalapi@gmail.com', '087731137512', 'Jakarta Utara', '', 'Jakarta', 'DKI Jakarta', '', '40511'),
(3, 'Miku21Bot', 'rafaelfarizi1@gmail.com', '083834685279', 'Dukuh Cenang Desa Cenggini RT 03 RW 04', 'Tegal', 'Kabupaten tegal', 'Jawa Tengah', '', '40511'),
(4, 'AFM Company', 'afmcompany@gmail.com', '6289112341234', 'Jakarta Selatan', '', 'Jakarta', 'DKI Jakarta', '', '40511'),
(6, 'AFMC', 'mikucomunity21@gmail.com', '087731137512', '', '', 'Kabupaten tegal', 'Jawa Tengah', '', '40511'),
(7, 'UGM', 'ugm@gmail.com', '083834685279', '', '', 'Kabupaten tegal', 'Jawa Tengah', '', '40511'),
(8, 'Janu', 'Ari@gmail.com', '08777777', 'Surabaya', '', 'Kediri', 'Jawir', '', '23233');

-- --------------------------------------------------------

--
-- Table structure for table `workorder`
--

CREATE TABLE `workorder` (
  `WOID` int(11) NOT NULL,
  `CaseID` int(11) DEFAULT NULL,
  `ServiceCatalogID` int(11) DEFAULT NULL,
  `WorkOrderNumber` varchar(100) DEFAULT NULL,
  `WorkOrderType` varchar(50) DEFAULT NULL,
  `Priority` varchar(50) DEFAULT NULL,
  `SystemStatus` varchar(50) DEFAULT NULL,
  `SubStatus` varchar(50) DEFAULT NULL,
  `PreferredDay` date DEFAULT NULL,
  `PreferredTime` time DEFAULT NULL,
  `ShipmentCountry` varchar(50) DEFAULT NULL,
  `ShipmentState` varchar(50) DEFAULT NULL,
  `CreatedOn` datetime DEFAULT current_timestamp(),
  `Owner` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `asset_information`
--
ALTER TABLE `asset_information`
  ADD PRIMARY KEY (`AssetID`),
  ADD KEY `SiteAccountID` (`SiteAccountID`),
  ADD KEY `ContactID` (`ContactID`),
  ADD KEY `ProductNumber` (`ProductNumber`);

--
-- Indexes for table `caseinformation`
--
ALTER TABLE `caseinformation`
  ADD PRIMARY KEY (`CaseID`),
  ADD KEY `SiteAccountID` (`SiteAccountID`),
  ADD KEY `ContactID` (`ContactID`),
  ADD KEY `AssetID` (`AssetID`);

--
-- Indexes for table `casenotes`
--
ALTER TABLE `casenotes`
  ADD PRIMARY KEY (`NoteID`),
  ADD KEY `CaseID` (`CaseID`);

--
-- Indexes for table `contact_information`
--
ALTER TABLE `contact_information`
  ADD PRIMARY KEY (`ContactID`),
  ADD KEY `SiteAccountID` (`SiteAccountID`);

--
-- Indexes for table `materialorder`
--
ALTER TABLE `materialorder`
  ADD PRIMARY KEY (`MOID`),
  ADD KEY `WOID` (`WOID`);

--
-- Indexes for table `materialorderlineitems`
--
ALTER TABLE `materialorderlineitems`
  ADD PRIMARY KEY (`LineItemID`),
  ADD KEY `MOID` (`MOID`);

--
-- Indexes for table `product_information`
--
ALTER TABLE `product_information`
  ADD PRIMARY KEY (`ProductNumber`),
  ADD KEY `ProductTypeID` (`ProductTypeID`);

--
-- Indexes for table `product_type`
--
ALTER TABLE `product_type`
  ADD PRIMARY KEY (`ProductTypeID`);

--
-- Indexes for table `servicecatalog`
--
ALTER TABLE `servicecatalog`
  ADD PRIMARY KEY (`ServiceCatalogID`);

--
-- Indexes for table `servicecatalog_parts`
--
ALTER TABLE `servicecatalog_parts`
  ADD PRIMARY KEY (`PartID`),
  ADD KEY `ServiceCatalogID` (`ServiceCatalogID`);

--
-- Indexes for table `site_account`
--
ALTER TABLE `site_account`
  ADD PRIMARY KEY (`SiteAccountID`);

--
-- Indexes for table `workorder`
--
ALTER TABLE `workorder`
  ADD PRIMARY KEY (`WOID`),
  ADD KEY `CaseID` (`CaseID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `asset_information`
--
ALTER TABLE `asset_information`
  MODIFY `AssetID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `casenotes`
--
ALTER TABLE `casenotes`
  MODIFY `NoteID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contact_information`
--
ALTER TABLE `contact_information`
  MODIFY `ContactID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `materialorder`
--
ALTER TABLE `materialorder`
  MODIFY `MOID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `materialorderlineitems`
--
ALTER TABLE `materialorderlineitems`
  MODIFY `LineItemID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `product_type`
--
ALTER TABLE `product_type`
  MODIFY `ProductTypeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `servicecatalog`
--
ALTER TABLE `servicecatalog`
  MODIFY `ServiceCatalogID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `servicecatalog_parts`
--
ALTER TABLE `servicecatalog_parts`
  MODIFY `PartID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `site_account`
--
ALTER TABLE `site_account`
  MODIFY `SiteAccountID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `workorder`
--
ALTER TABLE `workorder`
  MODIFY `WOID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `asset_information`
--
ALTER TABLE `asset_information`
  ADD CONSTRAINT `asset_information_ibfk_1` FOREIGN KEY (`SiteAccountID`) REFERENCES `site_account` (`SiteAccountID`),
  ADD CONSTRAINT `asset_information_ibfk_2` FOREIGN KEY (`ContactID`) REFERENCES `contact_information` (`ContactID`),
  ADD CONSTRAINT `asset_information_ibfk_3` FOREIGN KEY (`ProductNumber`) REFERENCES `product_information` (`ProductNumber`);

--
-- Constraints for table `caseinformation`
--
ALTER TABLE `caseinformation`
  ADD CONSTRAINT `caseinformation_ibfk_1` FOREIGN KEY (`SiteAccountID`) REFERENCES `site_account` (`SiteAccountID`),
  ADD CONSTRAINT `caseinformation_ibfk_2` FOREIGN KEY (`ContactID`) REFERENCES `contact_information` (`ContactID`),
  ADD CONSTRAINT `caseinformation_ibfk_3` FOREIGN KEY (`AssetID`) REFERENCES `asset_information` (`AssetID`);

--
-- Constraints for table `casenotes`
--
ALTER TABLE `casenotes`
  ADD CONSTRAINT `casenotes_ibfk_1` FOREIGN KEY (`CaseID`) REFERENCES `caseinformation` (`CaseID`);

--
-- Constraints for table `contact_information`
--
ALTER TABLE `contact_information`
  ADD CONSTRAINT `contact_information_ibfk_1` FOREIGN KEY (`SiteAccountID`) REFERENCES `site_account` (`SiteAccountID`);

--
-- Constraints for table `materialorder`
--
ALTER TABLE `materialorder`
  ADD CONSTRAINT `materialorder_ibfk_1` FOREIGN KEY (`WOID`) REFERENCES `workorder` (`WOID`);

--
-- Constraints for table `materialorderlineitems`
--
ALTER TABLE `materialorderlineitems`
  ADD CONSTRAINT `materialorderlineitems_ibfk_1` FOREIGN KEY (`MOID`) REFERENCES `materialorder` (`MOID`);

--
-- Constraints for table `product_information`
--
ALTER TABLE `product_information`
  ADD CONSTRAINT `product_information_ibfk_1` FOREIGN KEY (`ProductTypeID`) REFERENCES `product_type` (`ProductTypeID`);

--
-- Constraints for table `servicecatalog_parts`
--
ALTER TABLE `servicecatalog_parts`
  ADD CONSTRAINT `servicecatalog_parts_ibfk_1` FOREIGN KEY (`ServiceCatalogID`) REFERENCES `servicecatalog` (`ServiceCatalogID`);

--
-- Constraints for table `workorder`
--
ALTER TABLE `workorder`
  ADD CONSTRAINT `workorder_ibfk_1` FOREIGN KEY (`CaseID`) REFERENCES `caseinformation` (`CaseID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
