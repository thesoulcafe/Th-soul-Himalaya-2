# The Soul Himalaya (2026 Standards Edition)

A premium multi-experience travel platform dedicated to the mystical Parvati Valley and the greater Kullu-Manali corridor.

## Functional Specification (2026 Upgrades)

### 1. Generative Soul Guide
- **User Impact:** Real-time conversational help using the Vercel AI SDK and Google Gemini.
- **Features:** Generates custom itineraries, answers regional queries, and provides "Generative UI" components directly in the chat interface for immersive planning.

### 2. Real-time Multiplayer Leaderboard
- **User Impact:** Social gamification through "Soul Points".
- **Features:** A global, real-time leaderboard powered by Firestore that synchronizes rankings instantly across all active users in the valley, rewarding exploration and sustainable travel.

### 3. Progressive State Preservation (Activity System)
- **User Impact:** Zero-loss interaction design.
- **Features:** Uses a custom `Activity` preservation layer to ensure chat history and exploration states remain persistent even when navigating across the broad service ecosystem.

## Technical Architecture
- **Framework:** React 19.0 (React 19.2 Patterns simulated)
- **Styling:** Tailwind CSS v4 (Canonicalized Utilities)
- **Backend:** Node.js Express + Firebase Real-time Suite
- **AI:** Vercel AI SDK + Google Gemini 1.5 Flash

## Deployment & Production

### AWS Amplify ZIP Structure (Manual Deployment)
If you are using **Manual Upload** to deploy to AWS Amplify, follow these exact steps:
1.  **Build the Project:** Run `npm run build` in your terminal. This creates a `/dist` folder.
2.  **Locate the Build Output:** Open the `/dist` folder.
3.  **Zip the Contents:** Select ALL files and folders *inside* the `/dist` folder and zip them.
    *   **CRITICAL:** The `index.html` file must be at the very top level of your ZIP archive. 
    *   **DO NOT** zip the `dist` folder itself.
    *   **DO NOT** zip the root project folder (which contains `src`, `public`, etc.).

### AWS Amplify Managed Build (GitHub)
If you connected your GitHub repository:
-   Ensure your **Build Settings** are:
    -   Base directory: `dist`
    -   Build command: `npm run build`
-   Point the **Artifacts** to `/dist`.

### AWS Amplify Redirect Rule (Critical for React Router)
If you encounter 404 errors when refreshing a page (e.g., `/services`), you MUST add a **Redirect/Rewrite Rule** in the Amplify Console.
- **Go to:** Amplify Console > [Your App] > Rewrites and redirects
- **Click 'Edit' and add this rule:**
  - **Source address:** `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webp)$)([^.]+$)/>`
  - **Target address:** `/index.html`
  - **Type:** `200 (Rewrite)`
- **Why:** This tells Amplify to route all non-file requests to your React app's `index.html`, allowing the frontend router to take over.

### Advanced Upload System
We have primarily migrated to **Firebase Storage** for image uploads to ensure 100% compatibility with static hosting (AWS Amplify).
- **Previous Endpoint:** `/api/upload` (Requires a running Node.js server)
- **Current System:** Firebase Storage (Works everywhere, including static hosting)
