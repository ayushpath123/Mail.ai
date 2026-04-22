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
    
    // Replace the block throwing 401
    const authRegex = /if \(!session\?\.user\?\.id\) \{\s*return NextResponse\.json\(\s*\{\s*error: "Authentication required"\s*\},\s*\{\s*status: 401\s*\}\s*\);\s*\}/g;
    content = content.replace(authRegex, `// Authentication bypassed for demo`);

    // Fix the session.user.id parsing
    const userParseRegex = /const user_id = parseInt\(session\.user\.id as string\);/g;
    content = content.replace(userParseRegex, `const user_id = session?.user?.id ? parseInt(session.user.id as string) : (await db.user.findFirst())?.id || 1;`);

    const userParseRegex2 = /const user_id = parseInt\(session\?\.user\?\.id as string\);/g;
    content = content.replace(userParseRegex2, `const user_id = session?.user?.id ? parseInt(session.user.id as string) : (await db.user.findFirst())?.id || 1;`);

    // Fix session.user.username to session?.user?.username
    content = content.replace(/session\.user\.username/g, 'session?.user?.username');

    fs.writeFileSync(p, content);
    console.log(`Bypassed auth in ${p}`);
  }
});
