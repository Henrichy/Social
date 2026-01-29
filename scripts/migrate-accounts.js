#!/usr/bin/env node

/**
 * Manual script to migrate account credentials to simplified format
 * Run with: node scripts/migrate-accounts.js
 */

const mongoose = require('mongoose');
const { migrateAccountsCredentials } = require('../utils/migrateAccounts');
require('dotenv').config();

async function runMigration() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    console.log('Running account credentials migration...');
    const result = await migrateAccountsCredentials();

    if (result.success) {
      console.log(`✅ Migration completed successfully!`);
      console.log(`📊 Migrated ${result.migratedCount} accounts`);
    } else {
      console.error('❌ Migration failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

runMigration();