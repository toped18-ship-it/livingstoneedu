# LIVINGSTONEEDU — School Management SaaS Platform

LIVINGSTONEEDU is a comprehensive Nigerian school management SaaS platform built with React, Vite, Express, and Firebase. It features AI Lesson Note Generation, AI Exam Generator, Digital Result Compilation & Terminal Report Cards, Fee Invoicing, and Multi-role Portals (Admin, Principal, Teacher, Student, Parent).

---

## 🚀 Quick Deployment Guide (GitHub & Vercel)

### 1. Push to GitHub
1. Initialize Git repository and add remote:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - LivingstoneEDU SaaS platform"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/LivingstoneEdu.git
   git push -u origin main
   ```

---

### 2. Deploy to Vercel
1. Go to **[vercel.com](https://vercel.com)** and log in.
2. Click **Add New Project** → Import your GitHub repository (`LivingstoneEdu`).
3. Vercel will automatically detect `vite` and use `vercel.json`.
4. In **Environment Variables**, add the following keys (refer to `.env.example`):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_FIREBASE_DATABASE_URL`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
   - `GEMINI_API_KEY`
   - `RESEND_API_KEY` (Optional for SMTP/Email notices)
5. Click **Deploy**. Vercel will build the frontend React app and deploy the serverless Express API function automatically!

---

### 3. Custom Domain Configuration (Optional)
To connect your custom domain (e.g., `livingstoneedu.name.ng`):
1. In Vercel Project Settings, go to **Domains**.
2. Add your custom domain `livingstoneedu.name.ng`.
3. Add the CNAME or A records provided by Vercel into your domain registrar's DNS management panel.

---

## 💻 Local Development
```bash
# Install dependencies
npm install

# Start local server (Express API + Vite Dev Server on http://localhost:3000)
npm run dev

# Typecheck and lint
npm run lint

# Build production bundle
npm run build
```

---

## 🛠 Features Included
- **Multi-Role Portals**: Super Admin, School Admin, Teacher, Student/Parent.
- **AI Lesson Notes Engine**: NERDC curriculum-aligned lesson note generation with PDF/Print/Download options.
- **AI Exam & CBT Engine**: Generate objective/theory questions with CBT test-taking mode.
- **Terminal Report Cards**: Automatic CA1, CA2, Exam grading, psychomotor domain assessment, and QR verification.
- **Firebase Persistence**: Authoritative Realtime Database & Firestore synchronization.
