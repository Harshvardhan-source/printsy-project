# PrintShop — Complete Setup Guide
# React + Django + MongoDB → Android APK via Capacitor

## FOLDER STRUCTURE
```
printshop-web/
├── backend/                  ← Django API
│   ├── core/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── api/
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── db.py
│   │   ├── auth_utils.py
│   │   └── sms.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
└── frontend/                 ← React web app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js
    │   ├── api.js
    │   └── index.js
    └── package.json
```

═══════════════════════════════════════════════════════
PART 1 — BACKEND SETUP (Django + MongoDB)
═══════════════════════════════════════════════════════

── Step 1: Install MongoDB ─────────────────────────────

Option A (Windows — recommended):
  1. Go to: https://www.mongodb.com/try/download/community
  2. Download MongoDB Community Server
  3. Run installer → choose "Complete"
  4. MongoDB starts automatically as a Windows service

Verify it's running:
  Open PowerShell and run:
    mongosh
  You should see a MongoDB shell. Type "exit" to quit.

Option B (use MongoDB Atlas — free cloud, no install):
  1. Go to: https://cloud.mongodb.com
  2. Sign up free → Create a free cluster
  3. Get your connection string (looks like):
     mongodb+srv://user:pass@cluster.mongodb.net/printshop
  4. Paste it in backend/.env as MONGO_URI

── Step 2: Set up Python environment ───────────────────

Open PowerShell and run:

  cd C:\path\to\printshop-web\backend

  # Create virtual environment
  python -m venv venv
  venv\Scripts\activate

  # Install packages
  pip install -r requirements.txt

── Step 3: Configure .env ──────────────────────────────

Open backend/.env and set:

  DJANGO_SECRET_KEY=any-long-random-string-here
  MONGO_URI=mongodb://localhost:27017
  MONGO_DB_NAME=printshop
  JWT_SECRET=another-long-random-string
  OTP_CONSOLE_MODE=True      ← OTP prints in terminal (dev mode)

  # For real SMS, set OTP_CONSOLE_MODE=False and add:
  # TWILIO_ACCOUNT_SID=your_sid
  # TWILIO_AUTH_TOKEN=your_token
  # TWILIO_PHONE_NUMBER=+1234567890

── Step 4: Run the backend ─────────────────────────────

  cd C:\path\to\printshop-web\backend
  venv\Scripts\activate
  python manage.py runserver 0.0.0.0:8000

You should see:
  Starting development server at http://0.0.0.0:8000/

Test it in browser:
  http://localhost:8000/api/health/
  Should return: {"status": "ok", "mongodb": "connected"}

═══════════════════════════════════════════════════════
PART 2 — FRONTEND SETUP (React)
═══════════════════════════════════════════════════════

── Step 1: Install dependencies ────────────────────────

Open a new PowerShell:

  cd C:\path\to\printshop-web\frontend
  npm install

── Step 2: Configure API URL ───────────────────────────

Open frontend/src/api.js
Change BASE_URL to your backend:

  Development:
    const BASE_URL = 'http://localhost:8000';

  If backend is on another machine:
    const BASE_URL = 'http://192.168.1.x:8000';

── Step 3: Run the frontend ────────────────────────────

  cd C:\path\to\printshop-web\frontend
  npm start

Opens automatically at: http://localhost:3000
You should see the PrintShop login screen.

── Step 4: Test full flow ──────────────────────────────

1. Click "Sign up"
2. Enter name, phone, password
3. Click "Send OTP" → look at BACKEND terminal for the OTP
4. Enter the OTP → click "Create account"
5. You're in! Your short ID shows (e.g. A123)
6. Try creating a job, viewing profile, etc.

NOTE: OTP appears in the Django terminal window like:
  ==================================================
    OTP for 9876543210: 482910
    (Console mode)
  ==================================================

═══════════════════════════════════════════════════════
PART 3 — CONVERT TO ANDROID APK (Capacitor)
═══════════════════════════════════════════════════════

This wraps your React web app into a real Android APK.
No code changes needed — same app, runs as Android app.

── Prerequisites ────────────────────────────────────────

Install these once:
  1. Node.js (already installed)
  2. Android Studio: https://developer.android.com/studio
     - During install: include Android SDK, AVD Manager
     - Recommended API level: API 33 (Android 13)

── Step 1: Build the React app ─────────────────────────

IMPORTANT: Before building, update src/api.js to use
your DEPLOYED backend URL (not localhost).
If backend is on Railway: https://your-app.railway.app
OR use ngrok for testing: https://xxxx.ngrok-free.app

  cd C:\path\to\printshop-web\frontend
  npm run build

This creates a "build" folder with the compiled app.

── Step 2: Add Capacitor ────────────────────────────────

  cd C:\path\to\printshop-web\frontend

  npm install @capacitor/core @capacitor/cli @capacitor/android

  npx cap init "PrintShop" "com.printshop.app" --web-dir build

── Step 3: Add Android platform ────────────────────────

  npx cap add android

  # Sync web files into Android project
  npx cap sync android

── Step 4: Open in Android Studio ─────────────────────

  npx cap open android

Android Studio opens. Wait for Gradle sync to finish (2-5 mins).

── Step 5: Run on emulator or device ───────────────────

Option A (emulator):
  - In Android Studio: Tools → Device Manager → Create Device
  - Choose Pixel 6 → API 33 → Download → Finish
  - Click ▶ Run button

Option B (real phone):
  - Enable Developer Options on phone:
    Settings → About Phone → tap "Build Number" 7 times
  - Enable USB Debugging:
    Settings → Developer Options → USB Debugging ON
  - Connect phone via USB
  - Click ▶ Run → select your phone

── Step 6: Build release APK ───────────────────────────

In Android Studio:
  Build → Generate Signed Bundle / APK → APK → Next
  → Create new keystore (save the password!)
  → Release → Finish

APK appears at:
  frontend/android/app/build/outputs/apk/release/app-release.apk

Send this APK to any Android phone to install!

── IMPORTANT: API URL for Android ──────────────────────

When running as Android APK, you CANNOT use localhost.
You must use either:

  A) Your deployed Railway URL (production):
     https://your-app.railway.app

  B) ngrok for development:
     https://xxxx.ngrok-free.app

  C) Your machine IP (phone must be on same WiFi):
     http://192.168.1.x:8000

Update this in frontend/src/api.js BEFORE running npm run build.

── capacitor.config.json (auto-created, but check it) ──

{
  "appId": "com.printshop.app",
  "appName": "PrintShop",
  "webDir": "build",
  "server": {
    "androidScheme": "https"
  }
}

═══════════════════════════════════════════════════════
PART 4 — DEPLOY BACKEND TO RAILWAY (permanent URL)
═══════════════════════════════════════════════════════

So your APK works without ngrok:

1. Push backend to GitHub:
   cd backend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USER/printshop-backend
   git push -u origin main

2. Go to railway.app → New Project → Deploy from GitHub
3. Select your backend repo
4. Add environment variables in Railway dashboard:
   - All values from your .env file
   - MONGO_URI = your MongoDB Atlas URI
5. Railway gives you a URL like: https://printshop-backend.railway.app
6. Update frontend/src/api.js with this URL
7. Run: npm run build && npx cap sync android
8. Build APK again in Android Studio

═══════════════════════════════════════════════════════
QUICK REFERENCE — API ENDPOINTS
═══════════════════════════════════════════════════════

POST  /api/auth/send-otp/     { phone }
POST  /api/auth/register/     { phone, otp, name, password }
POST  /api/auth/login/        { phone, password, otp }
GET   /api/auth/me/           (Bearer token)

GET   /api/shops/nearby/      (Bearer token)
GET   /api/jobs/              (Bearer token)
POST  /api/jobs/create/       { shop_id, file_name, pages, color_mode, paper_size, copies }
GET   /api/jobs/<id>/         (Bearer token)
POST  /api/jobs/<id>/cancel/  (Bearer token)
POST  /api/cost/              { pages, color_mode, paper_size, copies, double_sided }

GET   /api/health/

═══════════════════════════════════════════════════════
COMMON ERRORS AND FIXES
═══════════════════════════════════════════════════════

Error: ModuleNotFoundError: No module named 'pymongo'
Fix:   pip install -r requirements.txt

Error: ServerSelectionTimeoutError (MongoDB)
Fix:   MongoDB is not running.
       Windows: net start MongoDB
       Or use MongoDB Atlas connection string

Error: CORS error in browser
Fix:   Backend not running, or CORS_ALLOW_ALL_ORIGINS not set

Error: "No OTP found" even after clicking Send OTP
Fix:   OTP expired (10 min limit). Click Send OTP again.

Error: APK works but API calls fail
Fix:   localhost doesn't work in APK.
       Use ngrok or deployed Railway URL in api.js

Error: Gradle sync failed in Android Studio
Fix:   File → Invalidate Caches → Restart
       Or: npx cap sync android again after rebuild

Error: App crashes on Android
Fix:   Check Logcat in Android Studio for the actual error
       Most common: wrong API URL or missing HTTPS

═══════════════════════════════════════════════════════
ADD A TEST SHOP TO MONGODB
═══════════════════════════════════════════════════════

To test the job creation flow, add a shop to MongoDB.
Open mongosh (MongoDB shell) and run:

  use printshop

  db.shops.insertOne({
    name: "Test Print Shop",
    address: "123 MG Road, Bengaluru",
    lat: 12.9716,
    lng: 77.5946,
    terminal_key: "test-terminal-key-001",
    is_online: true,
    queue_length: 0,
    opens_at: "09:00",
    closes_at: "21:00",
    created_at: new Date()
  })

Now the "New print job" screen will show this shop.
