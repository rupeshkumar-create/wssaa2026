#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the current API file
const apiFilePath = path.join(__dirname, '..', 'src/app/api/admin/separated-bulk-upload/route.ts');
let content = fs.readFileSync(apiFilePath, 'utf8');

console.log('🔧 Fixing validation logic...');

// Fix nominator email validation to allow empty values
content = content.replace(
  /if \(row\.nominator_email && !validateEmail\(row\.nominator_email\)\) \{/g,
  'if (row.nominator_email && row.nominator_email.trim() && !validateEmail(row.nominator_email)) {'
);

// Fix headshot URL validation to allow empty values
content = content.replace(
  /if \(row\.headshot_url && !validateURL\(row\.headshot_url\)\) \{/g,
  'if (row.headshot_url && row.headshot_url.trim() && !validateURL(row.headshot_url)) {'
);

// Fix logo URL validation to allow empty values
content = content.replace(
  /if \(row\.logo_url && !validateURL\(row\.logo_url\)\) \{/g,
  'if (row.logo_url && row.logo_url.trim() && !validateURL(row.logo_url)) {'
);

// Fix website URL validation to allow empty values
content = content.replace(
  /if \(row\.website && !validateURL\(row\.website\)\) \{/g,
  'if (row.website && row.website.trim() && !validateURL(row.website)) {'
);

// Fix LinkedIn URL validation to allow empty values (already done but ensure consistency)
content = content.replace(
  /if \(row\.linkedin && !validateURL\(row\.linkedin\)\) \{/g,
  'if (row.linkedin && row.linkedin.trim() && !validateURL(row.linkedin)) {'
);

// Write the fixed content back
fs.writeFileSync(apiFilePath, content);

console.log('✅ Validation logic fixed!');
console.log('📋 Changes made:');
console.log('- Nominator email validation now allows empty values');
console.log('- URL validations now allow empty values');
console.log('- Only validates when fields have actual content');

console.log('\n🚀 You can now try uploading your CSV again!');