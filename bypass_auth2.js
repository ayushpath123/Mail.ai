const fs = require('fs');

const paths = [
  'app/api/backend/v2/cv-profile/route.ts',
  'app/api/backend/v2/ai-email-campaign/route.ts',
  'app/api/backend/v2/generate-email-content/route.ts',
  'app/api/backend/v2/cv-chatbot/route.ts',
  'app/api/backend/v2/campaigns/route.ts',
  'app/api/backend/v2/update-smtp/route.ts',
  'app/api/backend/v2/queue-status/route.ts',
  'app/api/backend/v2/dashboard/stats/route.ts'
];

paths.forEach(p => {
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // flexible regex to match the if block of session id check completely
    // it matches: if (!session?.user?.id) { anything }
    content = content.replace(/if \(!session\?\.user\?\.id\)\s*\{[\s\S]*?return NextResponse\.json[\s\S]*?\s*\}/g, '// Authentication bypassed for demo');

    fs.writeFileSync(p, content);
    console.log(`Bypassed 2 in ${p}`);
  }
});
