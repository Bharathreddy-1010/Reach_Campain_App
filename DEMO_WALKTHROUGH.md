# Reach — Demo Video Walkthrough & Presentation Script

This script provides an exact 3-minute flow to record or present the **Reach** mobile application prototype for competition judging.

---

## 🎬 Act 1: The Product Concept & Home Screen (0:00 - 0:35)
* **Goal**: Establish the non-profit / amplification platform value proposition.
* **Steps**:
  1. Open the **Reach** app on the **Home** tab (`app/(tabs)/index.tsx`).
  2. Point out the hero badge: *"Community-Funded Message Amplification"*.
  3. Explain the **Critical Business Distinction**:
     > *"Reach is not a charity donation app. Contributions fund advertising distribution to amplify important messages to people who wouldn't otherwise see them."*
  4. Showcase the **Illustrative Reach Model Preview** (e.g. ₹1,000 = ~10,000 impressions / ~7,500 people reached). Emphasize that reach is calculated based on transparent mathematical baseline estimates, not fabricated guarantees.
  5. Review the **How Reach Works** section:
     - **Create**: Prepare message, story, and verified evidence.
     - **Review**: Platform moderation and factual checks before eligible distribution.
     - **Amplify**: Community backs advertising budget (85% directly to ads).
  6. Scroll through the curated **Featured Campaigns** feed.

---

## 🔍 Act 2: Campaign Discovery & Exploration (0:35 - 0:55)
* **Goal**: Demonstrate search, multi-category taxonomy, and sorting filters.
* **Steps**:
  1. Tap the **Explore** tab in the bottom navigation bar.
  2. Type `"clean"` or `"water"` into the live search input. Observe the instant reactive filtering to the Clean Water initiative.
  3. Clear the search input and tap through the 10 horizontal category filters: *Public Policy, Health, Science, Education, Environment, Community, Arts & Culture, Economic Policy, Business*.
  4. Change the sort order to **"% Funded"** or **"Reach Potential"** to show instant re-ordering of campaign cards.

---

## 📖 Act 3: Editorial Campaign Details & Transparency (0:55 - 1:25)
* **Goal**: Prove deep editorial trust, verified sources, and transparent fee breakdown.
* **Steps**:
  1. Tap on **"Project Jal: Clean Water in Rural Mandya"**.
  2. Point out the editorial header, cover image, category badge, and publishing metadata.
  3. Scroll through the rich narrative story:
     - Highlight the statistical callout: *"38% reduction in waterborne infections"*.
     - Point out the **Primary Sources** section with real citations (Central Ground Water Board, Lancet Global Health).
  4. Inspect the **Use of Funds Breakdown**:
     - **85% Direct Ad Distribution**
     - **10% Compliance & Fact-Checking**
     - **5% Payment Processing**
  5. Expand the refund policy and distribution disclosures.

---

## 💳 Act 4: Transparent Simulated Contribution Flow (1:25 - 1:55)
* **Goal**: Show transparent fee calculation, simulated payment options, and deterministic receipt generation.
* **Steps**:
  1. Tap the floating **"Back This Campaign"** button.
  2. **Stage 1 (Amount)**:
     - Select preset `₹500` or type `₹1,000` in the custom input.
     - Observe the live estimated reach calculation updating: *~10,000 impressions (~7,500 people reached)*.
  3. **Stage 2 (Review)**:
     - Tap **Continue**. Review the itemized breakdown (₹1,000 contribution, ₹0 demo fee = ₹1,000 total).
     - Read the prominent legal disclaimer confirming funds are allocated to ad delivery.
  4. **Stage 3 (Simulated Checkout)**:
     - Tap **Proceed to Checkout**. Select **UPI (Google Pay / PhonePe / Paytm)**.
     - Demonstrate QA test controls:
       - *(Optional test)* Tap **Simulate Failed Payment** to prove that failed transactions never alter campaign funding.
       - Tap **Complete Simulated Payment**.
  5. **Stage 4 (Receipt & Confirmation)**:
     - View the generated demo receipt ID (`REC-xxxx-xxxx`), total amount, and campaign title.
     - Tap **Done & View Campaign**.
     - Point out that the campaign funding progress bar immediately reflects the contribution!

---

## ✍️ Act 5: 5-Step Campaign Creation & Autosave (1:55 - 2:35)
* **Goal**: Demonstrate the required 5-step creation sequence, AI/Voice assistance fallback, and draft persistence.
* **Steps**:
  1. Tap the central **Create** tab in the bottom bar.
  2. Tap **"Create with Your Voice"** or **"AI Assistant"**:
     - Select the sample prompt *"Air Quality Monitoring in Primary Schools"*.
     - Tap **Apply to Draft**. Explain that the demo assistant populates editable fields without fabricated live promises.
  3. Walk through each step:
     - **Step 1 — Basics**: Show the 60-character title counter (`42/60`).
     - **Step 2 — Story**: Add a story section, caption, and external source URL.
     - **Step 3 — Visuals**: Tap the interactive **Placement Preview** toggle between **Instagram Feed** and **Facebook Feed**.
     - **Step 4 — Reach**: Select target region (*India / Tier 2 Cities*) and channels (*Instagram & Meta*). Observe reach baseline calculations.
     - **Step 5 — Submit**:
       - Review the complete editorial preview.
       - Enter an explicit creator funding goal (e.g. `₹25,000`). Notice it is *never* silently auto-filled.
       - Check the mandatory verification and distribution policy confirmation boxes.
  4. Tap **"Save as Draft"**:
     - Switch to another tab, return to Create, and show the draft seamlessly restored with all fields and the current step intact!
  5. Tap **Submit Campaign for Review**:
     - View the immediate success screen with the stable campaign identifier (e.g. `RCH-xxxx-xxxx`) and lifecycle status timeline.

---

## 📊 Act 6: Creator Dashboard, Lifecycle Simulation & Reports (2:35 - 3:00)
* **Goal**: Show unified role management, deterministic admin review controls, and distribution audit reports.
* **Steps**:
  1. Navigate to the **Profile** tab. Point out the single unified account (creator, backer, audience).
  2. Tap **Creator Dashboard**:
     - View your newly submitted campaign under the **Under Review** filter.
     - Demonstrate the deterministic demo review controls:
       - Tap **Simulate: Approve** to transition the campaign to **Approved / Available for Funding**.
       - Tap **Simulate: Start Promotion** to transition to **Promoting**.
  3. Tap on a **Completed** campaign (e.g. *Open-Access Educational STEM Kits*) and open the **Transparency Report**:
     - Review the complete audit: Funds raised (₹35,000), Ad spend (₹29,750), Impressions delivered (312,400), Clicks (8,420), and distribution channels.
  4. Visit the **Activity** tab:
     - Show the unread notification pills, contribution receipt notifications, and campaign milestone alerts.
     - Tap **Mark all as read**.

---
*Ready for Hackathon judging and submission!*
