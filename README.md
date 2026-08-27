# 💸 ExpenseFlow — Personal Expense Tracker & Landing Page

A sleek, modern personal expense tracker and landing page that runs entirely in your browser. No backend, no sign-up required — 100% private and stored locally.

![ExpenseFlow](https://raw.githubusercontent.com/luelzelalem848-max/expenseflow/main/index.html)

## ✨ Landing Page Features
- 🚀 **Stunning Landing Page (`index.html`)** — Glassmorphism dark theme with purple/indigo gradients (`#6366f1`)
- 💫 **Floating Animated Expense Cards** — Dynamic CSS keyframe animations
- 📜 **Scroll Reveal Animations** — Smooth intersection observer reveals with stagger delay
- 🔢 **Animated Stat Counters** — Counts up automatically on scroll (50+ Categories, 20 Currencies, 3 Charts, 100% Free)
- 📱 **Responsive Sticky Navbar** — Glass backdrop blur, smooth scrolling, and mobile menu toggle

## 📊 App Features (`app.html`)
- ➕ **Add Expenses** with category, amount, description, and date
- 📊 **Live Summary Cards** (Total spent, monthly total, average per entry, active days)
- 📈 **3 Interactive Charts** — Category Doughnut Chart, 7-Day Trend Chart, and Category Breakdown Bar Chart
- 💡 **Automated Insights** — Instant analysis of top spending habits
- 🌍 **20 Currencies Supported** (USD, EUR, GBP, ETB, JPY, INR, KES, NGN, AED, SAR, and more)
- 🌙 **Dark/Light Mode Toggle** — Auto-saves preference
- 📄 **Signed PDF Report** — Export expenses as a clean PDF table with custom user signature
- ✏️ **Full Edit & Search Support** — Search and modify any past transaction
- 💾 **Auto-saves to localStorage** — Your data persists securely in your browser

## Tech Stack
- HTML5, CSS3 (CSS Variables, Flexbox/Grid, Keyframe Animations, Glassmorphism)
- Vanilla JavaScript (IntersectionObserver, DOM Manipulation, Canvas Chart.js, jsPDF)
- Chart.js (CDN) for interactive financial charts
- jsPDF + AutoTable (CDN) for PDF export

## How to Run
1. Clone the repo:
   ```bash
   git clone https://github.com/luelzelalem848-max/expenseflow.git
   ```
2. Open `index.html` in any browser to view the landing page.
3. Click **Launch App** or open `app.html` directly to start tracking expenses!

Or visit the [Live GitHub Pages Demo](https://luelzelalem848-max.github.io/expenseflow/).

## Project Structure
```
ExpenseFlow/
├── index.html       # Stunning landing page with glassmorphism & animations
├── landing.css      # Landing page styles (dark glass theme, floating cards, scroll reveals)
├── landing.js       # Interactivity (IntersectionObserver, scroll reveals, animated counters)
├── app.html         # Expense tracker application page
├── style.css        # Expense tracker app styling (dark + light themes)
├── app.js           # Main app logic (CRUD, charts, currency, theme, PDF export)
├── README.md        # Documentation
└── LICENSE          # MIT License
```

## License
MIT — Free to use, modify, and share.
