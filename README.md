# 🌍 AidbridgE

AidbridgE is a full-stack humanitarian aid and donation management platform engineered to bring transparency, accountability, and AI-driven fraud detection to charitable giving. Designed specifically to tackle inefficiencies and verification bottlenecks in community relief efforts, the platform connects donors directly with verified beneficiaries while equipping administrators with automated forensic tools.
---
### vercel deployment(click)
[![Vercel Deployment](https://therealsujitk-vercel-badge.vercel.app/?app=aidbridge)](https://aidbridge.vercel.app)

## 🌟 Comprehensive Project Overview

AidbridgE bridges the trust gap in digital philanthropy by combining modern web architecture with automated machine learning document auditing and secure regional mobile payments. 

### Core Pillars:
1. **Trust & Verification:** Manual reviews of aid claims are notoriously slow and prone to human error or oversight. AidbridgE introduces an automated AI forensic pipeline that parses supporting documents (medical letters, school fee requests, identification) to calculate an objective **AI Trust Score** and flag high-risk anomalies before a campaign ever goes live.
2. **Frictionless Giving:** Integrating directly with regional mobile money infrastructure ensures that donors can contribute instantly and securely without complex international banking hurdles.
3. **Role-Based Workflows:** Tailored, glassmorphic interfaces optimized for Donors, Beneficiaries, and Administrators ensure that every user role interacts only with the metrics and tools relevant to their mission.

---

## 🏗️ System Architecture & Tech Stack

### Frontend (`/client`)
- **Framework:** React (Vite bundler) for lightning-fast hot module replacement.
- **Styling:** Tailwind CSS (v4) paired with custom CSS modules for a sleek, glassmorphic dark-mode dashboard design.
- **Icons & UI Feedback:** Lucide React icons, real-time loading states, interactive modals, and dynamic progress bars.

### Backend (`/server`)
- **Runtime:** Node.js & Express.js RESTful API architecture.
- **Database:** MongoDB Atlas (NoSQL) managed via Mongoose ODM, utilizing robust schemas for campaigns, donations, users, and audit logs.
- **Security & Middleware:** CORS, JWT-based authentication, and custom error-handling middleware.

### AI Forensic Microservice (`/ai_service`)
- **Language & Framework:** Python & Flask.
- **Model Engine:** Powered by **TinyLlama** running locally via **Ollama**, executing fast CPU-based text analysis and structural fraud detection.
- **Data Contract:** Returns strict JSON payloads containing trust scores, verdict summaries, and risk flags.

### Payments Integration
- **Mobile Money:** Safaricom Daraja API integration supporting STK Push transactions for seamless regional contributions.

---

## 📊 Role-Based Dashboards

- **Donor Impact Portal:** 
  - Discover and filter active verified campaigns.
  - Track real-time funding progress and community impact pools.
  - Execute secure M-Pesa mobile donations via interactive payment prompts.
- **Admin Mission Control:** 
  - Centralized telemetry monitoring total platform pool, active submissions, and high-risk flags.
  - Comprehensive verification queue table displaying AI trust scores and campaign statuses.
  - Deep-dive forensic audit modals allowing admins to inspect AI notes and approve or reject claims instantly.
- **Beneficiary Pipeline:** 
  - Submit aid requests and supporting verification documents securely into the review queue.

---

## 🛠️ Local Development & Setup

### Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18+ recommended) & `npm`
- **Python 3.10+` & `pip`
- **MongoDB** (Local instance or MongoDB Atlas URI)

