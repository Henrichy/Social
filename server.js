const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

/* =========================
   ✅ CORS CONFIG (FIXED)
========================= */

const allowedOrigins = [
  'https://accvaultng.com',
  'https://www.accvaultng.com',
  'https://accvaultng.vercel.app',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server & preflight
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ❗ DO NOT THROW — just deny silently
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

/* =========================
   ✅ MIDDLEWARE ORDER (IMPORTANT)
========================= */

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight FIX
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* =========================
   ✅ BASIC SECURITY HEADERS
========================= */

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

/* =========================
   ✅ DEV LOGGING
========================= */

if (!isProduction) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

/* =========================
   ✅ HEALTH CHECK
========================= */

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString()
  });
});

/* =========================
   ✅ CORS TEST ENDPOINT
========================= */

app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working',
    origin: req.headers.origin || null
  });
});

/* =========================
   ✅ API ROUTES
========================= */

app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/crypto-settings', require('./routes/cryptoSettings'));
app.use('/api/user', require('./routes/userStats'));

/* =========================
   ✅ STATIC FRONTEND (OPTIONAL)
========================= */

if (isProduction) {
  app.use(express.static(path.join(__dirname, 'client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

/* =========================
   ✅ ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({
    message: isProduction ? 'Internal server error' : err.message
  });
});

/* =========================
   ✅ DATABASE
========================= */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  }
};

/* =========================
   ✅ START SERVER
========================= */

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Allowed origins:`, allowedOrigins);
  });
};

startServer();
