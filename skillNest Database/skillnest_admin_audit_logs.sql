-- MySQL dump 10.13  Distrib 8.0.46, for macos15 (arm64)
--
-- Host: 127.0.0.1    Database: skillnest
-- ------------------------------------------------------
-- Server version	9.7.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '90e3b75a-8984-11f1-8926-91b3cef04793:1-191';

--
-- Table structure for table `admin_audit_logs`
--

DROP TABLE IF EXISTS `admin_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_audit_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adminUserId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `targetType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `targetId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `admin_audit_logs_adminUserId_idx` (`adminUserId`),
  KEY `admin_audit_logs_targetType_targetId_idx` (`targetType`,`targetId`),
  KEY `admin_audit_logs_createdAt_idx` (`createdAt`),
  CONSTRAINT `admin_audit_logs_adminUserId_fkey` FOREIGN KEY (`adminUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_audit_logs`
--

LOCK TABLES `admin_audit_logs` WRITE;
/*!40000 ALTER TABLE `admin_audit_logs` DISABLE KEYS */;
INSERT INTO `admin_audit_logs` VALUES ('cmsori7n00003odyjy0ie94te','cmsmx1xzw0000m0yjn7o2khs4','TEACHER_PHOTO_UPDATED','TeacherProfile','cmsopy5i3001aqgyjxhgl3zv3','Admin updated profile photo for teacher','2026-08-11 14:35:03.084'),('cmsorl0dm0004odyjayar7ccs','cmsmx1xzw0000m0yjn7o2khs4','TEACHER_PHOTO_UPDATED','TeacherProfile','cmsopy5h20011qgyjbex1rwe9','Admin updated profile photo for teacher','2026-08-11 14:37:13.642'),('cmsorl4430005odyjwmhycqfl','cmsmx1xzw0000m0yjn7o2khs4','TEACHER_PHOTO_UPDATED','TeacherProfile','cmsopy5fn000sqgyjiwadlkxh','Admin updated profile photo for teacher','2026-08-11 14:37:18.483'),('cmsorl85g0006odyjt52fzsdd','cmsmx1xzw0000m0yjn7o2khs4','TEACHER_PHOTO_UPDATED','TeacherProfile','cmsopy5e7000jqgyji0zpqce5','Admin updated profile photo for teacher','2026-08-11 14:37:23.716'),('cmsorlezh0007odyjg4vf95n0','cmsmx1xzw0000m0yjn7o2khs4','TEACHER_PHOTO_UPDATED','TeacherProfile','cmsopy5ck000aqgyjhsj19gdj','Admin updated profile photo for teacher','2026-08-11 14:37:32.573'),('cmsorlk7c0008odyjr5ge4gy7','cmsmx1xzw0000m0yjn7o2khs4','TEACHER_PHOTO_UPDATED','TeacherProfile','cmsopy59y0001qgyj2tqrl1f2','Admin updated profile photo for teacher','2026-08-11 14:37:39.336');
/*!40000 ALTER TABLE `admin_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-19  9:16:35
