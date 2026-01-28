const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Category = require('./models/Category');
const Account = require('./models/Account');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accvaultng');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Account.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@accvaultng.com',
      password: 'admin123', // Let the model hash this
      role: 'admin'
    });
    console.log('Created admin user');

    // Create regular user
    const user = await User.create({
      name: 'John Doe',
      email: 'user@accvaultng.com',
      password: 'user123', // Let the model hash this
      role: 'user'
    });
    console.log('Created regular user');

    // Create categories
    const categories = await Category.create([
      {
        name: 'VPN Services',
        description: 'Premium VPN services for secure browsing and privacy',
        icon: '🔒',
        createdBy: admin._id
      },
      {
        name: 'Dating Apps',
        description: 'Premium dating app accounts and subscriptions',
        icon: '💕',
        createdBy: admin._id
      },
      {
        name: 'Texting Apps',
        description: 'Virtual phone numbers and texting app services',
        icon: '📱',
        createdBy: admin._id
      },
      {
        name: 'Facebook Accounts',
        description: 'Premium Facebook accounts with verified profiles',
        icon: '📘',
        createdBy: admin._id
      },
      {
        name: 'Instagram Accounts',
        description: 'High-quality Instagram accounts with followers',
        icon: '📷',
        createdBy: admin._id
      },
      {
        name: 'Twitter Accounts',
        description: 'Verified Twitter accounts with engagement',
        icon: '🐦',
        createdBy: admin._id
      },
      {
        name: 'TikTok Accounts',
        description: 'Trending TikTok accounts with viral potential',
        icon: '🎵',
        createdBy: admin._id
      },
      {
        name: 'YouTube Channels',
        description: 'Monetized YouTube channels ready for content',
        icon: '📺',
        createdBy: admin._id
      },
      {
        name: 'Apple Services',
        description: 'Apple ID, iTunes, and iCloud services',
        icon: '🍎',
        createdBy: admin._id
      },
      {
        name: 'Proxy Services',
        description: 'Premium proxy and IP services',
        icon: '🌐',
        createdBy: admin._id
      }
    ]);
    console.log('Created categories');

    // Create sample accounts
    const accounts = await Account.create([
      // VPN Services
      {
        title: 'IPVanish Premium VPN',
        description: 'High-speed VPN service with global servers and unlimited bandwidth.',
        category: categories.find(c => c.name === 'VPN Services')?._id || categories[0]._id,
        price: 3500,
        platform: 'IPVanish',
        productType: 'vpn',
        duration: '1 Month',
        features: ['Unlimited Bandwidth', 'Global Servers', 'No Logs Policy', '24/7 Support'],
        guarantee: true,
        credentials: {
          email: 'ipvanish.user@example.com',
          password: 'IPVanish2024!',
          username: 'ipvanish_user',
          additionalInfo: 'Login at ipvanish.com. Valid until next month.'
        },
        seller: user._id
      },
      {
        title: 'ExpressVPN Premium',
        description: 'Ultra-fast VPN with military-grade encryption and 3000+ servers worldwide.',
        category: categories.find(c => c.name === 'VPN Services')?._id || categories[0]._id,
        price: 3500,
        platform: 'ExpressVPN',
        productType: 'vpn',
        duration: '1 Month',
        features: ['3000+ Servers', 'Military Encryption', 'Split Tunneling', 'Kill Switch'],
        guarantee: true,
        credentials: {
          email: 'expressvpn.user@example.com',
          password: 'ExpressVPN2024!',
          username: 'express_user',
          additionalInfo: 'Login at expressvpn.com. Premium subscription active.'
        },
        seller: user._id
      },
      {
        title: 'Surfshark VPN Premium',
        description: 'Affordable VPN with unlimited devices and advanced security features.',
        category: categories.find(c => c.name === 'VPN Services')?._id || categories[0]._id,
        price: 4000,
        platform: 'Surfshark',
        productType: 'vpn',
        duration: '1 Month',
        features: ['Unlimited Devices', 'CleanWeb', 'Whitelister', 'MultiHop'],
        guarantee: true,
        credentials: {
          email: 'surfshark.user@example.com',
          password: 'Surfshark2024!',
          username: 'surf_user',
          additionalInfo: 'Login at surfshark.com. Unlimited devices supported.'
        },
        seller: user._id
      },

      // Dating App Accounts
      {
        title: 'POF (Plenty of Fish) Premium',
        description: 'Premium dating app account with enhanced features and unlimited messaging.',
        category: categories.find(c => c.name === 'Dating Apps')?._id || categories[1]._id,
        price: 8500,
        platform: 'Plenty of Fish',
        productType: 'dating_app',
        duration: '1 Month',
        features: ['Unlimited Messages', 'See Who Viewed Profile', 'Priority Listing', 'Ad-Free'],
        specifications: 'Available in both male and female profiles',
        credentials: {
          email: 'pof.user@example.com',
          password: 'POF2024!',
          username: 'pof_premium_user',
          phone: '+1234567890',
          additionalInfo: 'Premium features active. Profile is male, 28 years old.'
        },
        seller: user._id
      },
      {
        title: 'LOVOO Premium Account',
        description: 'Premium LOVOO dating account with VIP features and enhanced visibility.',
        category: categories.find(c => c.name === 'Dating Apps')?._id || categories[1]._id,
        price: 7000,
        platform: 'LOVOO',
        productType: 'dating_app',
        duration: '1 Month',
        features: ['VIP Status', 'Unlimited Likes', 'See Who Likes You', 'Invisible Mode'],
        specifications: 'Available in both male and female profiles',
        credentials: {
          email: 'lovoo.user@example.com',
          password: 'Lovoo2024!',
          username: 'lovoo_vip_user',
          phone: '+1234567891',
          additionalInfo: 'VIP status active. Profile is female, 25 years old.'
        },
        seller: user._id
      },
      {
        title: 'Tinder Gold Premium',
        description: 'Tinder Gold subscription with unlimited swipes and premium features.',
        category: categories.find(c => c.name === 'Dating Apps')?._id || categories[1]._id,
        price: 7500,
        platform: 'Tinder',
        productType: 'dating_app',
        duration: '1 Month',
        features: ['Unlimited Swipes', 'See Who Likes You', 'Passport Feature', 'Boost'],
        specifications: 'Available in both male and female profiles',
        credentials: {
          email: 'tinder.user@example.com',
          password: 'Tinder2024!',
          username: 'tinder_gold_user',
          phone: '+1234567892',
          additionalInfo: 'Tinder Gold active. Profile is male, 26 years old, located in NYC.'
        },
        seller: user._id
      },

      // Texting App Numbers
      {
        title: 'Google Voice Number',
        description: 'US Google Voice number for verification and texting purposes.',
        category: categories.find(c => c.name === 'Texting Apps')?._id || categories[2]._id,
        price: 5500,
        platform: 'Google Voice',
        productType: 'texting_app',
        features: ['US Number', 'SMS & Calls', 'Voicemail', 'Call Forwarding'],
        specifications: 'Use premium VPN (not PIA). Disable location if asked.',
        bulkDiscount: true,
        credentials: {
          email: 'googlevoice.user@gmail.com',
          password: 'GoogleVoice2024!',
          phone: '+1-555-123-4567',
          recoveryEmail: 'recovery.gv@gmail.com',
          additionalInfo: 'Google Voice number: +1-555-123-4567. Use with VPN for best results.'
        },
        seller: user._id
      },
      {
        title: 'TextPlus Premium Number',
        description: 'Premium TextPlus number with enhanced features and reliability.',
        category: categories.find(c => c.name === 'Texting Apps')?._id || categories[2]._id,
        price: 2000,
        platform: 'TextPlus',
        productType: 'texting_app',
        features: ['Premium Number', 'Ad-Free', 'Custom Voicemail', 'Group Messaging'],
        bulkDiscount: true,
        credentials: {
          email: 'textplus.user@example.com',
          password: 'TextPlus2024!',
          phone: '+1-555-987-6543',
          additionalInfo: 'TextPlus premium number: +1-555-987-6543. Ad-free experience.'
        },
        seller: user._id
      },

      // Social Media Accounts
      {
        title: 'Facebook Account - 1 Month Old',
        description: 'Aged Facebook account perfect for marketing and business use.',
        category: categories.find(c => c.name === 'Facebook Accounts')?._id || categories[0]._id,
        price: 5000,
        platform: 'Facebook',
        productType: 'social_account',
        accountAge: '1 Month',
        features: ['Aged Account', 'Clean History', 'Ready for Ads', 'Mobile Verified'],
        credentials: {
          email: 'facebook.user@example.com',
          password: 'Facebook2024!',
          username: 'john.marketing.pro',
          phone: '+1234567893',
          recoveryEmail: 'fb.recovery@example.com',
          additionalInfo: 'Profile name: John Marketing Pro. Mobile verified. Ready for business use.'
        },
        seller: user._id
      },
      {
        title: 'Instagram Account - 100 Followers',
        description: 'Instagram account with 100 real followers, perfect for starting your brand.',
        category: categories.find(c => c.name === 'Instagram Accounts')?._id || categories[1]._id,
        price: 3000,
        platform: 'Instagram',
        productType: 'social_account',
        followers: 100,
        accountAge: '2 Months',
        features: ['Real Followers', 'Organic Growth', 'Clean Profile', 'Email Access'],
        credentials: {
          email: 'instagram.user@example.com',
          password: 'Instagram2024!',
          username: '@lifestyle_starter',
          phone: '+1234567894',
          additionalInfo: 'Username: @lifestyle_starter. 100 real followers. Lifestyle niche.'
        },
        seller: user._id
      },
      {
        title: 'TikTok Account - 1K Followers',
        description: 'TikTok account with 1000 followers and good engagement rate.',
        category: categories.find(c => c.name === 'TikTok Accounts')?._id || categories[3]._id,
        price: 8000,
        platform: 'TikTok',
        productType: 'social_account',
        followers: 1000,
        accountAge: '3 Months',
        features: ['1K Followers', 'Good Engagement', 'Creator Fund Ready', 'Viral Potential'],
        credentials: {
          email: 'tiktok.user@example.com',
          password: 'TikTok2024!',
          username: '@viral_creator_2024',
          phone: '+1234567895',
          additionalInfo: 'Username: @viral_creator_2024. 1K followers. 5% engagement rate. Creator fund eligible.'
        },
        seller: user._id
      },

      // Apple Services
      {
        title: 'USA Apple ID/iCloud Account',
        description: 'Premium USA Apple ID with access to US App Store and services.',
        category: categories.find(c => c.name === 'Apple Services')?._id || categories[5]._id,
        price: 7500,
        platform: 'Apple',
        productType: 'apple_service',
        features: ['US App Store Access', 'iCloud Storage', 'iTunes Access', 'Clean Account'],
        specifications: 'Works only on USA iCloud for first-time users',
        credentials: {
          email: 'apple.user@icloud.com',
          password: 'Apple2024!',
          recoveryEmail: 'apple.recovery@gmail.com',
          phone: '+1234567896',
          additionalInfo: 'Apple ID: apple.user@icloud.com. US region. 5GB iCloud storage. Clean account history.'
        },
        seller: user._id
      },
      {
        title: 'Apple Music Premium Code',
        description: 'Apple Music subscription code for premium music streaming.',
        category: categories.find(c => c.name === 'Apple Services')?._id || categories[5]._id,
        price: 3000,
        platform: 'Apple Music',
        productType: 'apple_service',
        duration: '3 Months',
        features: ['Premium Streaming', 'Offline Downloads', 'No Ads', 'High Quality Audio'],
        credentials: {
          email: 'applemusic.user@example.com',
          password: 'AppleMusic2024!',
          additionalInfo: 'Redeem code: AM-PREMIUM-2024-XYZ. Valid for 3 months. Redeem in App Store.'
        },
        seller: user._id
      }
    ]);
    console.log('Created sample accounts');

    console.log('\n=== SEED DATA COMPLETED ===');
    console.log('Admin Login:');
    console.log('Email: admin@accvaultng.com');
    console.log('Password: admin123');
    console.log('\nUser Login:');
    console.log('Email: user@accvaultng.com');
    console.log('Password: user123');
    console.log('\nCategories created:', categories.length);
    console.log('Accounts created:', accounts.length);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();