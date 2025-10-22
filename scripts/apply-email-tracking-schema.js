#!/usr/bin/env node

/**
 * Apply Email Tracking Schema
 */

const fs = require('fs');
const path = require('path');

console.log('📧 Applying email tracking schema...');

const schemaPath = path.join(__dirname, '../NOMINEE_EMAIL_TRACKING_SCHEMA.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('📋 Schema to apply:');
console.log('✅ Add email tracking fields to nominations table');
console.log('✅ Create nominee_email_log table');
console.log('✅ Add indexes for performance');
console.log('✅ Create trigger for automatic email tracking');
console.log('✅ Set up RLS policies');

console.log('\n🔧 Please run this SQL in your Supabase dashboard:');
console.log('=' .repeat(60));
console.log(schema);
console.log('=' .repeat(60));

console.log('\n📝 After applying the schema:');
console.log('1. ✅ Email tracking will be enabled');
console.log('2. ✅ Admin can send emails to nominees');
console.log('3. ✅ Email history will be tracked');
console.log('4. ✅ Source tracking (admin vs public) will work');

console.log('\n🧪 Test email functionality:');
console.log('- Use transactionalId: cmfb0xhia0qnaxj0ig98plajz');
console.log('- Test email: Rupesh7126@gmail.com');
console.log('- Check admin panel for email buttons');