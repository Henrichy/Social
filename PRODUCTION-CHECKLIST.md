# Production Deployment Checklist

## ✅ Pre-Deployment Setup

### Database Setup
- [ ] MongoDB Atlas account created
- [ ] Database cluster created
- [ ] Database user created with read/write permissions
- [ ] Network access configured (0.0.0.0/0 or specific IPs)
- [ ] Connection string obtained

### Payment Setup
- [ ] Paystack account created and verified
- [ ] Live API keys obtained (public and secret)
- [ ] Test payments completed successfully
- [ ] Webhook URLs configured (if needed)

### Domain & Hosting
- [ ] Backend hosting platform chosen (Railway/Render/Heroku)
- [ ] Frontend hosting platform chosen (Vercel/Netlify)
- [ ] Custom domains registered (optional)

## ✅ Backend Deployment

### Environment Configuration
- [ ] `.env` file created with production values
- [ ] `NODE_ENV=production` set
- [ ] `MONGODB_URI` configured
- [ ] `JWT_SECRET` generated (long, random string)
- [ ] `PAYSTACK_PUBLIC_KEY` set
- [ ] `PAYSTACK_SECRET_KEY` set
- [ ] `FRONTEND_URL` configured for CORS

### Platform Deployment
- [ ] Code pushed to Git repository
- [ ] Platform connected to repository
- [ ] Build command configured: `npm install && npm run build`
- [ ] Start command configured: `npm start`
- [ ] Environment variables set on platform
- [ ] Health check endpoint working: `/health`

### Testing
- [ ] Backend URL accessible
- [ ] Health check returns 200 OK
- [ ] API endpoints responding: `/api/accounts`, `/api/categories`
- [ ] Database connection successful
- [ ] No error logs in platform dashboard

## ✅ Frontend Deployment

### Environment Configuration
- [ ] `client/.env.production` updated with backend URL
- [ ] `REACT_APP_API_BASE_URL` points to production backend
- [ ] `REACT_APP_PAYSTACK_PUBLIC_KEY` configured

### Platform Deployment
- [ ] Build command: `npm run build`
- [ ] Publish directory: `build`
- [ ] Base directory: `client`
- [ ] Environment variables set
- [ ] Build completed successfully

### Testing
- [ ] Frontend URL accessible
- [ ] Pages load without errors
- [ ] API calls working (check Network tab)
- [ ] Authentication flow working
- [ ] Payment flow working

## ✅ Full Application Testing

### User Registration & Authentication
- [ ] User can register new account
- [ ] Email validation working
- [ ] User can login successfully
- [ ] JWT tokens working
- [ ] Protected routes secured

### Marketplace Functionality
- [ ] Products display correctly
- [ ] Categories working
- [ ] Search and filtering working
- [ ] Product details accessible
- [ ] Stock management working

### Shopping Cart
- [ ] Add to cart working
- [ ] Cart persistence working
- [ ] Quantity management working
- [ ] Cart validation working
- [ ] Remove items working

### Payment Processing
- [ ] Paystack integration working
- [ ] Payment modal displays
- [ ] Payment completion successful
- [ ] Order creation working
- [ ] Credentials delivery working
- [ ] Cart clearing after purchase

### Admin Functions
- [ ] Admin login working
- [ ] Dashboard statistics accurate
- [ ] User management working
- [ ] Category management working
- [ ] Product management working
- [ ] Crypto settings working

## ✅ Security & Performance

### Security Checks
- [ ] Environment variables secured
- [ ] No sensitive data in client code
- [ ] CORS properly configured
- [ ] JWT secrets secure
- [ ] Database access restricted
- [ ] HTTPS enabled

### Performance Checks
- [ ] Frontend build optimized
- [ ] Images optimized
- [ ] API response times acceptable
- [ ] Database queries optimized
- [ ] Error handling implemented

## ✅ Monitoring & Maintenance

### Logging & Monitoring
- [ ] Application logs accessible
- [ ] Error tracking configured
- [ ] Performance monitoring set up
- [ ] Database monitoring enabled
- [ ] Payment processing logs working

### Backup & Recovery
- [ ] Database backup strategy
- [ ] Code repository backed up
- [ ] Environment variables documented
- [ ] Recovery procedures documented

## ✅ Post-Deployment

### Documentation
- [ ] Deployment guide updated
- [ ] API documentation current
- [ ] User guide created
- [ ] Admin guide created

### Team Access
- [ ] Team members have access
- [ ] Admin accounts created
- [ ] Credentials shared securely
- [ ] Support procedures established

### Go-Live
- [ ] DNS configured (if using custom domain)
- [ ] SSL certificates active
- [ ] Final testing completed
- [ ] Stakeholders notified
- [ ] Launch announcement ready

## 🚨 Emergency Contacts & Procedures

### Platform Support
- **Railway**: https://railway.app/help
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/support
- **MongoDB Atlas**: https://support.mongodb.com

### Rollback Procedures
1. Revert to previous deployment
2. Check environment variables
3. Verify database connections
4. Test critical functionality
5. Monitor error logs

### Common Issues & Solutions
- **CORS errors**: Check FRONTEND_URL in backend env
- **API not found**: Verify REACT_APP_API_BASE_URL
- **Database connection**: Check MONGODB_URI and network access
- **Payment issues**: Verify Paystack keys and test mode

---

## 📞 Support Checklist

When seeking support, provide:
- [ ] Platform name and deployment URL
- [ ] Error messages and logs
- [ ] Environment configuration (without secrets)
- [ ] Steps to reproduce issue
- [ ] Expected vs actual behavior