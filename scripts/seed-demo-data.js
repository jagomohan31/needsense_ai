// ============================================================
// DEMO SEED SCRIPT
// Run this in your browser console after logging in as admin
// to populate the app with demo data for presentation
// ============================================================
// 
// USAGE: Open browser devtools on your deployed app,
// paste this entire script into the console, and run it.
//
// It will create sample requests with realistic data
// including lat/lng coordinates for the map view.
// ============================================================

const DEMO_REQUESTS = [
  {
    title: "Emergency food supplies for flood victims",
    description: "Flash floods have displaced 35 families in the eastern ward. They need immediate food supplies, clean water, and basic essentials. Many are elderly and have children.",
    category: "food",
    address: "East Ward, Kolkata, WB",
    location: { lat: 22.5726, lng: 88.4124 },
    peopleAffected: 150,
    urgencyLevel: "critical",
    urgencyScore: 9,
    status: "pending",
    aiAnalysis: {
      predictedCategory: "food",
      urgencyScore: 9,
      urgencyLevel: "critical",
      summary: "Critical food shortage for 150 flood-displaced individuals requiring immediate aid",
      suggestedSkill: "food_distribution",
      confidence: 0.95,
      analysisTimestamp: new Date()
    }
  },
  {
    title: "Medical assistance needed for elderly residents",
    description: "Several elderly residents in the old city area require regular medication that has run out. Some have diabetes and hypertension. Home visits urgently needed.",
    category: "medicine",
    address: "Old City Area, Kolkata, WB",
    location: { lat: 22.5604, lng: 88.3639 },
    peopleAffected: 12,
    urgencyLevel: "high",
    urgencyScore: 8,
    status: "assigned",
    aiAnalysis: {
      predictedCategory: "medicine",
      urgencyScore: 8,
      urgencyLevel: "high",
      summary: "Elderly residents without critical medication for chronic conditions",
      suggestedSkill: "medical",
      confidence: 0.92,
      analysisTimestamp: new Date()
    }
  },
  {
    title: "Temporary shelter required for 8 families",
    description: "Building collapse in the northern area has left 8 families homeless. They need temporary shelter arrangement immediately. Winter is approaching.",
    category: "shelter",
    address: "North Kolkata",
    location: { lat: 22.5950, lng: 88.3720 },
    peopleAffected: 32,
    urgencyLevel: "critical",
    urgencyScore: 10,
    status: "in_progress",
    aiAnalysis: {
      predictedCategory: "shelter",
      urgencyScore: 10,
      urgencyLevel: "critical",
      summary: "8 families completely homeless after building collapse, need immediate shelter",
      suggestedSkill: "construction",
      confidence: 0.98,
      analysisTimestamp: new Date()
    }
  },
  {
    title: "Blood donation urgently needed — O negative",
    description: "A 7-year-old child at SSKM Hospital needs O-negative blood for emergency surgery. Parents are unable to find donors. Time-critical situation.",
    category: "blood",
    address: "SSKM Hospital, Kolkata",
    location: { lat: 22.5388, lng: 88.3432 },
    peopleAffected: 1,
    urgencyLevel: "critical",
    urgencyScore: 10,
    status: "pending",
    aiAnalysis: {
      predictedCategory: "blood",
      urgencyScore: 10,
      urgencyLevel: "critical",
      summary: "Child needs O-negative blood for emergency surgery within hours",
      suggestedSkill: "medical",
      confidence: 0.99,
      analysisTimestamp: new Date()
    }
  },
  {
    title: "Free tutoring needed for underprivileged students",
    description: "30 students from low-income families preparing for board exams need free tutoring in Math and Science. No access to paid coaching.",
    category: "education",
    address: "South Kolkata Community Center",
    location: { lat: 22.5148, lng: 88.3426 },
    peopleAffected: 30,
    urgencyLevel: "medium",
    urgencyScore: 5,
    status: "completed",
    aiAnalysis: {
      predictedCategory: "education",
      urgencyScore: 5,
      urgencyLevel: "medium",
      summary: "Board exam students from low-income families need free tutoring support",
      suggestedSkill: "education",
      confidence: 0.88,
      analysisTimestamp: new Date()
    }
  },
  {
    title: "Elderly woman living alone needs daily help",
    description: "82-year-old woman living alone after her son moved abroad. Needs help with grocery shopping, cooking, and medical appointments twice a week.",
    category: "elderly_help",
    address: "Ballygunge, Kolkata",
    location: { lat: 22.5238, lng: 88.3662 },
    peopleAffected: 1,
    urgencyLevel: "high",
    urgencyScore: 7,
    status: "assigned",
    aiAnalysis: {
      predictedCategory: "elderly_help",
      urgencyScore: 7,
      urgencyLevel: "high",
      summary: "Isolated elderly woman needs regular assistance with daily activities",
      suggestedSkill: "elderly_care",
      confidence: 0.91,
      analysisTimestamp: new Date()
    }
  }
];

// Run in browser console:
async function seedDemoData() {
  const { db } = window.__needsense_firebase || {};
  if (!db) {
    console.log("Run this on the NeedSense AI app page after login");
    return;
  }
  
  const { addDoc, collection, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js");
  
  for (const req of DEMO_REQUESTS) {
    await addDoc(collection(db, "requests"), {
      ...req,
      submittedBy: "demo",
      submittedByName: "Demo Admin",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("Created:", req.title);
  }
  
  console.log("✅ Demo data seeded! Refresh the dashboard.");
}

seedDemoData();
