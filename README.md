# 🍔 Campus Crave

> **Your campus. Your cravings. Better deals together.**

Campus Crave is a campus-first food discovery and collective-demand platform. Students shouldn't have to order alone and pay full price—Campus Crave aggregates scattered student cravings into collective purchasing power to unlock restaurant group discounts, while allowing every student to pick and pay for their own meal individually.

---

## 🚀 Key Highlights & Architecture

### Phase 1 — Premium Campus Feed UI
* **🔥 Live Campus Feed**: Discover active craving pools happening across campus hostels, academic blocks, and campus quads.
* **📍 Interactive Campus Switcher**: Seamlessly switch between configured campus hubs (SRHU Dehradun, BITS Pilani, IIT Delhi, MIT Manipal) and their delivery zones.
* **📊 Live Campus Counters**: Dynamic counters tracking active cravings, participating students, and deals unlocked today.
* **📱 Responsive Design**: Fully optimized for mobile, tablet, and desktop screens with a clean bottom navigation bar on mobile.

### Phase 2 — Smart Craving Matching Engine
* **🧠 100-Point Compatibility Score**: Prevents group fragmentation by comparing newly created cravings against active pools (restaurant name normalization, delivery window overlap, campus zone, and budget alignment).
* **⚡ Pre-Match Interception**: Suggests existing active pools before creating duplicate groups, preserving collective purchasing power.

### Phase 3 — Live Deal Engine
* **🔄 Deal Lifecycle State Machine**: Strictly typed lifecycle (`ACTIVE` → `LOCKING` → `UNLOCKED` / `EXPIRED` / `CANCELLED`).
* **🏆 Dynamic Multi-Tier Milestones**: 3-tier configurable reward milestones (Tier 1 Starter, Tier 2 Enhanced, Tier 3 Maximum) with live progression tracking.
* **⏱️ Drift-Free Live Countdown Engine**: Real second-by-second countdown derived from `createdAt` and `expiresAt` timestamps. Automatic state transition upon expiry.
* **🎉 Unlocked Deal Experience**: Visual celebration and individual menu ordering with collective discount deductions.
* **💔 Empathetic Expired Deal Experience**: Empathetic failure view offering exactly 3 core options:
  - **Option A**: Find another active craving on campus
  - **Option B**: Order at regular price (with explicit confirmation that group discount will not apply)
  - **Option C**: Leave craving pool with zero charge
* **🎛️ Judge Demo Mode**: Floating presentation panel for instant simulation:
  - Simulate +1, +3, +5 students
  - Advance to next tier
  - Instant deal unlock
  - Force window expiration
  - Reset demo craving
* **💾 LocalStorage Persistence**: Preserves pools, participant changes, orders, timestamps, and demo mode across browser reloads without resetting countdowns.

---

## 🛠️ Tech Stack

* **Frontend**: React 18 + TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Typography**: DM Sans & Manrope

---

## 📦 Project Structure

```
campus-crave/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Sticky header, location switcher & profile
│   │   ├── Hero.tsx               # Product hero, dynamic counters & quick CTAs
│   │   ├── CategoryBar.tsx        # Horizontal food category filters with counts
│   │   ├── FilterRow.tsx          # Instant search & preset chips
│   │   ├── CravingCard.tsx        # Product cards with live milestone progress
│   │   ├── ProgressBar.tsx        # Smooth animated milestone progress bars
│   │   ├── DealStatusBadge.tsx    # Typed lifecycle status badges
│   │   ├── DealTierProgress.tsx   # Visual multi-tier progression milestones
│   │   ├── DealExpiredModal.tsx   # Empathetic failure screen with 3 options
│   │   ├── DemoControlPanel.tsx   # Floating Judge Demo controls panel
│   │   ├── SmartMatchModal.tsx    # "We found cravings you can join!" match breakdown
│   │   ├── CreateCravingModal.tsx # Pool creation with pre-match checks
│   │   ├── CampusSelectorModal.tsx# Campus & zone switcher modal
│   │   ├── LiveCravingView.tsx    # Live pool detail with simulated join
│   │   ├── UnlockedDealView.tsx   # Goal unlocked celebration & menu selector
│   │   ├── CheckoutView.tsx       # Prototype individual checkout (supports fallback)
│   │   ├── OrderSuccessView.tsx   # Confirmation ticket & estimated delivery
│   │   ├── MyCravingsView.tsx     # Active joined cravings tracker
│   │   ├── OrdersView.tsx         # Order history & receipts
│   │   └── Toast.tsx              # Feedback notifications
│   ├── engine/
│   │   ├── dealLifecycle.ts       # State transitions & access guards
│   │   ├── dealTiers.ts           # Tier calculation & milestone progress
│   │   ├── countdown.ts           # Timestamp countdown & MM:SS formatter
│   │   ├── dealEngine.ts          # Core joining, leaving & demo triggers
│   │   └── storage.ts             # LocalStorage persistence & state restoration
│   ├── hooks/
│   │   └── useDealTimer.ts        # Second-by-second countdown hook
│   ├── data/
│   │   ├── campuses.ts            # Campus hubs & delivery zones
│   │   └── mockCravings.ts        # Seeded realistic cravings with tiers & timestamps
│   ├── types/
│   │   └── index.ts               # Core TypeScript definitions
│   ├── utils/
│   │   ├── cravingMatcher.ts      # 100-point compatibility matching engine
│   │   └── formatters.ts          # Currency, countdown & avatar formatters
│   ├── main.tsx                   # Main application root & view router
│   └── styles.css                 # Base styles & custom utility animations
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🧑‍⚖️ Judge Demonstration Path

1. **Live Feed**: Notice the countdown timers ticking in real time (`MM:SS`) on each craving card.
2. **Tier Milestones**: View the multi-tier progress indicator showing current vs next rewards.
3. **Demo Mode Panel**: Click the **DEMO MODE** floating panel on the bottom left:
   - Click `+1 Student` to watch the progress bar advance and participant counter increase.
   - Click `Next Tier` to instantly advance to the next reward milestone.
   - Click `Instant Unlock` to trigger the **Deal Unlocked** celebration and view individual checkout with savings applied.
   - Click `Force Expire` to trigger the **Deal Expired** screen and verify the 3 core fallback options (Find another, Order at regular price confirmation, Leave).
   - Click `Reset Craving` to restore back to original state.
4. **Persistence**: Refresh the browser page (`F5`) to confirm that countdown timers, participant counts, and lifecycle states are preserved.
