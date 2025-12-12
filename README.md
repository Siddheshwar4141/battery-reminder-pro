# 🔐 Battery Health Reminder System  
**Intern – Cloud & Backend Engineering Assignment**  
**Atomberg Technologies**

This project implements an automated backend script that sends weekly FCM notifications to users who have not checked their lock’s battery level in the last 30 days.  
It integrates with **DynamoDB**, **PostgreSQL**, and **Firebase Cloud Messaging**, and includes event logging to measure click-through rate and campaign effectiveness.

---

## 📌 **1. Problem Statement**
Atomberg requested a system that:

1. Reads all lock entries from a DynamoDB table (`locks`)
2. Checks the `last_battery_checked` timestamp
3. If the value is older than 30 days → notify all users mapped to that lock
4. User–lock mapping is stored in PostgreSQL (`lock_user_mapping`)
5. Track:
   - Users who *received* notifications  
   - Users who *clicked* on the notification  
6. Measure effectiveness:
   - Did the user check their battery within a few days after receiving the notification?

This repository contains a **complete working solution**.

---

## 📁 **2. Folder Structure**
```
battery-reminder-pro/
│
├── src/
│   ├── index.js          # Main weekly job (cron-compatible)
│   ├── api.js            # API for tracking user clicks
│   ├── config.js         # Environment configuration loader
│   ├── db.js             # PostgreSQL database connection
│   ├── dynamo.js         # DynamoDB helpers
│   ├── fcm.js            # Firebase Cloud Messaging sender
│   ├── logger.js         # Centralized logging (Pino)
│
├── firebase.json         # Firebase service account (user must add their own)
├── .env.example          # Environment variable template
├── README.md             # Documentation
└── package.json          # Dependencies and scripts
```

---

## ⚙️ **3. Technologies & Services Used**
| Component | Purpose |
|----------|----------|
| **Node.js** | Main backend runtime |
| **AWS DynamoDB** | Stores lock details and battery timestamp |
| **AWS SDK v3** | Used to read data from DynamoDB |
| **PostgreSQL (RDS)** | Stores lock-user mapping + event logs |
| **Firebase Cloud Messaging** | Sends push notifications |
| **Express.js** | REST API for click tracking |
| **Pino Logger** | Production-grade logging |
| **dotenv** | Environment variable handling |
| **db_schema.sql** | PostgreSQL schema for required tables |


---

## 🚀 **4. How the System Works**

### **Step 1 — Fetch locks from DynamoDB**
Reads all items from the `locks` table and selects those where:

```
last_battery_checked < now - 30 days
```

### **Step 2 — Fetch users for each lock**
Query PostgreSQL:

```sql
SELECT user_id, fcm_id FROM lock_user_mapping WHERE lock_id = $1
```

### **Step 3 — Send FCM Notification**
Each user receives:

- Title: *Battery Check Needed*  
- Body: *Your lock has not been checked recently.*

Includes data fields to track click events.

### **Step 4 — Log Notification Event**
Each sent notification is stored:

```sql
INSERT INTO notification_events (user_id, lock_id, sent_at)
```

### **Step 5 — Track Clicks (API endpoint)**
A small Express server receives callbacks when a user taps the notification:

```
POST /notification/clicked
```

Updates:

```sql
clicked_at = NOW()
```

### **Step 6 — Measure Campaign Effectiveness**
Effectiveness is defined as:

> Did the user check the battery after receiving the notification?

This can be computed by comparing `battery_checked_at` vs `sent_at`.

---

## 🛠️ **5. Setup & Installation**

### **Step 1 — Install Dependencies**
```
npm install
```

### **Step 2 — Create `.env` File**
Copy the template:

```
cp .env.example .env
```

Fill in:

```
PG_HOST=
PG_USER=
PG_PASS=
PG_DB=
AWS_REGION=us-east-1
FIREBASE_CREDENTIAL=./firebase.json
```

### **Step 3 — Add Firebase Credentials**
Download service account JSON → save as:

```
firebase.json
```

### **Step 4 — Ensure Required Database Tables Exist**
```sql
CREATE TABLE lock_user_mapping (
  lock_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  fcm_id TEXT NOT NULL,
  PRIMARY KEY (lock_id, user_id)
);

CREATE TABLE notification_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  lock_id TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  clicked_at TIMESTAMP,
  battery_checked_at TIMESTAMP,
  effectiveness BOOLEAN
);
```

### **Step 5 — DynamoDB Requirements**
Table name: **locks**

Must contain:

```
lock_id (string)
last_battery_checked (ISO timestamp)
```

---

## ▶️ **6. Running the Weekly Script**

This is the core assignment script.

```
npm start
```

The script will:

- Read locks  
- Find stale locks  
- Find users  
- Send notifications  
- Log the events  

Use this in a cron job:

```
0 2 * * 1 npm start
```

(Runs every Monday at 2:00 AM)

---

## 🌐 **7. Running the Click Tracking API**

Run the Express server:

```
node src/api.js
```

Click tracking endpoint:

```
POST /notification/clicked
{
  "user_id": "USER123",
  "lock_id": "LOCK001"
}
```

---

## 📊 **8. Measuring Campaign Effectiveness**

At the end of each week:

```
UPDATE notification_events
SET effectiveness =
  CASE WHEN battery_checked_at > sent_at THEN TRUE ELSE FALSE END
WHERE effectiveness IS NULL;
```

This tells Atomberg **how many users took meaningful action after receiving the notification**.

---

## 📝 **9. Why This Solution Is Production-Ready**
- Clean folder structure  
- Uses environment variables (12-factor method)  
- Modular AWS / DB / FCM services  
- Logging included  
- Error-handled FCM sending  
- Database-safe insert/update operations  
- Testable API design  
- Extensible for future use  

---

## 👨‍💼 **10. Developer**
**Siddheshwar Magar**  
B.Tech CSE — Full Stack & Cloud Developer  
Email: *your email here*  
GitHub: *your GitHub link here*

---

## 🏁 **11. Conclusion**

This project fully meets the assignment requirements:

✔ DynamoDB integration  
✔ PostgreSQL integration  
✔ FCM notifications  
✔ Weekly script  
✔ Click tracking  
✔ Campaign performance measurement  
✔ Clean, professional Node.js code  

---

If you have any questions, feel free to reach out.

