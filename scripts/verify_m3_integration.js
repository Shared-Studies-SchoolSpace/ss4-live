import fs from 'fs';
import path from 'path';

function checkFileExists(relPath) {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File missing: ${relPath}`);
    return false;
  }
  console.log(`✅ File exists: ${relPath}`);
  return true;
}

function checkContentIncludes(relPath, snippets) {
  const fullPath = path.join(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) return false;
  const content = fs.readFileSync(fullPath, 'utf8');
  for (const snippet of snippets) {
    if (!content.includes(snippet)) {
      console.error(`❌ ${relPath} missing expected snippet: "${snippet}"`);
      return false;
    }
  }
  console.log(`✅ ${relPath} contains all ${snippets.length} required integration snippets.`);
  return true;
}

async function runIntegrationVerification() {
  console.log('=== Milestone 3 (R3): Universal Integration Verification ===');
  let ok = true;

  // 1. Files existence check
  ok = checkFileExists('src/components/messaging/DirectChat.jsx') && ok;
  ok = checkFileExists('src/components/announcements/AdminBroadcastPanel.jsx') && ok;
  ok = checkFileExists('src/components/admin/AdminDrawer.jsx') && ok;
  ok = checkFileExists('src/components/Header.jsx') && ok;
  ok = checkFileExists('src/features/auth-portal/pages/DashboardPage.jsx') && ok;
  ok = checkFileExists('src/features/chess-league/components/AdminTab.jsx') && ok;
  ok = checkFileExists('src/features/chess-league/pages/ChessTournamentPage.jsx') && ok;

  // 2. Integration snippets check
  console.log('\nChecking component integrations across admin surfaces:');
  ok = checkContentIncludes('src/components/messaging/DirectChat.jsx', [
    'direct_messages',
    'read_at',
    'onlineUsers',
    'unreadMessages',
    'last_seen'
  ]) && ok;

  ok = checkContentIncludes('src/components/announcements/AdminBroadcastPanel.jsx', [
    'announcements',
    'notifications',
    'targetType',
    'broadcastMode'
  ]) && ok;

  ok = checkContentIncludes('src/components/admin/AdminDrawer.jsx', [
    'AdminBroadcastPanel',
    'isOpen',
    'onClose'
  ]) && ok;

  ok = checkContentIncludes('src/components/Header.jsx', [
    'AdminDrawer',
    'isAdminDrawerOpen'
  ]) && ok;

  ok = checkContentIncludes('src/features/auth-portal/pages/DashboardPage.jsx', [
    'AdminBroadcastPanel',
    'AdminDrawer'
  ]) && ok;

  ok = checkContentIncludes('src/features/chess-league/components/AdminTab.jsx', [
    'AdminBroadcastPanel'
  ]) && ok;

  ok = checkContentIncludes('src/features/chess-league/pages/ChessTournamentPage.jsx', [
    'AdminBroadcastPanel'
  ]) && ok;

  if (!ok) {
    console.error('\n❌ Universal Integration Verification Failed!');
    process.exit(1);
  }

  console.log('\n🎉 Universal Integration Verification Passed Successfully!\n');
}

runIntegrationVerification();
