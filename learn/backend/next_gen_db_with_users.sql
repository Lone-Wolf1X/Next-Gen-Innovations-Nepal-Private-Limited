-- MariaDB dump 10.19  Distrib 10.4.28-MariaDB, for osx10.10 (x86_64)
--
-- Host: localhost    Database: next_gen_db
-- ------------------------------------------------------
-- Server version	10.4.28-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` varchar(128) NOT NULL,
  `action` varchar(255) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` varchar(255) NOT NULL,
  `changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changes`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exam_categories`
--

DROP TABLE IF EXISTS `exam_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exam_categories` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exam_categories`
--

LOCK TABLES `exam_categories` WRITE;
/*!40000 ALTER TABLE `exam_categories` DISABLE KEYS */;
INSERT INTO `exam_categories` VALUES ('cat-rbb','Rastriya Banijya Bank','RBB Level 4 & 5 Preparation','🏦',1,1,'2026-08-15 02:40:59',NULL),('cat-sanstha','Sangathit Sanstha','Public Enterprises & Corporations','🏛️',1,2,'2026-08-15 02:40:59',NULL);
/*!40000 ALTER TABLE `exam_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `model_sets`
--

DROP TABLE IF EXISTS `model_sets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `model_sets` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` varchar(36) NOT NULL,
  `question_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`question_ids`)),
  `time_limit_minutes` int(11) DEFAULT 60,
  `total_marks` decimal(6,2) DEFAULT 100.00,
  `status` varchar(50) DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `model_sets_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `exam_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_sets`
--

LOCK TABLES `model_sets` WRITE;
/*!40000 ALTER TABLE `model_sets` DISABLE KEYS */;
INSERT INTO `model_sets` VALUES ('mset-rbb-1','RBB Level 4 Pre-Test 1','A quick diagnostic test covering all major subjects of RBB Level 4.','cat-rbb','[\"q1\", \"q2\", \"q3\"]',10,3.00,'published',NULL,'2026-08-15 02:41:25'),('mset-rbb-full-1','RBB Level 5 Pre-Test (Full Set)','Comprehensive 50 MCQ model set based on current official syllabus.','cat-rbb','[\"q_rbb_1\", \"q_rbb_2\", \"q_rbb_3\", \"q_rbb_4\", \"q_rbb_5\", \"q_rbb_6\", \"q_rbb_7\", \"q_rbb_8\", \"q_rbb_9\", \"q_rbb_10\", \"q_rbb_11\", \"q_rbb_12\", \"q_rbb_13\", \"q_rbb_14\", \"q_rbb_15\", \"q_rbb_16\", \"q_rbb_17\", \"q_rbb_18\", \"q_rbb_19\", \"q_rbb_20\", \"q_rbb_21\", \"q_rbb_22\", \"q_rbb_23\", \"q_rbb_24\", \"q_rbb_25\", \"q_rbb_26\", \"q_rbb_27\", \"q_rbb_28\", \"q_rbb_29\", \"q_rbb_30\", \"q_rbb_31\", \"q_rbb_32\", \"q_rbb_33\", \"q_rbb_34\", \"q_rbb_35\", \"q_rbb_36\", \"q_rbb_37\", \"q_rbb_38\", \"q_rbb_39\", \"q_rbb_40\", \"q_rbb_41\", \"q_rbb_42\", \"q_rbb_43\", \"q_rbb_44\", \"q_rbb_45\", \"q_rbb_46\", \"q_rbb_47\", \"q_rbb_48\", \"q_rbb_49\", \"q_rbb_50\"]',45,50.00,'published',NULL,'2026-08-15 02:53:00');
/*!40000 ALTER TABLE `model_sets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `questions` (
  `id` varchar(36) NOT NULL,
  `category_id` varchar(36) NOT NULL,
  `subject_id` varchar(36) NOT NULL,
  `question_text` text NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `correct_option` varchar(255) NOT NULL,
  `explanation` text DEFAULT NULL,
  `marks` decimal(5,2) DEFAULT 1.00,
  `negative_marks` decimal(5,2) DEFAULT 0.25,
  `status` varchar(50) DEFAULT 'published',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `exam_categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES ('q1','cat-rbb','sub-rbb-p1-1','What is the central bank of Nepal?','{\"a\":\"Nepal Rastra Bank\", \"b\":\"Rastriya Banijya Bank\", \"c\":\"Nepal Bank Limited\", \"d\":\"Agriculture Development Bank\"}','a','NRB is the central bank of Nepal established in 2013 BS.',1.00,0.20,'published','2026-08-15 02:41:25'),('q2','cat-rbb','sub-rbb-p1-1','When was Rastriya Banijya Bank established?','{\"a\":\"2022 BS\", \"b\":\"2013 BS\", \"c\":\"1994 BS\", \"d\":\"2024 BS\"}','a','Rastriya Banijya Bank was established on Magh 10, 2022 BS.',1.00,0.20,'published','2026-08-15 02:41:25'),('q3','cat-rbb','sub-rbb-p2-1','Which accounting standard is followed in Nepal?','{\"a\":\"NFRS\", \"b\":\"IFRS\", \"c\":\"GAAP\", \"d\":\"NAS\"}','a','Nepal Financial Reporting Standards (NFRS) are followed in Nepal.',1.00,0.20,'published','2026-08-15 02:41:25'),('q_rbb_1','cat-rbb','sub-rbb-p1-1','Scarcity in economics refers to:<br>अर्थशास्त्रमा Scarcity भन्नाले के बुझिन्छ?','{\"a\": \"Unlimited resources\", \"b\": \"Resources being limited relative to unlimited wants\", \"c\": \"Absence of demand\", \"d\": \"Excess supply\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_10','cat-rbb','sub-rbb-p1-2','Repo transaction is primarily used for:','{\"a\": \"Long-term equity financing\", \"b\": \"Short-term liquidity management\", \"c\": \"Foreign direct investment\", \"d\": \"Insurance underwriting\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_11','cat-rbb','sub-rbb-p1-2','In a repo transaction, the party selling securities with an agreement to repurchase them is effectively obtaining:','{\"a\": \"Equity capital\", \"b\": \"Short-term funds\", \"c\": \"Foreign currency permanently\", \"d\": \"Dividend income\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_12','cat-rbb','sub-rbb-p1-2','Reverse repo is generally used by the central bank to:','{\"a\": \"Inject liquidity into the banking system\", \"b\": \"Absorb liquidity from the banking system\", \"c\": \"Increase government expenditure\", \"d\": \"Increase bank capital\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_13','cat-rbb','sub-rbb-p1-2','Open Market Operations (OMO) mainly involve:','{\"a\": \"Buying and selling securities by the central bank\", \"b\": \"Issuing passports\", \"c\": \"Controlling imports\", \"d\": \"Collecting income tax\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_14','cat-rbb','sub-rbb-p1-2','CRR stands for:','{\"a\": \"Credit Recovery Ratio\", \"b\": \"Cash Reserve Ratio\", \"c\": \"Capital Return Rate\", \"d\": \"Current Revenue Ratio\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_15','cat-rbb','sub-rbb-p1-2','The primary purpose of CRR is to:','{\"a\": \"Ensure banks maintain a prescribed cash reserve\", \"b\": \"Increase bank profit\", \"c\": \"Increase share prices\", \"d\": \"Reduce exports\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_16','cat-rbb','sub-rbb-p1-2','SLR stands for:','{\"a\": \"Statutory Liquidity Ratio\", \"b\": \"Standard Lending Rate\", \"c\": \"Secured Loan Ratio\", \"d\": \"Special Liquidity Return\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_17','cat-rbb','sub-rbb-p1-2','OTC market stands for:','{\"a\": \"Official Trading Centre\", \"b\": \"Over-the-Counter market\", \"c\": \"Open Trade Capital\", \"d\": \"Overseas Transfer Centre\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_18','cat-rbb','sub-rbb-p1-3','Which institution is the central bank of Nepal?','{\"a\": \"Rastriya Banijya Bank\", \"b\": \"Nepal Bank Limited\", \"c\": \"Nepal Rastra Bank\", \"d\": \"Citizens Bank\"}','c','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_19','cat-rbb','sub-rbb-p1-3','Which of the following is a development bank in Nepal\'s BFIs classification?','{\"a\": \"Class A\", \"b\": \"Class B\", \"c\": \"Class C\", \"d\": \"Class D\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_2','cat-rbb','sub-rbb-p1-1','The opportunity cost of a choice is:<br>कुनै विकल्प रोज्दा Opportunity Cost भन्नाले:','{\"a\": \"Total monetary cost\", \"b\": \"Fixed cost\", \"c\": \"Value of the next best alternative forgone\", \"d\": \"Marginal cost\"}','c','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_20','cat-rbb','sub-rbb-p1-3','Microfinance institutions primarily focus on:','{\"a\": \"Large multinational corporations only\", \"b\": \"Providing financial services to low-income and underserved groups\", \"c\": \"Foreign exchange trading only\", \"d\": \"Government bond trading only\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_21','cat-rbb','sub-rbb-p1-3','EPF in Nepal stands for:','{\"a\": \"Economic Planning Fund\", \"b\": \"Employees Provident Fund\", \"c\": \"Equity Protection Fund\", \"d\": \"Employment Promotion Fund\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_22','cat-rbb','sub-rbb-p1-3','CIT stands for:','{\"a\": \"Citizens Investment Trust\", \"b\": \"Central Investment Tax\", \"c\": \"Citizens Insurance Tribunal\", \"d\": \"Commercial Investment Trust\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_23','cat-rbb','sub-rbb-p1-3','SSF stands for:','{\"a\": \"Social Security Fund\", \"b\": \"State Saving Fund\", \"c\": \"Special Service Fund\", \"d\": \"Social Saving Finance\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_24','cat-rbb','sub-rbb-p1-3','Which one is NOT a banking institution under the traditional Class A–D BFI classification?','{\"a\": \"Commercial Bank\", \"b\": \"Development Bank\", \"c\": \"Finance Company\", \"d\": \"Insurance Company\"}','d','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_25','cat-rbb','sub-rbb-p1-3','Infrastructure development banks are primarily intended to support:','{\"a\": \"Infrastructure financing and development\", \"b\": \"Retail shopping\", \"c\": \"Tourism ticketing only\", \"d\": \"Personal remittance only\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_26','cat-rbb','sub-rbb-p2-2','ECC in Nepal\'s payment system stands for:','{\"a\": \"Electronic Credit Control\", \"b\": \"Electronic Cheque Clearing\", \"c\": \"Electronic Cash Collection\", \"d\": \"External Cheque Control\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_27','cat-rbb','sub-rbb-p2-2','IPS primarily refers to:','{\"a\": \"Interbank Payment System\", \"b\": \"International Payment Standard\", \"c\": \"Internal Processing Service\", \"d\": \"Investment Payment Scheme\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_28','cat-rbb','sub-rbb-p2-2','RTGS stands for:','{\"a\": \"Real Time Gross Settlement\", \"b\": \"Real Transfer Government System\", \"c\": \"Retail Transaction Gross Service\", \"d\": \"Real Trade Guarantee System\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_29','cat-rbb','sub-rbb-p2-2','RTGS is mainly designed for:','{\"a\": \"Real-time settlement of transactions, generally on a gross basis\", \"b\": \"Long-term share trading\", \"c\": \"Insurance claims only\", \"d\": \"Foreign tourism payments only\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_3','cat-rbb','sub-rbb-p1-1','According to the law of demand, other things remaining constant, an increase in price generally causes:','{\"a\": \"Increase in quantity demanded\", \"b\": \"Decrease in quantity demanded\", \"c\": \"Increase in supply only\", \"d\": \"No change in demand\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_30','cat-rbb','sub-rbb-p2-2','SWIFT primarily facilitates:','{\"a\": \"International financial messaging\", \"b\": \"Domestic ATM withdrawal only\", \"c\": \"Share trading\", \"d\": \"Insurance underwriting\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_31','cat-rbb','sub-rbb-p2-2','Which technology allows contactless communication over a very short distance?','{\"a\": \"NFC\", \"b\": \"VPN\", \"c\": \"FTP\", \"d\": \"SMTP\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_32','cat-rbb','sub-rbb-p2-2','QR stands for:','{\"a\": \"Quick Response\", \"b\": \"Quality Reserve\", \"c\": \"Quick Remittance\", \"d\": \"Quantitative Ratio\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_33','cat-rbb','sub-rbb-p2-2','Which of the following is an example of a digital payment card?','{\"a\": \"Debit card\", \"b\": \"Citizenship card\", \"c\": \"Library card\", \"d\": \"Identity certificate\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_34','cat-rbb','sub-rbb-p2-2','A digital wallet is mainly used for:','{\"a\": \"Electronic storage/payment of money or payment credentials\", \"b\": \"Printing currency notes\", \"c\": \"Issuing passports\", \"d\": \"Preparing government budgets\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_35','cat-rbb','sub-rbb-p2-2','CBDC stands for:','{\"a\": \"Central Bank Digital Currency\", \"b\": \"Commercial Bank Digital Credit\", \"c\": \"Central Banking Deposit Certificate\", \"d\": \"Currency Banking Development Code\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_36','cat-rbb','sub-rbb-p2-2','Capital fund of a bank mainly represents:','{\"a\": \"The bank\'s capital base available to absorb losses\", \"b\": \"Customer\'s ATM PIN\", \"c\": \"Daily cash sales\", \"d\": \"Government tax collection\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_37','cat-rbb','sub-rbb-p2-2','Loan loss provisioning is primarily related to:','{\"a\": \"Setting aside funds against expected/identified credit losses\", \"b\": \"Increasing employee salary\", \"c\": \"Increasing bank branches\", \"d\": \"Foreign exchange conversion\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_38','cat-rbb','sub-rbb-p2-2','CD Ratio generally means:','{\"a\": \"Credit-Deposit Ratio\", \"b\": \"Capital-Deposit Ratio\", \"c\": \"Cash-Debt Ratio\", \"d\": \"Credit-Debt Ratio\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_39','cat-rbb','sub-rbb-p2-2','If a bank has credit of Rs. 80 billion and deposits of Rs. 100 billion, its CD ratio is:','{\"a\": \"60%\", \"b\": \"70%\", \"c\": \"80%\", \"d\": \"125%\"}','c','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_4','cat-rbb','sub-rbb-p1-1','A market structure characterized by a single seller is called:','{\"a\": \"Perfect competition\", \"b\": \"Oligopoly\", \"c\": \"Monopoly\", \"d\": \"Monopolistic competition\"}','c','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_40','cat-rbb','sub-rbb-p2-2','LC in trade finance stands for:','{\"a\": \"Loan Certificate\", \"b\": \"Letter of Credit\", \"c\": \"Liquidity Certificate\", \"d\": \"Lending Contract\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_41','cat-rbb','sub-rbb-p2-2','A bank guarantee primarily represents:','{\"a\": \"A bank\'s commitment to make payment subject to specified terms if the applicant defaults\", \"b\": \"A bank deposit\", \"c\": \"A share dividend\", \"d\": \"A government tax\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_42','cat-rbb','sub-rbb-p2-2','KYC stands for:','{\"a\": \"Know Your Customer\", \"b\": \"Keep Your Cash\", \"c\": \"Know Your Credit\", \"d\": \"Keep Your Customer\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_43','cat-rbb','sub-rbb-p2-2','The primary purpose of KYC is to:','{\"a\": \"Identify and understand customers and manage associated risks\", \"b\": \"Increase share prices\", \"c\": \"Reduce employee numbers\", \"d\": \"Calculate GDP\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_44','cat-rbb','sub-rbb-p2-2','Credit information is particularly important for:','{\"a\": \"Assessing borrower\'s creditworthiness\", \"b\": \"Printing currency\", \"c\": \"Determining tourism destinations\", \"d\": \"Measuring rainfall\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_45','cat-rbb','sub-rbb-p2-2','Which of the following is a major tourist destination of Nepal?','{\"a\": \"Pokhara\", \"b\": \"Tokyo\", \"c\": \"Dubai\", \"d\": \"Paris\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_46','cat-rbb','sub-rbb-p2-2','The capital city of Nepal is:','{\"a\": \"Pokhara\", \"b\": \"Biratnagar\", \"c\": \"Kathmandu\", \"d\": \"Lalitpur\"}','c','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_47','cat-rbb','sub-rbb-p2-2','The highest mountain in the world is:','{\"a\": \"K2\", \"b\": \"Mount Everest\", \"c\": \"Annapurna I\", \"d\": \"Dhaulagiri\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_48','cat-rbb','sub-rbb-p2-2','Nepal is located between:','{\"a\": \"India and Bangladesh\", \"b\": \"India and China\", \"c\": \"China and Bhutan\", \"d\": \"India and Pakistan\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_49','cat-rbb','sub-rbb-p2-2','Which is a major export item of Nepal?','{\"a\": \"Carpet\", \"b\": \"Crude petroleum\", \"c\": \"Passenger aircraft\", \"d\": \"Gold bars\"}','a','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_5','cat-rbb','sub-rbb-p1-1','GDP primarily measures:','{\"a\": \"Total wealth of citizens\", \"b\": \"Market value of final goods and services produced within a country during a period\", \"c\": \"Government revenue only\", \"d\": \"Total exports only\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_50','cat-rbb','sub-rbb-p2-2','Which organization operates Nepal\'s stock exchange?','{\"a\": \"Nepal Rastra Bank\", \"b\": \"Nepal Stock Exchange (NEPSE)\", \"c\": \"Ministry of Finance\", \"d\": \"Employees Provident Fund\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_6','cat-rbb','sub-rbb-p1-1','Which policy primarily deals with government revenue and expenditure?','{\"a\": \"Monetary policy\", \"b\": \"Fiscal policy\", \"c\": \"Credit policy\", \"d\": \"Trade policy\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_7','cat-rbb','sub-rbb-p1-1','Monetary policy in Nepal is formulated and implemented by:','{\"a\": \"Ministry of Finance\", \"b\": \"Nepal Rastra Bank\", \"c\": \"National Planning Commission\", \"d\": \"Nepal Stock Exchange\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_8','cat-rbb','sub-rbb-p1-2','The market where short-term financial instruments are traded is known as:','{\"a\": \"Capital market\", \"b\": \"Money market\", \"c\": \"Commodity market\", \"d\": \"Foreign tourism market\"}','b','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00'),('q_rbb_9','cat-rbb','sub-rbb-p1-2','Which of the following is generally considered a capital market instrument?','{\"a\": \"Treasury bill\", \"b\": \"Commercial paper\", \"c\": \"Ordinary share\", \"d\": \"Call money\"}','c','Explanation available in detailed guide.',1.00,0.20,'published','2026-08-15 02:53:00');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subjects` (
  `id` varchar(36) NOT NULL,
  `category_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `exam_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES ('sub-rbb-1','cat-rbb','Banking & Financial System',1,1,'2026-08-15 02:40:59'),('sub-rbb-2','cat-rbb','Accounting & Auditing',1,2,'2026-08-15 02:40:59'),('sub-rbb-3','cat-rbb','Management & IT',1,3,'2026-08-15 02:40:59'),('sub-rbb-4','cat-rbb','Acts & Regulations (Banking Laws)',1,4,'2026-08-15 02:40:59'),('sub-rbb-5','cat-rbb','General Knowledge & Economics',1,5,'2026-08-15 02:40:59'),('sub-rbb-p1-1','cat-rbb','Paper I: Basic Economics',1,1,'2026-08-15 02:41:25'),('sub-rbb-p1-2','cat-rbb','Paper I: Financial Market',1,2,'2026-08-15 02:41:25'),('sub-rbb-p1-3','cat-rbb','Paper I: Financial Institutions in Nepal',1,3,'2026-08-15 02:41:25'),('sub-rbb-p2-1','cat-rbb','Paper II: Banking Related Laws',1,4,'2026-08-15 02:41:25'),('sub-rbb-p2-2','cat-rbb','Paper II: Other Related Laws',1,5,'2026-08-15 02:41:25'),('sub-rbb-p2-3','cat-rbb','Paper II: Organizational Behavior',1,6,'2026-08-15 02:41:25'),('sub-rbb-p2-4','cat-rbb','Paper II: Organizational Role',1,7,'2026-08-15 02:41:25'),('sub-san-1','cat-sanstha','Public Administration & Management',1,1,'2026-08-15 02:40:59'),('sub-san-2','cat-sanstha','Financial Management',1,2,'2026-08-15 02:40:59'),('sub-san-3','cat-sanstha','General Knowledge (Nepal & World)',1,3,'2026-08-15 02:40:59'),('sub-san-4','cat-sanstha','IT & Current Affairs',1,4,'2026-08-15 02:40:59');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test_attempts`
--

DROP TABLE IF EXISTS `test_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `test_attempts` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `model_set_id` varchar(36) NOT NULL,
  `status` varchar(50) DEFAULT 'in_progress',
  `time_remaining_seconds` int(11) NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`answers`)),
  `marked_for_review` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`marked_for_review`)),
  `total_questions` int(11) NOT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `submitted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `model_set_id` (`model_set_id`),
  CONSTRAINT `test_attempts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`uid`) ON DELETE CASCADE,
  CONSTRAINT `test_attempts_ibfk_2` FOREIGN KEY (`model_set_id`) REFERENCES `model_sets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_attempts`
--

LOCK TABLES `test_attempts` WRITE;
/*!40000 ALTER TABLE `test_attempts` DISABLE KEYS */;
INSERT INTO `test_attempts` VALUES ('6a7fd92293062','U9dTiYFW39YJkqNSJayZMXN3BtI3','mset-rbb-1','in_progress',0,'{}','[]',3,'2026-08-15 03:12:34',NULL),('6a7fd94cc7bd2','U9dTiYFW39YJkqNSJayZMXN3BtI3','mset-rbb-full-1','in_progress',0,'{}','[]',50,'2026-08-15 03:13:16',NULL);
/*!40000 ALTER TABLE `test_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test_results`
--

DROP TABLE IF EXISTS `test_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `test_results` (
  `id` varchar(36) NOT NULL,
  `attempt_id` varchar(36) NOT NULL,
  `user_id` varchar(128) NOT NULL,
  `model_set_id` varchar(36) NOT NULL,
  `total_questions` int(11) NOT NULL,
  `correct_answers` int(11) NOT NULL,
  `incorrect_answers` int(11) NOT NULL,
  `unattempted_questions` int(11) NOT NULL,
  `marks_obtained` decimal(6,2) NOT NULL,
  `negative_marks` decimal(6,2) NOT NULL,
  `final_score` decimal(6,2) NOT NULL,
  `total_marks` decimal(6,2) NOT NULL,
  `score_percentage` decimal(5,2) NOT NULL,
  `accuracy` decimal(5,2) NOT NULL,
  `time_taken_seconds` int(11) NOT NULL,
  `is_personal_best` tinyint(1) DEFAULT 0,
  `question_review` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`question_review`)),
  `completed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `attempt_id` (`attempt_id`),
  KEY `user_id` (`user_id`),
  KEY `model_set_id` (`model_set_id`),
  CONSTRAINT `test_results_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `test_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_results_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`uid`) ON DELETE CASCADE,
  CONSTRAINT `test_results_ibfk_3` FOREIGN KEY (`model_set_id`) REFERENCES `model_sets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_results`
--

LOCK TABLES `test_results` WRITE;
/*!40000 ALTER TABLE `test_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `test_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `uid` varchar(128) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `photo_url` text DEFAULT NULL,
  `total_tests_attempted` int(11) DEFAULT 0,
  `total_tests_completed` int(11) DEFAULT 0,
  `average_score` decimal(5,2) DEFAULT 0.00,
  `best_score` decimal(5,2) DEFAULT 0.00,
  `subscription_tier` varchar(50) DEFAULT 'free',
  `role` varchar(50) DEFAULT 'user',
  `tests_taken_today` int(11) DEFAULT 0,
  `last_test_date` date DEFAULT NULL,
  `current_streak` int(11) DEFAULT 0,
  `total_points` int(11) DEFAULT 0,
  `last_login_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `nickname` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `avatar_url` longtext DEFAULT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('qQQtixk2KpYoeYLASUZlPzInmIG2','Payal Paswan','payal.pwn123@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocLDW75cjVybXlH-EtMu0Tp8OSHUFLajkt1zmjqv5y7GAumo9NKj=s96-c',0,0,0.00,0.00,'free','user',0,NULL,0,0,NULL,'2026-08-15 04:16:15','2026-08-15 04:16:41','Payal','9800000000','female','https://avatar.iran.liara.run/public/girl?username=dpatjy'),('U9dTiYFW39YJkqNSJayZMXN3BtI3','Abhishek Pawan','abhi.pwn555@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocLgaX_INFSfVNl44-Lp-idRTecefnWbSCo7neWh8IzOc_hq7w=s96-c',0,0,0.00,0.00,'premium','user',2,'2026-08-15',0,0,NULL,'2026-08-15 03:12:16','2026-08-15 04:07:57','Abhii','9811305806','male','https://avatar.iran.liara.run/public/boy?username=68u6g');
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

-- Dump completed on 2026-08-15 10:22:54
