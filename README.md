# ⚡ Ather Queue — Real-Time Waitlist for EV Charging

Ather Queue is a real-time, resilient, and visually stunning queue management system tailored for **Ather Grid EV Charging Stations**. Using live telemetry from the Google Places API, the system automatically detects when chargers become available, dynamically calculates rider queues, and coordinates instant notifications so riders never waste time waiting at fully occupied stations.

---

## ✨ Features

- **📍 Dynamic Cyber-Dark Map:** Premium interactive maps with glowing pulsing indicators, custom vector charging marker icons, and a Bangalore coordinate fallback if GPS permission is disabled.
- **⏱️ Dynamic Waitlist Rank:** Real-time computed positions (`Rank = Active riders ahead + 1`). This eliminates database synchronization race conditions and compacts positions instantly when someone claims, skips, or leaves.
- **⚡ Concurrent Charger Slots:** Multi-charger monitoring capable of handling up to `N` concurrent slot notifications based on real-time station availability.
- **🚀 Zero-Lag Shifts:** Immediate notification loops triggered instantly inside the join, claim, skip, and leave controllers, completely bypassing background scheduler delay times.
- **✉️ Secure Claim Windows:** Automatic generation of secure claim tokens sent via premium dark-themed HTML emails, giving riders a 5-minute window to navigate and plug in.

---

## 🛠️ System Architecture

- **Frontend:** React 19 (Vite) styled with high-performance Tailwind CSS v4, custom glassmorphism overlays, and hardware-accelerated CSS keyframe animations.
- **Backend:** Node.js + Express API server, running custom rate limiters and standard security controllers.
- **Database:** MongoDB (Mongoose) for persistent grid station caches and active waitlist entries.
- **Scheduler & Poller:** Redis (ioredis) + BullMQ to coordinate background station telemetry checks.
- **APIs:** Google Places API (New) for EV connector aggregations, and Gmail SMTP transport for fast email delivery.

---

## ⚙️ Local Development Setup

### Prerequisite Accounts
1. **MongoDB Atlas** (Cloud database tier).
2. **Upstash Redis** (Serverless Redis database).
3. **Google Maps Platform** API key (with Places API and Maps JavaScript API enabled).
4. **Gmail Account** (with an App Password configured for SMTP mailer).

---

### 1. Backend Configuration (`ather-queue-backend`)
1. Navigate to the backend directory:
   ```bash
   cd ather-queue-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend root:
   ```ini
   PORT=5000
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ather-queue
   UPSTASH_REDIS_URL=rediss://default:<token>@<host>.upstash.io:6379
   UPSTASH_REDIS_TOKEN=<token>
   GOOGLE_PLACES_API_KEY=AIzaSy...
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # Gmail App Password
   CLAIM_WINDOW_MINUTES=5
   POLL_INTERVAL_MS=90000        # Perfect 1.5 min polling frequency
   FRONTEND_URL=http://localhost:5173
   ```
4. Run the development server (runs nodemon):
   ```bash
   npm run dev
   ```

---

### 2. Frontend Configuration (`ather-queue-frontend`)
1. Navigate to the frontend directory:
   ```bash
   cd ../ather-queue-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the frontend root:
   ```ini
   VITE_GOOGLE_MAPS_KEY=AIzaSy...
   VITE_API_URL=http://localhost:5000/api
   ```
4. Run the development server (Vite):
   ```bash
   npm run dev
   ```

---

## 🚀 Cloud Deployment

### 1. Backend (Render — render.com)
* Create a **Web Service** on Render, connecting your Git Repository.
* Set the directory to `ather-queue-backend`.
* **Build Command:** `npm install`
* **Start Command:** `npm start`
* Configure all environment variables matching the backend `.env`.

### 2. Frontend (Vercel — vercel.com)
* Create a project, connecting your Git Repository.
* Set the Root Directory to `ather-queue-frontend`.
* Add environment variables:
  * `VITE_GOOGLE_MAPS_KEY` = your Google Maps key.
  * `VITE_API_URL` = your live Render backend URL with `/api` at the end (e.g. `https://your-app.onrender.com/api`).
* Click **Deploy**!

*Don't forget to update your Backend Render environment variables, setting `FRONTEND_URL` to your newly created live Vercel link (e.g. `https://your-app.vercel.app`)!*
