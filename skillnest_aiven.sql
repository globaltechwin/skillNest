-- MySQL dump 10.13  Distrib 9.7.1, for macos26.4 (arm64)
--
-- Host: localhost    Database: skillnest
-- ------------------------------------------------------
-- Server version	9.7.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

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
/*!40000 ALTER TABLE `admin_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_submissions`
--

DROP TABLE IF EXISTS `assignment_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment_submissions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `assignmentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentUserId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `submittedAt` datetime(3) DEFAULT NULL,
  `status` enum('NOT_SUBMITTED','SUBMITTED','GRADED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NOT_SUBMITTED',
  `marks` int DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `assignment_submissions_assignmentId_studentUserId_key` (`assignmentId`,`studentUserId`),
  KEY `assignment_submissions_assignmentId_idx` (`assignmentId`),
  KEY `assignment_submissions_studentUserId_idx` (`studentUserId`),
  CONSTRAINT `assignment_submissions_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `assignments` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `assignment_submissions_studentUserId_fkey` FOREIGN KEY (`studentUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_submissions`
--

LOCK TABLES `assignment_submissions` WRITE;
/*!40000 ALTER TABLE `assignment_submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `dueDate` datetime(3) DEFAULT NULL,
  `maxMarks` int DEFAULT NULL,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `assignments_courseId_idx` (`courseId`),
  KEY `assignments_status_idx` (`status`),
  KEY `assignments_dueDate_idx` (`dueDate`),
  CONSTRAINT `assignments_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_sessions`
--

DROP TABLE IF EXISTS `class_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `startTime` datetime(3) NOT NULL,
  `endTime` datetime(3) NOT NULL,
  `mode` enum('ONLINE','OFFLINE','BOTH') COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meetingUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('SCHEDULED','CANCELLED','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SCHEDULED',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `class_sessions_courseId_idx` (`courseId`),
  KEY `class_sessions_startTime_idx` (`startTime`),
  KEY `class_sessions_status_idx` (`status`),
  CONSTRAINT `class_sessions_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_sessions`
--

LOCK TABLES `class_sessions` WRITE;
/*!40000 ALTER TABLE `class_sessions` DISABLE KEYS */;
INSERT INTO `class_sessions` VALUES ('cmso7mfrb0001zwyjsfxooo1q','cmso7lxrg0000zwyjfrz4dmhl','Introduction to Variables',NULL,'2026-08-11 05:18:00.000','2026-08-11 06:18:00.000','ONLINE',NULL,NULL,'SCHEDULED','2026-08-11 05:18:27.911','2026-08-11 05:18:27.911');
/*!40000 ALTER TABLE `class_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentUserId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacherProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastMessageAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversations_studentUserId_teacherProfileId_key` (`studentUserId`,`teacherProfileId`),
  KEY `conversations_studentUserId_idx` (`studentUserId`),
  KEY `conversations_teacherProfileId_idx` (`teacherProfileId`),
  KEY `conversations_lastMessageAt_idx` (`lastMessageAt`),
  CONSTRAINT `conversations_studentUserId_fkey` FOREIGN KEY (`studentUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `conversations_teacherProfileId_fkey` FOREIGN KEY (`teacherProfileId`) REFERENCES `teacher_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES ('cmso7nam90002zwyjzlj7wkj4','cmsmx38t80001syyj48wcevh7','cmsn2f84d0007pdyjwwzmq9g2','2026-08-11 05:34:09.590','2026-08-11 05:19:07.905','2026-08-11 05:34:09.591');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_enrollments`
--

DROP TABLE IF EXISTS `course_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_enrollments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `courseId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `studentUserId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `requestedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `respondedAt` datetime(3) DEFAULT NULL,
  `rejectionReason` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `course_enrollments_courseId_studentUserId_key` (`courseId`,`studentUserId`),
  KEY `course_enrollments_courseId_idx` (`courseId`),
  KEY `course_enrollments_studentUserId_idx` (`studentUserId`),
  KEY `course_enrollments_status_idx` (`status`),
  CONSTRAINT `course_enrollments_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `course_enrollments_studentUserId_fkey` FOREIGN KEY (`studentUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_enrollments`
--

LOCK TABLES `course_enrollments` WRITE;
/*!40000 ALTER TABLE `course_enrollments` DISABLE KEYS */;
INSERT INTO `course_enrollments` VALUES ('cmso8u73t000bzwyjb2yrrpw8','cmso7lxrg0000zwyjfrz4dmhl','cmsmx38t80001syyj48wcevh7','PENDING','2026-08-11 05:52:29.562',NULL,NULL,'2026-08-11 05:52:29.562','2026-08-11 05:52:29.562');
/*!40000 ALTER TABLE `course_enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacherProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subjectId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `teachingLevel` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `teachingMode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maxStudents` int DEFAULT NULL,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `courses_teacherProfileId_idx` (`teacherProfileId`),
  KEY `courses_subjectId_idx` (`subjectId`),
  KEY `courses_status_idx` (`status`),
  CONSTRAINT `courses_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `courses_teacherProfileId_fkey` FOREIGN KEY (`teacherProfileId`) REFERENCES `teacher_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES ('cmso7lxrg0000zwyjfrz4dmhl','cmsn2f84d0007pdyjwwzmq9g2','cmso7l8pv000ayfyjuj7zxc3a','Python',NULL,'High School (9-10)','BOTH','Chennai',NULL,'PUBLISHED','2026-08-11 05:18:04.588','2026-08-11 05:18:04.641');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversationId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderUserId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `readAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `messages_conversationId_createdAt_idx` (`conversationId`,`createdAt`),
  KEY `messages_senderUserId_idx` (`senderUserId`),
  CONSTRAINT `messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_senderUserId_fkey` FOREIGN KEY (`senderUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES ('cmso7nd6m0003zwyjmdkedmnr','cmso7nam90002zwyjzlj7wkj4','cmsmx38t80001syyj48wcevh7','Hi','2026-08-11 05:33:40.325','2026-08-11 05:19:11.230'),('cmso7r9rp0005zwyjw3cjw0ld','cmso7nam90002zwyjzlj7wkj4','cmsmx38t80001syyj48wcevh7','Hi','2026-08-11 05:33:40.325','2026-08-11 05:22:13.430'),('cmso863ja0007zwyjjhnc7g5b','cmso7nam90002zwyjzlj7wkj4','cmsn2f83o0006pdyjg33pqsf8','How r u?','2026-08-11 05:33:53.743','2026-08-11 05:33:45.190'),('cmso86md00009zwyjmb07c074','cmso7nam90002zwyjzlj7wkj4','cmsmx38t80001syyj48wcevh7','I\'m good mam\nI just want to enquire about the course.','2026-08-11 05:34:13.208','2026-08-11 05:34:09.588');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('NEW_MESSAGE','NEW_ENROLLMENT_REQUEST','ENROLLMENT_ACCEPTED','ENROLLMENT_REJECTED','NEW_ASSIGNMENT','ASSIGNMENT_GRADED','CLASS_SCHEDULED','CLASS_UPDATED','CLASS_CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `readAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `notifications_userId_createdAt_idx` (`userId`,`createdAt`),
  KEY `notifications_userId_readAt_idx` (`userId`,`readAt`),
  CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('cmso863ji0008zwyjakqkq7up','cmsmx38t80001syyj48wcevh7','NEW_MESSAGE','New message from Yuvanth Veluru','You have a new message from Yuvanth Veluru.','/student/messages/cmso7nam90002zwyjzlj7wkj4','2026-08-11 05:47:18.083','2026-08-11 05:33:45.198'),('cmso86md7000azwyjsq0857j0','cmsn2f83o0006pdyjg33pqsf8','NEW_MESSAGE','New message from Yuvanth','You have a new message from Yuvanth.','/teacher/messages/cmso7nam90002zwyjzlj7wkj4','2026-08-11 05:38:20.996','2026-08-11 05:34:09.595');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

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
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

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

--
-- Table structure for table `teacher_availability`
--

DROP TABLE IF EXISTS `teacher_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_availability` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacherProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `day` enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `startTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `endTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teacher_availability_teacherProfileId_day_key` (`teacherProfileId`,`day`),
  CONSTRAINT `teacher_availability_teacherProfileId_fkey` FOREIGN KEY (`teacherProfileId`) REFERENCES `teacher_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_availability`
--

LOCK TABLES `teacher_availability` WRITE;
/*!40000 ALTER TABLE `teacher_availability` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_availability` ENABLE KEYS */;
UNLOCK TABLES;

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
  `profilePhotoUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `teacher_profiles` VALUES ('cmsn2f84d0007pdyjwwzmq9g2','cmsn2f83o0006pdyjg33pqsf8','APPROVED',NULL,NULL,NULL,NULL,NULL,'BOTH',0,0,'INR','hour',NULL,NULL,NULL,NULL,'2026-08-10 10:05:07.166','2026-08-10 10:10:43.303',NULL,NULL,NULL);
/*!40000 ALTER TABLE `teacher_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_qualifications`
--

DROP TABLE IF EXISTS `teacher_qualifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_qualifications` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacherProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `institution` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `year` int DEFAULT NULL,
  `field` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `teacher_qualifications_teacherProfileId_fkey` (`teacherProfileId`),
  CONSTRAINT `teacher_qualifications_teacherProfileId_fkey` FOREIGN KEY (`teacherProfileId`) REFERENCES `teacher_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_qualifications`
--

LOCK TABLES `teacher_qualifications` WRITE;
/*!40000 ALTER TABLE `teacher_qualifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_qualifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teacher_subjects`
--

DROP TABLE IF EXISTS `teacher_subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_subjects` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacherProfileId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subjectId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teacher_subjects_teacherProfileId_subjectId_key` (`teacherProfileId`,`subjectId`),
  KEY `teacher_subjects_subjectId_fkey` (`subjectId`),
  CONSTRAINT `teacher_subjects_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `teacher_subjects_teacherProfileId_fkey` FOREIGN KEY (`teacherProfileId`) REFERENCES `teacher_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teacher_subjects`
--

LOCK TABLES `teacher_subjects` WRITE;
/*!40000 ALTER TABLE `teacher_subjects` DISABLE KEYS */;
/*!40000 ALTER TABLE `teacher_subjects` ENABLE KEYS */;
UNLOCK TABLES;

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
INSERT INTO `users` VALUES ('cmsmutjkv0000syyjjuzzbhzz','user_3HiFxAvoUGuwWEFEKeYh6PHooxP','yuvanthcsc2025@gmail.com','Yuvanth','V','STUDENT','2026-08-10 06:32:18.271','2026-08-10 06:32:18.271'),('cmsmx1xzw0000m0yjn7o2khs4','user_3HiO4a7L7nTTHyf8AiACWWJq82I','admin@gmail.com','Admin','User','ADMIN','2026-08-10 07:34:49.436','2026-08-10 07:34:49.436'),('cmsmx38t80001syyj48wcevh7','user_3HjJRzdX2TG34YfBf3mfQiBNHUT','sheru.dev03@gmail.com','Yuvanth',NULL,'STUDENT','2026-08-10 07:35:50.109','2026-08-10 15:25:42.229'),('cmsn2f83o0006pdyjg33pqsf8','user_3HigSor3hAGqy5LSWcrY8Xu91Pw','yuvanthv1029@gmail.com','Yuvanth','Veluru','TEACHER','2026-08-10 10:05:07.140','2026-08-10 10:05:07.140');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-11 12:13:35
