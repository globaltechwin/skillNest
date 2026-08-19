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
-- Table structure for table `teacher_profiles`
--

DROP TABLE IF EXISTS `teacher_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_profiles` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING_VERIFICATION','APPROVED','REJECTED','SUSPENDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING_VERIFICATION',
  `bio` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profilePhotoUrl` mediumtext COLLATE utf8mb4_unicode_ci,
  `teachingMode` enum('ONLINE','OFFLINE','BOTH') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BOTH',
  `yearsOfExperience` int NOT NULL DEFAULT '0',
  `hourlyRate` double NOT NULL DEFAULT '0',
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INR',
  `pricingUnit` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'hour',
  `teachingApproach` text COLLATE utf8mb4_unicode_ci,
  `offlineLocation` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `availableFrom` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `availableTo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `languages` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewNote` text COLLATE utf8mb4_unicode_ci,
  `teachingLevels` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teacher_profiles_userId_key` (`userId`),
  KEY `teacher_profiles_status_idx` (`status`),
  KEY `teacher_profiles_location_idx` (`location`),
  KEY `teacher_profiles_teachingMode_idx` (`teachingMode`),
  KEY `teacher_profiles_yearsOfExperience_idx` (`yearsOfExperience`),
  KEY `teacher_profiles_hourlyRate_idx` (`hourlyRate`),
  CONSTRAINT `teacher_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_profiles`
--

LOCK TABLES `teacher_profiles` WRITE;
/*!40000 ALTER TABLE `teacher_profiles` DISABLE KEYS */;
INSERT INTO `teacher_profiles` VALUES ('cmsn2f84d0007pdyjwwzmq9g2','cmsn2f83o0006pdyjg33pqsf8','APPROVED',NULL,NULL,NULL,NULL,NULL,'BOTH',0,0,'INR','hour',NULL,NULL,NULL,NULL,'2026-08-10 10:05:07.166','2026-08-10 10:10:43.303',NULL,NULL,NULL),('cmsopy59y0001qgyj2tqrl1f2','cmsopy56w0000qgyjkz9n1om2','APPROVED','Experienced English teacher with expertise in communication skills, grammar, and creative writing. Passionate about helping students achieve fluency.',NULL,NULL,'Chennai','/uploads/teacher-cmsopy59y0001qgyj2tqrl1f2-1786459059322.jpg','BOTH',8,900,'INR','hour',NULL,NULL,NULL,NULL,'2026-08-11 13:51:27.286','2026-08-11 14:37:39.327','English, Hindi, Tamil',NULL,'High School (9-10), Higher Secondary (11-12)'),('cmsopy5ck000aqgyjhsj19gdj','cmsopy5c90009qgyj894fi9v1','APPROVED','Dedicated Tamil language teacher with a decade of experience. Specializes in Tamil literature, poetry, and spoken Tamil for all levels.',NULL,NULL,'Madurai','/uploads/teacher-cmsopy5ck000aqgyjhsj19gdj-1786459052565.jpg','BOTH',10,1000,'INR','hour',NULL,NULL,NULL,NULL,'2026-08-11 13:51:27.380','2026-08-11 14:37:32.568','Tamil, English',NULL,'Elementary (1-5), Middle School (6-8), High School (9-10)'),('cmsopy5e7000jqgyji0zpqce5','cmsopy5dx000iqgyj39lj46fb','APPROVED','Mathematics expert making complex concepts simple and fun. Specializes in algebra, calculus, and competitive exam preparation.',NULL,NULL,'Bangalore','/uploads/teacher-cmsopy5e7000jqgyji0zpqce5-1786459043704.jpg','ONLINE',9,950,'INR','hour',NULL,NULL,NULL,NULL,'2026-08-11 13:51:27.439','2026-08-11 14:37:23.707','English, Tamil, Kannada',NULL,'High School (9-10), Higher Secondary (11-12)'),('cmsopy5fn000sqgyjiwadlkxh','cmsopy5ff000rqgyj60nh5cbf','APPROVED','Passionate science teacher bringing chemistry, physics, and biology to life through experiments and real-world applications.',NULL,NULL,'Coimbatore','/uploads/teacher-cmsopy5fn000sqgyjiwadlkxh-1786459038469.jpg','BOTH',7,850,'INR','hour',NULL,NULL,NULL,NULL,'2026-08-11 13:51:27.491','2026-08-11 14:37:18.473','English, Tamil',NULL,'Middle School (6-8), High School (9-10)'),('cmsopy5h20011qgyjbex1rwe9','cmsopy5gx0010qgyj6b38inzr','APPROVED','Certified yoga instructor specializing in Hatha and Vinyasa yoga. Helps students achieve physical and mental wellness through practice.',NULL,NULL,'Chennai','/uploads/teacher-cmsopy5h20011qgyjbex1rwe9-1786459033619.jpg','BOTH',6,800,'INR','hour',NULL,NULL,NULL,NULL,'2026-08-11 13:51:27.542','2026-08-11 14:37:13.625','English, Hindi, Tamil',NULL,'All Levels'),('cmsopy5i3001aqgyjxhgl3zv3','cmsopy5hy0019qgyjxs2usycg','APPROVED','Classical and contemporary music teacher with 12 years of experience. Teaches vocals, music theory, and compositions across genres.',NULL,NULL,'Chennai','/uploads/teacher-cmsopy5i3001aqgyjxhgl3zv3-1786458903066.jpg','BOTH',12,1100,'INR','hour',NULL,NULL,NULL,NULL,'2026-08-11 13:51:27.579','2026-08-11 14:35:03.071','English, Tamil, Telugu',NULL,'All Levels');
/*!40000 ALTER TABLE `teacher_profiles` ENABLE KEYS */;
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
