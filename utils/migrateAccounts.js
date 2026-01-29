const Account = require('../models/Account');

/**
 * Utility function to ensure all accounts have credentialsInventory field
 * This can be run once to migrate existing accounts
 */
async function migrateAccountsCredentials() {
  try {
    console.log('Starting account credentials migration...');
    
    // Find accounts without credentialsInventory or with null/undefined credentialsInventory
    const accountsToUpdate = await Account.find({
      $or: [
        { credentialsInventory: { $exists: false } },
        { credentialsInventory: null },
        { credentialsInventory: { $size: 0 } }
      ]
    });

    console.log(`Found ${accountsToUpdate.length} accounts to migrate`);

    for (const account of accountsToUpdate) {
      // Initialize credentialsInventory as empty array if it doesn't exist
      if (!account.credentialsInventory || !Array.isArray(account.credentialsInventory)) {
        account.credentialsInventory = [];
        
        // If account has legacy credentials, migrate them to inventory
        if (account.credentials && account.credentials.email && account.credentials.password) {
          account.credentialsInventory.push({
            email: account.credentials.email,
            password: account.credentials.password,
            username: account.credentials.username || '',
            phone: account.credentials.phone || '',
            recoveryEmail: account.credentials.recoveryEmail || '',
            additionalInfo: account.credentials.additionalInfo || '',
            isSold: account.isSold || false
          });
          
          console.log(`Migrated legacy credentials for account: ${account.title}`);
        }
        
        await account.save();
      }
    }

    console.log('Account credentials migration completed successfully');
    return { success: true, migratedCount: accountsToUpdate.length };
  } catch (error) {
    console.error('Error during account credentials migration:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { migrateAccountsCredentials };