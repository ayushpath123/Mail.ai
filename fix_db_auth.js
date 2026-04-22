const fs = require('fs');
const glob = require('glob');

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
    
    // Replace the Prisma fallback with a hardcoded ID
    const dbFallbackRegex = /const user_id = session\?\.[a-zA-Z\?]+ \? parseInt[^:]+ : \(await db\.user\.findFirst\(\)\)\?\.id \|\| 1;/g;
    content = content.replace(dbFallbackRegex, `const user_id = 1; // Hardcoded for demo to avoid DB requirement`);

    fs.writeFileSync(p, content);
    console.log(`Fixed DB fallback in ${p}`);
  }
});
