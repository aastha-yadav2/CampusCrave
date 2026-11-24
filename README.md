# 🍔 Campus Crave

> **Your campus. Your cravings. Better deals together.**

Campus Crave is a campus-first food discovery and collective-demand platform. Students shouldn't have to order alone and pay full price—Campus Crave aggregates scattered student cravings into collective purchasing power to unlock restaurant group discounts, while allowing every student to pick and pay for their own meal individually.

---

## 🚀 Key Highlights

* **🔥 Live Campus Feed**: Discover active craving pools happening across campus hostels, academic blocks, and campus quads.
* **🧠 Smart Craving Matching Engine**: Prevents group fragmentation by comparing newly created cravings against active pools using a 100-point compatibility score (restaurant normalization, delivery window overlap, campus zone, and budget alignment).
* **⚡ Group Unlocking with Individual Orders**: When a group hits its unlock target, the restaurant deal unlocks for everyone. Students select their own items and pay individually without shared bill headaches.
* **📍 Interactive Campus Switcher**: Seamlessly switch between configured campus hubs (SRHU Dehradun, BITS Pilani, IIT Delhi, MIT Manipal) and their respective delivery zones.
* **📊 Live Campus Counters**: Dynamic counters tracking active cravings, participating students, and deals unlocked today.
* **📱 Responsive Design**: Fully optimized for mobile, tablet, and desktop screens with a clean bottom navigation bar on mobile.

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
│   │   ├── SmartMatchModal.tsx    # "We found cravings you can join!" match breakdown
│   │   ├── CreateCravingModal.tsx # Pool creation with pre-match checks
│   │   ├── CampusSelectorModal.tsx# Campus & zone switcher modal
│   │   ├── LiveCravingView.tsx    # Live pool detail with simulated join
│   │   ├── UnlockedDealView.tsx   # Goal unlocked celebration & menu selector
│   │   ├── CheckoutView.tsx       # Prototype individual checkout
│   │   ├── OrderSuccessView.tsx   # Confirmation ticket & estimated delivery
│   │   ├── MyCravingsView.tsx     # Active joined cravings tracker
│   │   ├── OrdersView.tsx         # Order history & receipts
│   │   └── Toast.tsx              # Feedback notifications
│   ├── data/
│   │   ├── campuses.ts            # Campus hubs & delivery zones
│   │   └── mockCravings.ts        # Seeded realistic cravings & menus
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

## 📄 Prototype Disclosure

This project is a functional student-powered collective food discovery and purchasing prototype. It is a client-side simulation created for hackathons and product demonstrations.
