const Account = require('../models/Account');

/**
 * Utility function to ensure all accounts have proper credentials format
 * This migrates to array-based credentials format for multiple login blocks
 */
async function migrateAccountsCredentials() {
  try {
    console.log('Starting account credentials migration to array format...');
    
    // Find accounts that need migration
    const accountsToUpdate = await Account.find({});
    console.log(`Found ${accountsToUpdate.length} accounts to check for migration`);

    let migratedCount = 0;

    for (const account of accountsToUpdate) {
      let needsUpdate = false;
      
      // Convert string credentials to array format
      if (typeof account.credentials === 'string' && account.credentials.trim()) {
        account.credentials = [account.credentials.trim()];
        needsUpdate = true;
        console.log(`Converted string credentials to array for: ${account.title}`);
      }
      // If credentials is not an array, initialize as empty array
      else if (!Array.isArray(account.credentials)) {
        account.credentials = [];
        needsUpdate = true;
      }
      // If it's already an array, filter out empty strings
      else {
        const filteredCredentials = account.credentials.filter(cred => cred && cred.trim());
        if (filteredCredentials.length !== account.credentials.length) {
          account.credentials = filteredCredentials;
          needsUpdate = true;
        }
      }
      
      // If account has credentialsInventory but no credentials array, convert it
      if (account.credentialsInventory && 
          Array.isArray(account.credentialsInventory) && 
          account.credentialsInventory.length > 0 && 
          account.credentials.length === 0) {
        
        // Convert each inventory item to a credential block
        const credentialBlocks = [];
        
        account.credentialsInventory.forEach((cred) => {
          let credentialText = '';
          if (cred.email) credentialText += `Email: ${cred.email}\n`;
          if (cred.password) credentialText += `Password: ${cred.password}\n`;
          if (cred.username) credentialText += `Username: ${cred.username}\n`;
          if (cred.phone) credentialText += `Phone: ${cred.phone}\n`;
          if (cred.recoveryEmail) credentialText += `Recovery Email: ${cred.recoveryEmail}\n`;
          if (cred.additionalInfo) credentialText += `Additional Info: ${cred.additionalInfo}\n`;
          
          if (credentialText.trim()) {
            credentialBlocks.push(credentialText.trim());
          }
        });
        
        if (credentialBlocks.length > 0) {
          account.credentials = credentialBlocks;
          needsUpdate = true;
          console.log(`Migrated ${credentialBlocks.length} credential blocks for: ${account.title}`);
        }
      }
      
      // Initialize credentialsInventory as empty array if it doesn't exist
      if (!account.credentialsInventory || !Array.isArray(account.credentialsInventory)) {
        account.credentialsInventory = [];
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await account.save();
        migratedCount++;
      }
    }

    console.log('Account credentials migration completed successfully');
    return { success: true, migratedCount };
  } catch (error) {
    console.error('Error during account credentials migration:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { migrateAccountsCredentials };