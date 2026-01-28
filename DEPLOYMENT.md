# Deployment Guide

## Quick Start

### 🚀 One-Command Build
```bash
./build.sh
```

## Environment Configuration

### Frontend (React)
The frontend uses environment variables to configure the backend API URL.

#### Development
- Uses `client/.env.development`
- Backend URL: `http://localhost:5000`

#### Production
- Uses `client/.env.production`
- Update `REACT_APP_API_BASE_URL` with your production backend URL

### Backend (Node.js)
The backend uses environment variables from `.env` file.

## Deployment Steps

### 1. Backend Deployment

#### Option A: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Environment Variables for Railway:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accvaultng
JWT_SECRET=your_super_secure_jwt_secret
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
FRONTEND_URL=https://your-frontend-domain.com
```

#### Option B: Render
1. Connect your GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables in dashboard

#### Option C: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set PAYSTACK_PUBLIC_KEY=your_paystack_public_key
heroku config:set PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Deploy
git push heroku main
```

#### Option D: Docker Deployment
```bash
# Build Docker image
docker build -t accvaultng .

# Run container
docker run -p 5000:5000 --env-file .env accvaultng
```

### 2. Frontend Deployment

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from client directory
cd client
vercel --prod
```

#### Option B: Netlify
1. Connect your GitHub repo
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Set base directory: `client`

### 3. Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**: https://cloud.mongodb.com
2. **Create a Cluster**: Choose free tier for development
3. **Create Database User**: Set username and password
4. **Whitelist IP**: Add `0.0.0.0/0` for all IPs (or specific IPs)
5. **Get Connection String**: Copy the connection URI
6. **Update Environment**: Set `MONGODB_URI` in your deployment platform

## Platform-Specific Instructions

### Railway Configuration
Create `railway.json` (already included):
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health"
  }
}
```

### Render Configuration
Create `render.yaml` (already included):
```yaml
services:
  - type: web
    name: accvaultng-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /health
```

### Heroku Configuration
Create `Procfile` (already included):
```
web: node server.js
```

## Environment Variables Reference

### Frontend (.env.production)
```bash
REACT_APP_API_BASE_URL=https://your-backend-domain.com
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key
```

### Backend (.env)
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/accvaultng
JWT_SECRET=your_super_secure_jwt_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com
```

## Testing Deployment

### Backend Health Check
Visit: `https://your-backend-url.com/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### API Endpoints Test
- **Accounts**: `GET /api/accounts`
- **Categories**: `GET /api/categories`
- **Auth**: `POST /api/auth/login`

### Full Application Test
1. **Register**: Create a new account
2. **Login**: Sign in with credentials
3. **Browse**: View marketplace products
4. **Cart**: Add items to cart
5. **Payment**: Complete purchase flow

## Build Process

### Manual Build
```bash
# Backend dependencies
npm install

# Frontend dependencies and build
cd client
npm install
npm run build
cd ..

# Start production server
npm start
```

### Automated Build (CI/CD)
The project includes build configurations for:
- **GitHub Actions** (create `.github/workflows/deploy.yml`)
- **Railway** (automatic deployment)
- **Render** (automatic deployment)
- **Heroku** (automatic deployment)

## Performance Optimization

### Backend Optimizations
- ✅ Production error handling
- ✅ Request logging (disabled in production)
- ✅ Security headers
- ✅ CORS configuration
- ✅ Health check endpoint
- ✅ Graceful shutdown

### Frontend Optimizations
- ✅ Production build minification
- ✅ Code splitting
- ✅ Asset optimization
- ✅ Environment-based API configuration

## Security Considerations

### Backend Security
- ✅ Environment variables for secrets
- ✅ CORS configuration
- ✅ Security headers
- ✅ Input validation
- ✅ JWT token authentication

### Database Security
- ✅ MongoDB Atlas with authentication
- ✅ Connection string in environment variables
- ✅ Network access restrictions

## Monitoring and Logging

### Health Monitoring
- Health check endpoint: `/health`
- Application logs via platform dashboards
- Database monitoring via MongoDB Atlas

### Error Tracking
- Server error logging
- Client-side error boundaries
- Payment processing logs

## Common Issues & Solutions

### CORS Errors
Update `server.js` CORS configuration:
```javascript
const corsOptions = {
  origin: [
    'https://your-frontend-domain.com',
    'https://your-frontend-domain.vercel.app'
  ]
};
```

### Environment Variables Not Loading
- Ensure `.env` file exists in root directory
- Check platform-specific environment variable settings
- Restart application after changes

### Database Connection Issues
- Verify MongoDB URI format
- Check network access in MongoDB Atlas
- Ensure database user has proper permissions

### Build Failures
- Check Node.js version compatibility (>=16.0.0)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for missing dependencies

### Payment Integration Issues
- Verify Paystack keys (public vs secret)
- Check CORS settings for payment callbacks
- Test with Paystack test keys first

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test API endpoints individually
4. Verify environment variables

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] MongoDB database created
- [ ] Paystack account set up
- [ ] Domain names registered (if needed)

### Backend Deployment
- [ ] Code deployed to platform
- [ ] Environment variables set
- [ ] Health check passing
- [ ] Database connected

### Frontend Deployment
- [ ] Backend URL updated in environment
- [ ] Build completed successfully
- [ ] Static files served correctly
- [ ] API calls working

### Post-Deployment
- [ ] Full application flow tested
- [ ] Payment processing verified
- [ ] Admin functions working
- [ ] Performance monitoring set up