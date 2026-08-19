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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `clerkUserId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('STUDENT','TEACHER','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STUDENT',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_clerkUserId_key` (`clerkUserId`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('83475069-af49-4c1d-8970-24a31470262b','72f5d9c2-3b02-4796-a55b-f55bb1095ec8','test-verify-$(date +%s)@test.com','Test','User','STUDENT','2026-08-12 12:45:34.018','2026-08-12 12:45:34.018','0212042e7aab1445194a5c60c8e3b5f9:1befc2a4a4515612b924ab4a3eef3409a2ab0d3c79468e46cd110cd6b6a4e32cd9903bea5876b5488a87ba0527cd2e08e56d914146bcd7b8acfe7bf60bc7d273'),('cmsmutjkv0000syyjjuzzbhzz','user_3HiFxAvoUGuwWEFEKeYh6PHooxP','yuvanthcsc2025@gmail.com','Yuvanth','V','STUDENT','2026-08-10 06:32:18.271','2026-08-10 06:32:18.271','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsmx1xzw0000m0yjn7o2khs4','user_3HiO4a7L7nTTHyf8AiACWWJq82I','admin@gmail.com','Admin','User','ADMIN','2026-08-10 07:34:49.436','2026-08-10 07:34:49.436','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsmx38t80001syyj48wcevh7','user_3HjJRzdX2TG34YfBf3mfQiBNHUT','sheru.dev03@gmail.com','Yuvanth',NULL,'STUDENT','2026-08-10 07:35:50.109','2026-08-10 15:25:42.229','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsn2f83o0006pdyjg33pqsf8','user_3HigSor3hAGqy5LSWcrY8Xu91Pw','yuvanthv1029@gmail.com','Yuvanth','Veluru','TEACHER','2026-08-10 10:05:07.140','2026-08-10 10:05:07.140','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy56w0000qgyjkz9n1om2','demo_teacher_priya_1786456287169','priya.sharma@skillnest.demo','Priya','Sharma','TEACHER','2026-08-11 13:51:27.176','2026-08-11 13:51:27.176','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5ax0003qgyjc7la9pix','demo_student_priya_0_1786456287317','student1_priya@demo.com','Student1','Priya','STUDENT','2026-08-11 13:51:27.321','2026-08-11 13:51:27.321','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5ba0005qgyjain3kvkv','demo_student_priya_1_1786456287333','student2_priya@demo.com','Student2','Priya','STUDENT','2026-08-11 13:51:27.334','2026-08-11 13:51:27.334','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5bo0007qgyj08q5u97u','demo_student_priya_2_1786456287346','student3_priya@demo.com','Student3','Priya','STUDENT','2026-08-11 13:51:27.348','2026-08-11 13:51:27.348','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5c90009qgyj894fi9v1','demo_teacher_karthik_1786456287366','karthik.b@skillnest.demo','Karthik','B','TEACHER','2026-08-11 13:51:27.369','2026-08-11 13:51:27.369','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5cx000cqgyjookx5zjk','demo_student_karthik_0_1786456287390','student1_karthik@demo.com','Student1','Karthik','STUDENT','2026-08-11 13:51:27.393','2026-08-11 13:51:27.393','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5d6000eqgyjumruc3wn','demo_student_karthik_1_1786456287401','student2_karthik@demo.com','Student2','Karthik','STUDENT','2026-08-11 13:51:27.402','2026-08-11 13:51:27.402','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5di000gqgyjaz9f9nd5','demo_student_karthik_2_1786456287412','student3_karthik@demo.com','Student3','Karthik','STUDENT','2026-08-11 13:51:27.414','2026-08-11 13:51:27.414','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5dx000iqgyj39lj46fb','demo_teacher_aravind_1786456287425','aravind.r@skillnest.demo','Aravind','R','TEACHER','2026-08-11 13:51:27.429','2026-08-11 13:51:27.429','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5ei000lqgyj1syma5b2','demo_student_aravind_0_1786456287448','student1_aravind@demo.com','Student1','Aravind','STUDENT','2026-08-11 13:51:27.450','2026-08-11 13:51:27.450','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5eq000nqgyj6aynh1xm','demo_student_aravind_1_1786456287456','student2_aravind@demo.com','Student2','Aravind','STUDENT','2026-08-11 13:51:27.458','2026-08-11 13:51:27.458','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5f0000pqgyjwe1voff5','demo_student_aravind_2_1786456287465','student3_aravind@demo.com','Student3','Aravind','STUDENT','2026-08-11 13:51:27.468','2026-08-11 13:51:27.468','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5ff000rqgyj60nh5cbf','demo_teacher_revathi_1786456287481','revathi.s@skillnest.demo','Revathi','S','TEACHER','2026-08-11 13:51:27.484','2026-08-11 13:51:27.484','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5fy000uqgyj9o7xqeqp','demo_student_revathi_0_1786456287501','student1_revathi@demo.com','Student1','Revathi','STUDENT','2026-08-11 13:51:27.502','2026-08-11 13:51:27.502','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5g6000wqgyjz0umqkau','demo_student_revathi_1_1786456287508','student2_revathi@demo.com','Student2','Revathi','STUDENT','2026-08-11 13:51:27.510','2026-08-11 13:51:27.510','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5go000yqgyj0w1k1ckf','demo_student_revathi_2_1786456287526','student3_revathi@demo.com','Student3','Revathi','STUDENT','2026-08-11 13:51:27.528','2026-08-11 13:51:27.528','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5gx0010qgyj6b38inzr','demo_teacher_ananya_1786456287536','ananya@skillnest.demo','Ananya','','TEACHER','2026-08-11 13:51:27.537','2026-08-11 13:51:27.537','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5hc0013qgyjtcgfpwnf','demo_student_ananya_0_1786456287551','student1_ananya@demo.com','Student1','Ananya','STUDENT','2026-08-11 13:51:27.552','2026-08-11 13:51:27.552','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5hj0015qgyjsqccwj6f','demo_student_ananya_1_1786456287557','student2_ananya@demo.com','Student2','Ananya','STUDENT','2026-08-11 13:51:27.559','2026-08-11 13:51:27.559','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5hq0017qgyjnukrci2i','demo_student_ananya_2_1786456287565','student3_ananya@demo.com','Student3','Ananya','STUDENT','2026-08-11 13:51:27.566','2026-08-11 13:51:27.566','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5hy0019qgyjxs2usycg','demo_teacher_suresh_1786456287573','suresh.k@skillnest.demo','Suresh','K','TEACHER','2026-08-11 13:51:27.574','2026-08-11 13:51:27.574','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5id001cqgyjzyckvhwc','demo_student_suresh_0_1786456287587','student1_suresh@demo.com','Student1','Suresh','STUDENT','2026-08-11 13:51:27.589','2026-08-11 13:51:27.589','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5ik001eqgyjwykbos7q','demo_student_suresh_1_1786456287595','student2_suresh@demo.com','Student2','Suresh','STUDENT','2026-08-11 13:51:27.596','2026-08-11 13:51:27.596','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsopy5is001gqgyjwsywgahi','demo_student_suresh_2_1786456287603','student3_suresh@demo.com','Student3','Suresh','STUDENT','2026-08-11 13:51:27.604','2026-08-11 13:51:27.604','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99'),('cmsoqhz100000odyjq6l454re','user_3HlnWXH4Bg3IYzrawtMIubor8rt','yuvanthcsc@gmail.com','Yuvanth','Veluru','STUDENT','2026-08-11 14:06:52.308','2026-08-11 14:06:52.308','df5923ca46ea374f6a8f8a81d895b1fe:eb1c17d78fae817adf6ab59dfe5bbbc7d45c1bb61e6c7dfc881620dd06bb978bbc7421cc4c7affdd7cf4ada363706981d20dba7aa3eaef0cb1077a411c81bc99');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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
