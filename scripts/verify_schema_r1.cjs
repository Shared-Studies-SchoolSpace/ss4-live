const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const migrationPath = path.join(rootDir, 'docs', 'migrations', '01_schema_r1.sql');
const schemaPath = path.join(rootDir, 'docs', 'db_schema.sql');

console.log('=== Milestone 1 (R1) Database Schema Verification ===');

let exitCode = 0;

function checkFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ [FAIL] ${label} does not exist at ${filePath}`);
    exitCode = 1;
    return '';
  }
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`✅ [PASS] ${label} exists (${content.length} bytes, ${content.split('\n').length} lines)`);
  return content;
}

const migrationSql = checkFile(migrationPath, 'Migration File (01_schema_r1.sql)');
const schemaSql = checkFile(schemaPath, 'Canonical Schema File (db_schema.sql)');

const requiredChecks = [
  // Profiles checks
  { name: 'profiles table definition', pattern: /CREATE TABLE (IF NOT EXISTS )?public\.profiles/i },
  { name: 'profiles.last_seen column', pattern: /last_seen timestamp with time zone/i },
  { name: 'idx_profiles_last_seen index', pattern: /idx_profiles_last_seen/i },
  { name: 'profiles RLS enable', pattern: /ALTER TABLE public\.profiles ENABLE ROW LEVEL SECURITY/i },
  { name: 'profiles SELECT policy', pattern: /CREATE POLICY "Public profiles are viewable by everyone" ON public\.profiles\s+FOR SELECT/i },
  { name: 'profiles UPDATE policy (self)', pattern: /CREATE POLICY "Users can update their own profiles" ON public\.profiles\s+FOR UPDATE USING \(auth\.uid\(\) = id\)/i },

  // Direct Messages checks
  { name: 'direct_messages table definition', pattern: /CREATE TABLE (IF NOT EXISTS )?public\.direct_messages/i },
  { name: 'direct_messages.sender_id column', pattern: /sender_id uuid REFERENCES public\.profiles\(id\)/i },
  { name: 'direct_messages.receiver_id column', pattern: /receiver_id uuid REFERENCES public\.profiles\(id\)/i },
  { name: 'direct_messages.message column', pattern: /message text NOT NULL/i },
  { name: 'direct_messages.read_at column', pattern: /read_at timestamp with time zone/i },
  { name: 'idx_direct_messages_read_at index', pattern: /idx_direct_messages_read_at/i },
  { name: 'direct_messages RLS enable', pattern: /ALTER TABLE public\.direct_messages ENABLE ROW LEVEL SECURITY/i },
  { name: 'direct_messages SELECT policy (sender or receiver)', pattern: /FOR SELECT USING \(auth\.uid\(\) = sender_id OR auth\.uid\(\) = receiver_id\)/i },
  { name: 'direct_messages INSERT policy (sender)', pattern: /FOR INSERT WITH CHECK \(auth\.uid\(\) = sender_id\)/i },
  { name: 'direct_messages UPDATE policy (receiver)', pattern: /FOR UPDATE USING \(auth\.uid\(\) = receiver_id\)/i },

  // Announcements checks
  { name: 'announcements table definition', pattern: /CREATE TABLE (IF NOT EXISTS )?public\.announcements/i },
  { name: 'announcements.author_id column', pattern: /author_id uuid REFERENCES public\.profiles\(id\)/i },
  { name: 'announcements.is_global column', pattern: /is_global boolean/i },
  { name: 'idx_announcements_created_at index', pattern: /idx_announcements_created_at/i },
  { name: 'announcements RLS enable', pattern: /ALTER TABLE public\.announcements ENABLE ROW LEVEL SECURITY/i },
  { name: 'announcements SELECT policy', pattern: /CREATE POLICY "Announcements are viewable by everyone" ON public\.announcements\s+FOR SELECT/i },
  { name: 'announcements INSERT policy (admin)', pattern: /CREATE POLICY "Only admins can insert announcements" ON public\.announcements\s+FOR INSERT/i },

  // Notifications checks
  { name: 'notifications table definition', pattern: /CREATE TABLE (IF NOT EXISTS )?public\.notifications/i },
  { name: 'notifications.user_id column', pattern: /user_id uuid REFERENCES public\.profiles\(id\)/i },
  { name: 'notifications.type column', pattern: /type text NOT NULL/i },
  { name: 'notifications.title column', pattern: /title text NOT NULL/i },
  { name: 'notifications.message column', pattern: /message text NOT NULL/i },
  { name: 'notifications.link column', pattern: /link text/i },
  { name: 'notifications.read_at column', pattern: /read_at timestamp with time zone/i },
  { name: 'notifications.metadata column', pattern: /metadata jsonb/i },
  { name: 'idx_notifications_user_id index', pattern: /idx_notifications_user_id/i },
  { name: 'notifications RLS enable', pattern: /ALTER TABLE public\.notifications ENABLE ROW LEVEL SECURITY/i },
  { name: 'notifications SELECT policy (user_id)', pattern: /FOR SELECT USING \(auth\.uid\(\) = user_id\)/i },
  { name: 'notifications UPDATE policy (user_id)', pattern: /FOR UPDATE USING \(auth\.uid\(\) = user_id\)/i }
];

console.log('\n--- Checking Migration File SQL Elements ---');
for (const check of requiredChecks) {
  if (check.pattern.test(migrationSql)) {
    console.log(`  ✅ [PASS] ${check.name} present in 01_schema_r1.sql`);
  } else {
    console.error(`  ❌ [FAIL] Missing ${check.name} in 01_schema_r1.sql`);
    exitCode = 1;
  }
}

console.log('\n--- Checking Canonical db_schema.sql Elements ---');
for (const check of requiredChecks) {
  if (check.pattern.test(schemaSql)) {
    console.log(`  ✅ [PASS] ${check.name} present in db_schema.sql`);
  } else {
    console.error(`  ❌ [FAIL] Missing ${check.name} in db_schema.sql`);
    exitCode = 1;
  }
}

if (exitCode === 0) {
  console.log('\n🎉 ALL DATABASE SCHEMA CHECKS PASSED SUCCESSFULLY!');
} else {
  console.error('\n❌ SOME VERIFICATION CHECKS FAILED!');
}

process.exit(exitCode);
