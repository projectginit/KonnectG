# KonnectG

**KonnectG** is Siliguri's verified local business directory — built with Vite, React, React Router, and Tailwind CSS.

## ✨ What's inside

- **Splash screen** — brief animated logo intro on first load
- **Navbar** — full navigation (Home, Categories, Listings, Map, Profile, Merchant, Admin) with a location selector
- **Hero** — live search bar, "Explore Categories" / "View Nearby Map" CTAs
- **Marquee** — scrolling ticker of current deals and new listings
- **Cards** — Popular Categories, Top Verified Merchants, Local Offers & Deals, and "How KonnectG Works" steps
- **NotifyForm** — "Know a great local business?" suggestion form
- **BusinessCTA** — "Own a Local Business?" listing CTA
- **Footer** — brand + quick links

Categories, Listings, Map, Profile, Merchant, and Admin are scaffolded as routed pages with placeholder content — swap each in with real data/components as that part of the product gets built.

## 🛠 Tech stack

- [Vite](https://vitejs.dev/) — build tool
- [React 18](https://react.dev/)
- [React Router](https://reactrouter.com/) — multi-page navigation
- [Tailwind CSS](https://tailwindcss.com/) — styling, with brand tokens (purple/gold) extended in `tailwind.config.js`
- [ESLint](https://eslint.org/) (flat config) — linting

## 📂 Project structure

```
konnectg-landing/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   └── logo.svg
│   ├── components/
│   │   ├── SplashScreen.jsx
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Marquee.jsx
│   │   ├── Cards.jsx
│   │   ├── BusinessCTA.jsx
│   │   ├── NotifyForm.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Categories.jsx
│   │   ├── Listings.jsx
│   │   ├── Map.jsx
│   │   ├── Profile.jsx
│   │   ├── Merchant.jsx
│   │   ├── Admin.jsx
│   │   ├── PlaceholderPage.jsx   (shared layout for the stub pages above)
│   │   └── NotFound.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── eslint.config.js
└── package.json
```

## 🚀 Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

### Other scripts

```bash
npm run build     # production build to /dist
npm run preview   # preview the production build locally
npm run lint       # run ESLint
```

## 🎨 Brand tokens

Defined in `tailwind.config.js`:

| Token | Hex | Use |
|---|---|---|
| `purple-900` | `#2C0E4A` | Deepest gradient stop |
| `purple-700` | `#5B2A8C` | Primary buttons, links |
| `purple-600` | `#6B2FA0` | Logo mark, hover states |
| `gold` | `#F5C518` | Primary CTA accent |
| `coral` | `#FF6B5C` | Secondary accent (marquee, errors) |
| `paper` | `#FBF8F2` | Page background |

## 📝 Notes

- `NotifyForm` currently logs suggestions to the console — connect it to a real backend endpoint so suggestions land in a review queue.
- `Categories`, `Listings`, `Map`, `Profile`, `Merchant`, and `Admin` are placeholder pages — build these out as the corresponding features ship.
- The splash screen auto-dismisses after 1.8s (see `src/App.jsx`); adjust the timeout to taste.
