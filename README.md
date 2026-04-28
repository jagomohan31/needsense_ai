# NeedSense AI 🤝

> **AI-powered resource allocation platform for NGOs, community groups, and volunteer networks.**
> Built with Next.js 14, Firebase, and Google Gemini AI.

---

## 🚀 Live Demo
**[needsense-ai.vercel.app](https://needsense-ai.vercel.app)**

Demo credentials:
- Admin: `admin@needsense.ai` / `admin123`
- Volunteer: `volunteer@needsense.ai` / `vol123`

---

## 🧱 Architecture

```
NeedSense AI
├── Frontend     Next.js 14 (App Router) + TypeScript + Tailwind CSS
├── Auth         Firebase Authentication (Email/Password)
├── Database     Cloud Firestore (real-time NoSQL)
├── Storage      Firebase Storage (images)
├── AI           Google Gemini 1.5 Flash (urgency analysis)
├── Maps         Leaflet + OpenStreetMap (no API key needed)
├── Charts       Recharts
└── Deploy       Vercel (recommended) or Firebase Hosting
```

---

## 📁 Project Structure

```
needsense-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout
│   │   ├── globals.css                 # Global styles
│   │   ├── auth/
│   │   │   ├── login/page.tsx          # Login
│   │   │   └── register/page.tsx       # Register (role selection)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx              # Admin sidebar layout
│   │   │   ├── page.tsx                # Overview + stats
│   │   │   ├── requests/page.tsx       # Full request management + AI
│   │   │   ├── volunteers/page.tsx     # Volunteer directory
│   │   │   ├── map/page.tsx            # Live map
│   │   │   └── analytics/page.tsx      # Charts + metrics
│   │   └── volunteer/
│   │       ├── tasks/page.tsx          # Volunteer task portal
│   │       └── profile/page.tsx        # Volunteer profile
│   ├── components/
│   │   └── map/MapComponent.tsx        # Leaflet map (dynamic import)
│   ├── context/
│   │   └── AuthContext.tsx             # Global auth state
│   ├── lib/
│   │   ├── firebase.ts                 # Firebase init
│   │   ├── db.ts                       # All Firestore operations
│   │   ├── gemini.ts                   # Gemini AI service
│   │   ├── storage.ts                  # Firebase Storage service
│   │   └── utils.ts                    # Utility functions
│   └── types/
│       └── index.ts                    # All TypeScript types
├── firestore.rules                     # Security rules
├── storage.rules                       # Storage rules
├── firestore.indexes.json              # Composite indexes
└── vercel.json                         # Vercel config
```

---

## ⚡ Quick Start (Local)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/needsense-ai.git
cd needsense-ai
npm install
```

### 2. Set up Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project (e.g., `needsense-ai`)
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** → Start in test mode
5. Enable **Storage** → Start in test mode
6. Go to **Project Settings** → Your apps → Add Web App
7. Copy the config values

### 3. Get Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **Get API Key** → Create API key
3. Copy the key

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=needsense-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=needsense-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=needsense-ai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_GEMINI_API_KEY=AIza...
```

### 5. Deploy Firestore Rules & Indexes

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules,firestore:indexes
```

### 6. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Create Demo Accounts

After running locally, register two accounts:

**Admin account:**
- Email: `admin@needsense.ai`
- Password: `admin123`
- Role: NGO / Admin

**Volunteer account:**
- Email: `volunteer@needsense.ai`
- Password: `vol123`
- Role: Volunteer
- Add skills: Medical, Food Distribution

---

## 🌍 Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add NEXT_PUBLIC_GEMINI_API_KEY

# Redeploy with env vars
vercel --prod
```

---

## 🗃️ Firestore Database Schema

### `users/{uid}`
```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "role": "admin | volunteer",
  "phone": "string",
  "address": "string",
  "skills": ["medical", "food_distribution", ...],
  "availability": "available | busy | offline",
  "activeTasksCount": 0,
  "completedTasksCount": 0,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `requests/{id}`
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "category": "food | medicine | shelter | blood | elderly_help | disaster | education | others",
  "address": "string",
  "location": { "lat": 0.0, "lng": 0.0 },
  "peopleAffected": 5,
  "imageURL": "string",
  "status": "pending | assigned | in_progress | completed | cancelled",
  "urgencyLevel": "critical | high | medium | low",
  "urgencyScore": 8,
  "submittedBy": "uid",
  "assignedTo": "uid",
  "aiAnalysis": {
    "predictedCategory": "food",
    "urgencyScore": 8,
    "urgencyLevel": "high",
    "summary": "Urgent food shortage...",
    "suggestedSkill": "food_distribution",
    "confidence": 0.92,
    "analysisTimestamp": "timestamp"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `assignments/{id}`
```json
{
  "requestId": "string",
  "requestTitle": "string",
  "volunteerId": "string",
  "volunteerName": "string",
  "assignedBy": "string",
  "status": "pending_acceptance | accepted | rejected | completed",
  "assignedAt": "timestamp",
  "acceptedAt": "timestamp",
  "completedAt": "timestamp"
}
```

### `notifications/{id}`
```json
{
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "task_assigned | task_completed | urgent_alert",
  "read": false,
  "relatedId": "requestId",
  "createdAt": "timestamp"
}
```

---

## 🤖 AI Features (Gemini)

When a request is submitted, Gemini 1.5 Flash analyzes:
1. **Category** — food, medicine, shelter, blood, elderly_help, disaster, education
2. **Urgency Score** — 1–10 (10 = life-threatening)
3. **Urgency Level** — critical / high / medium / low
4. **One-line summary** — human-readable brief
5. **Suggested volunteer skill** — best skill type for this need
6. **Confidence** — AI confidence score

**Smart Matching** then:
- Scores each volunteer 0–100
- Weights: skill match (50pts) + availability (30pts) + low workload (20pts)
- Sorts volunteers by score descending
- Highlights the top match

---

## 🏆 Hackathon Winning Tips

### Key Technical Differentiators
1. **Real-time AI analysis** using Gemini 1.5 Flash — not just categorization, full urgency scoring
2. **Smart volunteer matching algorithm** — multi-factor scoring
3. **Live map** with urgency heat markers using Leaflet
4. **Complete role-based system** — admin + volunteer portals
5. **Production-ready** security rules and architecture

### Talking Points for Demo
- Show the AI analyzing a request live
- Show the match score % for each volunteer
- Show the live map with red/yellow/green markers
- Show real-time notifications when a task is assigned
- Show the analytics dashboard

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom design tokens |
| Animation | Framer Motion |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| AI | Google Gemini 1.5 Flash |
| Maps | Leaflet + OpenStreetMap |
| Charts | Recharts |
| Deploy | Vercel |

---

## 📄 License

MIT — Built for hackathon purposes.
