# Reachie — AI Voice & Chat Assistant Documentation

## 1. Overview

**Reachie** is an intelligent, cross-platform voice and conversational assistant integrated into the **Reach** civic advocacy and crowdfunding mobile application.

Reachie enables users to:
- **Speak naturally via voice control**: Tap the microphone anywhere in the app to activate the **Top Audio Wave Bar**.
- **Exit the chat section and continue the flow**: Voice mode opens a dynamic island capsule at the top of the app (*"AI in control — Reachie is listening"*) while leaving the entire application visible and interactive below.
- **Short, human responses**: Reachie answers with concise, natural 1-2 sentence human statements rather than robotic essays.
- **Natural, warm voice synthesis**: Automatic detection and selection of high-quality human speech voices (Samantha, Google US English, Ava, Daniel) with fine-tuned pitch, cadence, and currency formatting (e.g. "30,000 rupees" instead of raw symbols).
- **Conversational campaign creation**: Directly guides users to create, preview, and revise campaigns live on the `/create` screen.
- **Instant navigation & theme control**: Direct voice navigation to any screen (`/explore`, `/profile`, `/creator`, `/activity`, `/create`) and instant UI theme switching (Dark Chocolate, Frosted Glass, Classic Editorial).
- **Groq API Cloud Acceleration**: High-speed reasoning with `llama-3.3-70b-versatile` producing structured tool actions and short human responses.

---

## 2. Architecture & Components

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                            │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────┐ │
│  │  ReachieTopVoiceBar   │  │ ReachieFloatingTrigger│  │ReachieModal │ │
│  │(Top Dynamic Wave Bar, │  │   (Floating Button)   │  │(Chat History│ │
│  │ "AI in Control" live) │  │                       │  │ & Confirm)  │ │
│  └───────────┬───────────┘  └───────────┬───────────┘  └──────┬──────┘ │
└──────────────┼──────────────────────────┼─────────────────────┼────────┘
               │                          │                     │
┌──────────────▼──────────────────────────▼─────────────────────▼────────┐
│                     ReachieContext (State Machine)                     │
│  • Conversation History        • Top Wave Bar Active State             │
│  • Spoken Text Subtitles       • Interim User Speech Transcript        │
│  • Active Draft Live Sync      • Action Dispatcher (Nav/Theme/Draft)   │
└──────────────┬────────────────────────────────────────┬────────────────┘
               │                                        │
       ┌───────▼────────┐                      ┌────────▼────────┐
       │ ReachieVoice   │                      │ ReachieService  │
       │ Service        │                      │ (AI Orchestrator│
       │ (STT & TTS)    │                      └────────┬────────┘
       └────────────────┘                               │
                        ┌───────────────────────────────┴───────────────┐
                        ▼                                               ▼
             ┌─────────────────────┐                         ┌─────────────────────┐
             │ Groq LLM Cloud API  │                         │ Local Deterministic │
             │ (Llama 3.3 70B Vers)│                         │ Engine (0-Key Fall) │
             └─────────────────────┘                         └─────────────────────┘
```

### Key Modules:

1. **`src/components/reachie/ReachieTopVoiceBar.tsx`**
   - Renders a floating Dynamic Island / top wave banner at the top of the app.
   - Shows **"AI IN CONTROL · LISTENING..."** with live 7-bar pulsating audio wave.
   - Displays real-time subtitles of what the user is saying and what Reachie responds.
   - Leaves the rest of the application completely interactive so users watch pages navigate and form fields populate live!
2. **`src/services/reachieVoiceService.ts`**
   - Automatically loads natural human voices (`Samantha`, `Google US English`, `Ava`, `Daniel`).
   - Normalizes text: strips emojis, symbols, converts `₹` to natural words (`rupees`), and limits spoken utterances to 1-2 punchy sentences.
   - Provides live waveform callbacks and speech state updates (`listening`, `processing`, `speaking`, `idle`).
3. **`src/services/reachieService.ts`**
   - High-performance orchestrator configured for **very short human answers**.
   - Structured JSON actions executed directly in the app.
   - Integrates with Groq API when configured, with offline deterministic fallback.
4. **`src/context/ReachieContext.tsx`**
   - Coordinates voice control, closing the chat modal on mic click, opening the top wave bar, and syncing live draft state with `CampaignRepository`.
5. **`app/(tabs)/create.tsx`**
   - Live synchronization with `useReachie().activeDraft` so campaign fields update in real time as the user speaks.

---

## 3. Supported Natural Language Capabilities

### A. Voice Control Flow ("Now the control is with AI")
1. Tap the **Microphone** icon anywhere (floating button, in modal, or on the top bar).
2. The chat modal exits immediately, bringing the user back to the application screen.
3. The **Top Audio Wave Bar** appears with **"AI IN CONTROL · LISTENING..."** and live 7-bar audio wave.
4. Speak your command naturally:
   - *"Open Explore"* ➔ Reachie says *"Taking you to Explore."* and navigates immediately.
   - *"Start a campaign about urban tree planting"* ➔ Reachie opens `/create`, populates the topic, and asks for audience.
   - *"Set budget to ₹30,000"* ➔ Reachie updates the budget field live on screen.
   - *"Switch theme to Dark Chocolate"* ➔ The UI instantly transforms to Dark Chocolate.

### B. Short, Conversational Human Responses
All answers are kept to 1-2 concise, clear sentences:
- *"How are funds distributed?"* ➔ *"Reach operates on an 85/10/5 model: 85% goes to direct ad spend, 10% for editorial review, and 5% for payment fees."*
- *"How is reach estimated?"* ➔ *"Every ₹100 reaches about 1,000 estimated views on social media, reaching roughly 750 unique individuals."*
- *"What is Trust Score?"* ➔ *"It's an editorial rating out of 10 checking evidence accuracy, creator identity, and ad compliance before publication."*
- *"How do I donate?"* ➔ *"Open any campaign on Explore and tap Back This Initiative to contribute with UPI or card."*

---

## 4. Groq API Configuration

Reachie is integrated with Groq's high-speed cloud LLM (`llama-3.3-70b-versatile`).

To add your Groq API key safely to your project `.env`:

```bash
printf "Enter EXPO_PUBLIC_GROQ_API_KEY (typing hidden): " && read -s val && echo && echo "EXPO_PUBLIC_GROQ_API_KEY=$val" >> ".env" && echo "Saved."
```

Once saved in `.env`, restart the Expo development server:
```bash
npx expo start --web
```

Reachie will automatically use Groq for all user queries and fall back gracefully to the local engine when offline.

---

## 5. Test Verification

Run the acceptance suite anytime:
```bash
npm test
```
Result: **38/38 tests passing**.
