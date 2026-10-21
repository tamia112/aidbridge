# 🌍 AidbridgE

AidbridgE is a full-stack humanitarian aid and donation management platform engineered to bring transparency, accountability, and AI-driven fraud detection to charitable campaigns.

## ✨ Key Features

- **AI Forensic Verification:** Integrates a Python/Flask microservice running **TinyLlama (Ollama)** to analyze uploaded beneficiary documents, scoring campaign legitimacy and flagging high-risk submissions automatically.
- **M-Pesa Integration:** Secure mobile money donations powered by the Safaricom Daraja API (STK Push).
- **Role-Based Dashboards:**
  - **Donor Portal:** Discover active verified causes, track funding impact, and execute seamless mobile payments.
  - **Admin Mission Control:** Review AI forensic trust scores, audit beneficiary documents, and approve or reject aid campaigns.
- **Glassmorphic UI:** Modern, responsive interface built with React, Vite, and Tailwind CSS.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB Atlas / Local MongoDB
- **AI Microservice:** Python, Flask, TinyLlama via Ollama

---

## 🚀 Getting Started Locally

### Prerequisites
Make sure you have **Node.js**, **Python 3**, and **MongoDB** installed on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/tamiamwandu118-byte/aidbridge.git
cd aidbridge
```

### 2. Set Up & Run the Backend
```bash
cd server
npm install
```
Create a `.env` file inside the `server/` directory with:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
```
Then start the server:
```bash
npm run dev
```

### 3. Set Up & Run the AI Microservice
Open a new terminal window:
```bash
cd ai_service
python3 -m venv venv
source venv/bin/activate
pip install flask flask-cors requests
python3 app.py
```

### 4. Set Up & Run the Frontend
Open another terminal window:
```bash
cd client
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.