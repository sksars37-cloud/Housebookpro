# HouseBook 🏡
> Verified Real Estate & Housing Marketplace Portal

HouseBook is a modern real estate web application designed for zero brokerage listings, direct owner-buyer chat, interactive map & locality searches, KYC verification & legal agreement generators, and a coin-based reward system.

---

## ✨ Features

- 🔍 **Smart Property Search & Filters**: Full-screen categorized filters for Buy/Rent, BHK (1-4+), price ranges, furnishing status, and verified tags.
- 🏢 **Full-Screen Property Showcase**: Comprehensive listings view with HD galleries, EMI calculator, specifications, and instant site visit booking.
- 💬 **Direct Real-Time Chat**: Chat directly with verified property hosts and buyers with instant messaging.
- ⚖️ **KYC & Legal Workspace**: Online verification and digital 11-month rental agreement generator with legal compliance stamps.
- 🪙 **Coins & Rewards Economy**: Watch short sponsor ads or purchase coins via simulated UPI payment gateway to unlock contact numbers and premium features.
- 📱 **Fully Responsive Design**: Optimized toolbar and navigation for mobile, tablet, and ultra-wide screens without overflow.

---

## 🚀 Tech Stack

- **Framework**: React 19 (SPA) with TypeScript
- **Bundler & Tooling**: Vite 8 with Tailwind CSS v4
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti & Motion transitions
- **Backend / Database**: Firebase Firestore & Firebase Auth

---

## 🛠️ Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 GitHub Pages Deployment (Ready & Fixed)

### Why deployed pages showed blank previously:
1. **GitHub Pages Source Selection**: If GitHub Pages is set to *"Deploy from a branch (main / root)"*, GitHub Pages serves the unbuilt raw `index.html` (which points to `/src/main.tsx`), which browsers cannot run without compiling.
2. **Missing lockfile & dependency resolution**: GitHub Actions previously had peer dependency resolution conflicts with `esbuild`, preventing `npm ci` from building the `dist/` bundle.
3. **Subpath Asset Resolution**: Subpaths like `https://username.github.io/repository-name/` require dynamic base routing, which has now been automated in `vite.config.ts`.

---

### Option 1: Automatic Deployment with GitHub Actions (Recommended)

1. Commit and push this updated repository to GitHub:
   ```bash
   git add .
   git commit -m "fix: github pages blank screen resolution and workflow"
   git push origin main
   ```
2. Go to your repository on GitHub.
3. Click **Settings** (top tab) -> **Pages** (in left sidebar).
4. Under **Build and deployment** -> **Source**, select **GitHub Actions** (NOT "Deploy from a branch").
5. The deployment workflow `.github/workflows/deploy.yml` will automatically build and publish your app.
6. Open your live site at: `https://<your-username>.github.io/<your-repository-name>/`.

---

### Option 2: One-Command CLI Deploy with `gh-pages`

If you prefer to deploy directly from your local terminal:
1. Run the deploy script:
   ```bash
   npm run deploy
   ```
2. On GitHub, go to **Settings** -> **Pages**.
3. Under **Source**, select **Deploy from a branch**.
4. Set Branch to **`gh-pages`** and folder to **`/ (root)`**, then click **Save**.

---

## ⚙️ Environment Variables (Optional)

If you wish to link your own Firebase project for cloud persistence:

Copy `.env.example` to `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_ID=(default)
```

If not provided, the application will automatically run with the built-in local demonstration dataset and offline mock fallbacks.

---

## 📦 Scripts

- `npm run dev`: Starts the Vite local development server on port 3000.
- `npm run build`: Compiles the TypeScript code, copies SPA 404 fallback, and produces production assets in `dist/`.
- `npm run deploy`: Builds and publishes the `dist/` bundle to the `gh-pages` branch.
- `npm run preview`: Locally previews the production build from `dist/`.
- `npm run lint`: Runs TypeScript validation checks (`tsc --noEmit`).
