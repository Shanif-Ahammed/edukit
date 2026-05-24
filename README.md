# 🏫 SISD EduKit - Teacher Portal

A highly premium, secure, and offline-first teacher workspace tailored specifically for the **Swiss International Scientific School in Dubai (SISD)**. 

Designed to operate in compliance with Dubai DSIB data security and pupil protection guidelines, this portal processes rosters, criteria grading cycles, and seating plans entirely client-side inside the teacher's browser. 

---

## 🛠️ Secure AI Proxy Architecture (Zero Key Setup)

To use the integrated **Gemini AI Assistant** securely without exposing private developer keys in the frontend code or forcing teachers to enter their own personal API Keys, the application uses a hybrid dual-deployment architecture:

1. **Frontend Hosting (GitHub Pages)**: Static site files are compiled and deployed to GitHub Pages for fast, simple user access.
2. **Secure Serverless Proxy (Vercel)**: A Vercel deployment hosts a serverless backend function (`api/gemini.js`) that securely retains the `GEMINI_API_KEY` on the server and proxy-routes frontend requests to the Google Gemini API.

### 🚀 Setting up the Zero-Key AI Assistant

Follow these simple steps to hook your public GitHub Pages deployment up to your private Vercel secure proxy:

#### 1. Deploy the Proxy on Vercel
1. Go to [Vercel](https://vercel.com) and sign in.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   * **Key**: `GEMINI_API_KEY`
   * **Value**: *[Your private Google Gemini API Key]*
5. Click **Deploy**. Vercel will automatically discover the `/api` directory and host your serverless proxy endpoint!
6. Once deployed, copy your Vercel deployment URL (e.g. `https://sisd-edukit.vercel.app`).

#### 2. Connect Your Frontend to the Proxy
1. Open the file [.env.production](file:///g:/AppDev/Teacher%20portal/.env.production) in your project root.
2. Change the value of `VITE_VERCEL_API_URL` to your Vercel deployment URL:
   ```env
   VITE_VERCEL_API_URL=https://your-project-name.vercel.app
   ```
3. Save the file.

#### 3. Publish to GitHub Pages
1. Double-click the **`release.bat`** file in your root folder.
2. The script will automatically compile your React project (injecting your secure Vercel endpoint) and force-push the static bundle directly to the `gh-pages` branch on your GitHub.
3. **That's it!** When teachers use the AI assistant on your live GitHub Pages site, they will see a beautiful `🛡️ Secure Cloud Proxy Active` badge. The AI will work perfectly and out-of-the-box without ever asking them for an API Key!

---

## 📁 Project Modules & Features

- **Dashboard**: connects ready-to-go Excel exports directly from iSAMS without manual header renaming.
- **Comment Gen**: Auto-generates personalized report comments using criteria grades, and intercepts manual drafts for critical grade boundaries (1/2 marks).
- **Seating Chart (A4 Landscape Studio)**: Interactive canvas drag-and-drop seating arrangement with auto-balance tags (Emirati, EAL, Inclusion) and print override layouts.
- **Group Maker & Picker**: Group generator with demographic balancing, plus a tactile, high-DPI canvas spin-wheel student picker with particle celebration confetti.
- **Teacher Toolkit**: Houses academic conversion charts (Arabic to MOE percentage scales), MYP points boundary calculators, and troubleshooting guides.
