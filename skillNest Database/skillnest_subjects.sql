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
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `subjects_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES ('cmso7l8oj0000yfyjr0fx2a4m','English',NULL,'2026-08-11 05:17:32.084'),('cmso7l8p20001yfyjq7vj8ghm','Tamil',NULL,'2026-08-11 05:17:32.102'),('cmso7l8p50002yfyjmcm4y8rc','Math',NULL,'2026-08-11 05:17:32.105'),('cmso7l8p90003yfyjlrtoqubi','Science',NULL,'2026-08-11 05:17:32.109'),('cmso7l8pc0004yfyjget2v4vt','Yoga',NULL,'2026-08-11 05:17:32.112'),('cmso7l8pf0005yfyjkz9h1bz3','Music',NULL,'2026-08-11 05:17:32.115'),('cmso7l8ph0006yfyjvpd1nw8g','Classical Dance',NULL,'2026-08-11 05:17:32.117'),('cmso7l8pm0007yfyjn64kt7k9','Physics',NULL,'2026-08-11 05:17:32.122'),('cmso7l8pp0008yfyjy0c1wiyz','Chemistry',NULL,'2026-08-11 05:17:32.125'),('cmso7l8ps0009yfyj0i41mzpf','Biology',NULL,'2026-08-11 05:17:32.128'),('cmso7l8pv000ayfyjuj7zxc3a','Computer Science',NULL,'2026-08-11 05:17:32.131'),('cmso7l8py000byfyj5c0n2841','History',NULL,'2026-08-11 05:17:32.134'),('cmso7l8q0000cyfyj2oypxvuq','Geography',NULL,'2026-08-11 05:17:32.136'),('cmso7l8q2000dyfyj5pj8ov06','Economics',NULL,'2026-08-11 05:17:32.138'),('cmso7l8q4000eyfyjgq64uysi','Business Studies',NULL,'2026-08-11 05:17:32.140'),('cmso7l8q5000fyfyj11sp24as','Accountancy',NULL,'2026-08-11 05:17:32.141'),('cmso7l8q7000gyfyjuch4sq0m','Political Science',NULL,'2026-08-11 05:17:32.143'),('cmso7l8q9000hyfyjioowgpks','Sociology',NULL,'2026-08-11 05:17:32.145'),('cmso7l8qa000iyfyjmxqiy3pu','Psychology',NULL,'2026-08-11 05:17:32.146'),('cmso7l8qc000jyfyjdymoa7vw','Philosophy',NULL,'2026-08-11 05:17:32.148'),('cmso7l8qe000kyfyjxu8g689d','Sanskrit',NULL,'2026-08-11 05:17:32.150'),('cmso7l8qg000lyfyjavvyb3dj','Hindi',NULL,'2026-08-11 05:17:32.152'),('cmso7l8qj000myfyja8th56h7','French',NULL,'2026-08-11 05:17:32.155'),('cmso7l8ql000nyfyjnukeaita','German',NULL,'2026-08-11 05:17:32.157'),('cmso7l8qm000oyfyjm9jj41ah','Art',NULL,'2026-08-11 05:17:32.158'),('cmso7l8qo000pyfyjonbsglt2','Drawing',NULL,'2026-08-11 05:17:32.160'),('cmso7l8qq000qyfyj58lde4gx','Physical Education',NULL,'2026-08-11 05:17:32.162');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
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
