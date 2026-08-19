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
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacherProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentUserId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reviews_teacherProfileId_studentUserId_key` (`teacherProfileId`,`studentUserId`),
  KEY `reviews_teacherProfileId_idx` (`teacherProfileId`),
  KEY `reviews_studentUserId_idx` (`studentUserId`),
  CONSTRAINT `reviews_studentUserId_fkey` FOREIGN KEY (`studentUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_teacherProfileId_fkey` FOREIGN KEY (`teacherProfileId`) REFERENCES `teacher_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES ('cmsopy5b30004qgyjadegka0r','cmsopy59y0001qgyj2tqrl1f2','cmsopy5ax0003qgyjc7la9pix',5,'Great teacher! Very knowledgeable and patient. Highly recommended for English learning.','2026-08-11 13:51:27.327','2026-08-11 13:51:27.327'),('cmsopy5bg0006qgyj495o8stc','cmsopy59y0001qgyj2tqrl1f2','cmsopy5ba0005qgyjain3kvkv',4,'Great teacher! Very knowledgeable and patient. Highly recommended for English learning.','2026-08-11 13:51:27.340','2026-08-11 13:51:27.340'),('cmsopy5bt0008qgyj61qsnd3u','cmsopy59y0001qgyj2tqrl1f2','cmsopy5bo0007qgyj08q5u97u',4,'Great teacher! Very knowledgeable and patient. Highly recommended for English learning.','2026-08-11 13:51:27.354','2026-08-11 13:51:27.354'),('cmsopy5d2000dqgyjvqy5i9f6','cmsopy5ck000aqgyjhsj19gdj','cmsopy5cx000cqgyjookx5zjk',5,'Great teacher! Very knowledgeable and patient. Highly recommended for Tamil learning.','2026-08-11 13:51:27.398','2026-08-11 13:51:27.398'),('cmsopy5db000fqgyjj3v3do40','cmsopy5ck000aqgyjhsj19gdj','cmsopy5d6000eqgyjumruc3wn',4,'Great teacher! Very knowledgeable and patient. Highly recommended for Tamil learning.','2026-08-11 13:51:27.407','2026-08-11 13:51:27.407'),('cmsopy5do000hqgyjw2w6z6of','cmsopy5ck000aqgyjhsj19gdj','cmsopy5di000gqgyjaz9f9nd5',4,'Great teacher! Very knowledgeable and patient. Highly recommended for Tamil learning.','2026-08-11 13:51:27.421','2026-08-11 13:51:27.421'),('cmsopy5ek000mqgyj2qkp81fh','cmsopy5e7000jqgyji0zpqce5','cmsopy5ei000lqgyj1syma5b2',5,'Great teacher! Very knowledgeable and patient. Highly recommended for Math learning.','2026-08-11 13:51:27.452','2026-08-11 13:51:27.452'),('cmsopy5ev000oqgyja9xnfo1s','cmsopy5e7000jqgyji0zpqce5','cmsopy5eq000nqgyj6aynh1xm',4,'Great teacher! Very knowledgeable and patient. Highly recommended for Math learning.','2026-08-11 13:51:27.463','2026-08-11 13:51:27.463'),('cmsopy5f7000qqgyjgag31ouy','cmsopy5e7000jqgyji0zpqce5','cmsopy5f0000pqgyjwe1voff5',4,'Great teacher! Very knowledgeable and patient. Highly recommended for Math learning.','2026-08-11 13:51:27.475','2026-08-11 13:51:27.475'),('cmsopy5g1000vqgyj6z0hcds7','cmsopy5fn000sqgyjiwadlkxh','cmsopy5fy000uqgyj9o7xqeqp',5,'Great teacher! Very knowledgeable and patient. Highly recommended for Science learning.','2026-08-11 13:51:27.505','2026-08-11 13:51:27.505'),('cmsopy5ge000xqgyjydxumxvh','cmsopy5fn000sqgyjiwadlkxh','cmsopy5g6000wqgyjz0umqkau',4,'Great teacher! Very knowledgeable and patient. Highly recommended for Science learning.','2026-08-11 13:51:27.518','2026-08-11 13:51:27.518'),('cmsopy5gr000zqgyjza3h81a6','cmsopy5fn000sqgyjiwadlkxh','cmsopy5go000yqgyj0w1k1ckf',4,'Great teacher! Very knowledgeable and patient. Highly recommended for Science learning.','2026-08-11 13:51:27.531','2026-08-11 13:51:27.531'),('cmsopy5hf0014qgyjl2xaqdzp','cmsopy5h20011qgyjbex1rwe9','cmsopy5hc0013qgyjtcgfpwnf',5,'Great teacher! Very knowledgeable and patient. Highly recommended for Yoga learning.','2026-08-11 13:51:27.555','2026-08-11 13:51:27.555'),('cmsopy5hn0016qgyjecwxwla9','cmsopy5h20011qgyjbex1rwe9','cmsopy5hj0015qgyjsqccwj6f',4,'Great teacher! Very knowledgeable and patient. Highly recommended for Yoga learning.','2026-08-11 13:51:27.563','2026-08-11 13:51:27.563'),('cmsopy5ht0018qgyjidfda0z6','cmsopy5h20011qgyjbex1rwe9','cmsopy5hq0017qgyjnukrci2i',4,'Great teacher! Very knowledgeable and patient. Highly recommended for Yoga learning.','2026-08-11 13:51:27.570','2026-08-11 13:51:27.570'),('cmsopy5ig001dqgyjwv87a6we','cmsopy5i3001aqgyjxhgl3zv3','cmsopy5id001cqgyjzyckvhwc',5,'Great teacher! Very knowledgeable and patient. Highly recommended for Music learning.','2026-08-11 13:51:27.592','2026-08-11 13:51:27.592'),('cmsopy5io001fqgyjx9h8ztnb','cmsopy5i3001aqgyjxhgl3zv3','cmsopy5ik001eqgyjwykbos7q',4,'Great teacher! Very knowledgeable and patient. Highly recommended for Music learning.','2026-08-11 13:51:27.600','2026-08-11 13:51:27.600'),('cmsopy5iv001hqgyj5uup9gj8','cmsopy5i3001aqgyjxhgl3zv3','cmsopy5is001gqgyjwsywgahi',4,'Great teacher! Very knowledgeable and patient. Highly recommended for Music learning.','2026-08-11 13:51:27.607','2026-08-11 13:51:27.607');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
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
