# Render Deployment Guide

## 🚀 Backend Deployment to Render

### Option 1: Web Service (Recommended)

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New Web Service**
3. **Connect Repository**: Choose your GitHub repo
4. **Configure Service**:
   - **Name**: `accvaultng-backend`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: Leave empty (uses root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Environment Variables (Required)

Add these in Render dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accvaultng
JWT_SECRET=your_super_secure_jwt_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
FRONTEND_URL=https://your-frontend-domain.vercel.app
PORT=5000
```

### Health Check

- **Health Check Path**: `/health`
- **Expected Response**: `{"status":"OK"}`

---

## 🔧 Alternative: Docker Deployment

If you prefer Docker on Render:

### 1. Use Backend-Only Dockerfile
```bash
# Rename the backend dockerfile
mv Dockerfile.backend Dockerfile
```

### 2. Configure Render for Docker
- **Runtime**: `Docker`
- **Dockerfile Path**: `./Dockerfile`
- **Docker Command**: Leave empty (uses CMD from Dockerfile)

---

## 📱 Frontend Deployment (Separate)

Deploy frontend to **Vercel** or **Netlify**:

### Vercel (Recommended)
```bash
cd client
vercel --prod
```

### Netlify
1. Connect GitHub repo
2. **Base directory**: `client`
3. **Build command**: `npm run build`
4. **Publish directory**: `client/build`

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] MongoDB Atlas database created
- [ ] Environment variables prepared
- [ ] Paystack account configured

### Render Configuration
- [ ] Web service created
- [ ] Repository connected
- [ ] Build/start commands set
- [ ] Environment variables added
- [ ] Health check configured

### Post-Deployment
- [ ] Service deployed successfully
- [ ] Health check passing: `https://your-app.onrender.com/health`
- [ ] API endpoints working: `https://your-app.onrender.com/api/accounts`
- [ ] Database connected (check logs)

### Frontend Configuration
- [ ] Frontend deployed to Vercel/Netlify
- [ ] `REACT_APP_API_BASE_URL` updated with Render URL
- [ ] Full application flow tested

---

## 🐛 Troubleshooting

### Build Failures
- **Node version**: Ensure using Node 20+ (set in package.json engines)
- **Dependencies**: Run `npm install` locally first
- **Build logs**: Check Render build logs for specific errors

### Runtime Issues
- **Health check failing**: Check `/health` endpoint
- **Database connection**: Verify MONGODB_URI format
- **CORS errors**: Ensure FRONTEND_URL is set correctly

### Performance
- **Cold starts**: Render free tier has cold starts
- **Memory limits**: Monitor memory usage in logs
- **Request timeouts**: Check for long-running operations

---

## 💡 Pro Tips

1. **Use Render's PostgreSQL** if you want to switch from MongoDB
2. **Enable auto-deploy** for automatic deployments on git push
3. **Set up custom domain** in Render dashboard
4. **Monitor logs** regularly for issues
5. **Use environment groups** for shared variables

---

## 🔗 Useful Links

- **Render Docs**: https://render.com/docs
- **Node.js Guide**: https://render.com/docs/deploy-node-express-app
- **Environment Variables**: https://render.com/docs/environment-variables
- **Health Checks**: https://render.com/docs/health-checks