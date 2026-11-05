# Reach — Community Campaign Amplification Platform

[![Expo SDK 52](https://img.shields.io/badge/Expo-SDK%2052-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.76.9-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Groq AI](https://img.shields.io/badge/Groq-Fast%20Inference%20%26%20Whisper-F55036?style=for-the-badge)](https://groq.com/)

**Reach** is a modern, mobile-first campaign creation and message amplification platform built with **Expo**, **React Native**, and **Supabase**. It empowers creators and community organizers to launch causes, set reach milestones, draft compelling stories with AI, and collaborate hands-free using **Reachie**, an intelligent voice-activated campaign co-pilot.

---

## 🌟 Key Features

### 🎙️ Reachie: The AI Voice & Chat Assistant
- **Voice-First Creation**: Dictate and steer campaign drafts with real-time audio transcription powered by **Groq Whisper** (`whisper-large-v3-turbo`).
- **Conversational Story Generation**: Automatically extract titles, taglines, locations, categories, goals, and narratives from voice conversations using **Groq LLM** (`qwen/qwen3.8-27b`).
- **Creator Review Controls**: Real-time high-contrast controls to inspect, edit, and confirm AI-extracted fields before publishing.

### 🚀 5-Stage Guided Campaign Creator
1. **Basics**: Title, tagline, category tags, location, and beneficiary information with instant AI drafting.
2. **Reach Goals**: Target reach metrics, amplification goals, and financial support tiers.
3. **Story**: Narrative builder, problem statement, impact goals, and structured pitch.
4. **Visuals**: Cover media picker, image preview, and dynamic theme palette selection.
5. **Review & Publish**: Live preview mode, acceptance validation, and one-tap submission.

### 🌐 Feed, Discovery & Engagement
- **Curated Campaign Feed**: Filter by category (Community, Education, Health, Environment, Innovation, Arts, Crisis Relief).
- **Campaign Detail & Progress**: Live reach meter, funding progress bars, and recent backer activity.
- **Micro-Contributions**: Seamless support, message amplification, and native share sheets.

### 🛡️ Enterprise-Grade Foundation
- **Supabase Backend**: PostgreSQL database with Row Level Security (RLS) policies and Auth integration.
- **Offline / Mock Fallback**: Automatic graceful fallback to mock data repositories when offline or in test environments.
- **Universal Expo Router**: Clean file-based routing architecture with deep linking support across iOS, Android, and Web.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Expo SDK 52](https://expo.dev/) (New Architecture enabled), [React Native 0.76.9](https://reactnative.dev/) |
| **Navigation** | [Expo Router v4](https://docs.expo.dev/router/introduction/) |
| **Language** | [TypeScript 5.3](https://www.typescriptlang.org/) |
| **Backend & DB** | [Supabase](https://supabase.com/) (`@supabase/supabase-js`) |
| **AI & Voice** | [Groq Cloud API](https://groq.com/) (Qwen 3.8 27B + Whisper Large v3 Turbo), `expo-av`, `expo-speech` |
| **Icons & UI** | `lucide-react-native`, `react-native-svg`, Safe Area Context |

---

## 📂 Project Structure

```text
├── app/                      # Expo Router screens and navigators
│   ├── (tabs)/               # Bottom tab navigation
│   │   ├── index.tsx         # Home / Feed screen
│   │   ├── explore.tsx       # Discovery and search
│   │   ├── create.tsx        # Campaign creation wizard
│   │   ├── activity.tsx      # Community activity feed
│   │   └── profile.tsx       # User profile and stats
│   ├── campaign/[id].tsx     # Campaign detail view
│   ├── creator/index.tsx     # Creator workspace & review
│   ├── login.tsx             # Authentication screen
│   └── _layout.tsx           # Root layout & providers
│
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Buttons, Badges, ReachMeter, ProgressBars
│   │   ├── creation/         # Multi-step creation components
│   │   └── reachie/          # Reachie voice modal, bar & trigger
│   ├── context/              # Reachie & app state contexts
│   ├── data/                 # Seed data and mock campaigns
│   ├── repositories/         # Supabase data layer with offline fallbacks
│   ├── services/             # Groq AI, Reachie voice orchestrator, Supabase
│   ├── theme/                # Theme system and design tokens
│   └── types/                # TypeScript type definitions
│
├── scripts/
│   └── verify_acceptance.ts  # End-to-end verification script
├── supabase_schema.sql       # Database schema & RLS policies
└── eas.json                  # EAS Build & release profiles
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)
- [Expo Go](https://expo.dev/go) app on your iOS/Android device (or local simulator)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Bharathreddy-1010/Reach_Campain_App.git
cd Reach_Campain_App
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

Set the following in `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_GROQ_API_KEY=your-groq-api-key
```

### 3. Start Development Server
```bash
# Start Metro bundler
npx expo start

# Or run directly on specific platforms:
npm run ios        # iOS simulator
npm run android    # Android emulator / connected device
npm run web        # Web browser
```

---

## 🧪 Testing & Verification

Run the comprehensive acceptance suite to verify campaign drafting, voice intent extraction, and repository integrations:
```bash
npm run test
```

Typecheck the codebase:
```bash
npm run typecheck
```

---

## 📦 Building with EAS

This project is pre-configured with `eas.json` for cloud builds:

```bash
# Build Android APK preview
npx eas-cli build -p android --profile preview

# Build iOS Simulator preview
npx eas-cli build -p ios --profile preview
```

---

## 📄 License

This project is licensed under the MIT License.
