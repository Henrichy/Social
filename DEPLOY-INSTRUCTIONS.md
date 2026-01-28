# Quick Deployment Instructions

## 🚀 Recommended Deployment Strategy

### Frontend → Vercel
### Backend → Railway

---

## 📱 Frontend Deployment (Vercel)

### Step 1: Deploy from Client Directory
```bash
cd client
vercel --prod
```

### Step 2: Set Environment Variables in Vercel Dashboard
```
REACT_APP_API_BASE_URL = https://your-backend-url.railway.app
REACT_APP_PAYSTACK_PUBLIC_KEY = pk_live_your_paystack_public_key
```

### Alternative: Deploy via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Set **Root Directory** to `client`
5. Framework Preset: `Create React App`
6. Add environment variables
7. Deploy

---

## 🔧 Backend Deployment (Railway)

### Step 1: Deploy from Root Directory
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Step 2: Set Environment Variables in Railway Dashboard
```
NODE_ENV = production
MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/accvaultng
JWT_SECRET = your_super_secure_jwt_secret_key
PAYSTACK_PUBLIC_KEY = pk_live_your_paystack_public_key
PAYSTACK_SECRET_KEY = sk_live_your_paystack_secret_key
FRONTEND_URL = https://your-frontend-url.vercel.app
```

### Alternative: Deploy via Railway Dashboard
1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Railway will auto-detect Node.js
6. Add environment variables
7. Deploy

---

## 🔄 Alternative Backend Options

### Option B: Render
1. Connect GitHub repository
2. Choose "Web Service"
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables

### Option C: Heroku
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
# ... add other env vars
git push heroku main
```

---

## ❌ What Went Wrong with Your Vercel Deployment

You tried to deploy the **root directory** (backend) to Vercel, but:

1. **Vercel is for frontends** - It's optimized for React/Next.js apps
2. **Build script issue** - The root `package.json` has `cd client` which fails when client folder isn't present
3. **Wrong deployment target** - Backend should go to Railway/Render/Heroku

---

## ✅ Correct Deployment Flow

```
┌─────────────────┐    ┌─────────────────┐
│   Your Repo     │    │   Deployments   │
│                 │    │                 │
│  ├── client/    │───▶│  Vercel         │ (Frontend)
│  ├── server.js  │───▶│  Railway        │ (Backend)
│  ├── routes/    │    │                 │
│  └── models/    │    └─────────────────┘
└─────────────────┘
```

---

## 🧪 Test Your Deployment

### 1. Test Backend
```bash
curl https://your-backend-url.railway.app/health
```

### 2. Test Frontend
Visit: `https://your-frontend-url.vercel.app`

### 3. Test Full Flow
1. Register/Login
2. Browse marketplace
3. Add to cart
4. Make payment

---

## 🆘 Quick Fix for Your Current Issue

**If you want to continue with Vercel for backend** (not recommended):

1. **Remove the problematic build script**:
   ```bash
   # In root package.json, change:
   "build": "echo 'Backend only - no build needed'"
   ```

2. **Or deploy client folder separately**:
   ```bash
   cd client
   vercel --prod
   ```

**Recommended**: Use Railway for backend, Vercel for frontend as shown above.