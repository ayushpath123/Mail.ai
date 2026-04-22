const fs = require('fs');
const glob = require('glob');

const targetStr = `const user_id = session?.user?.id ? parseInt(session.user.id as string) : (await db.user.findFirst())?.id || 1;`;

const files = glob.sync('app/api/backend/v2/**/*.ts');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(targetStr)) {
    content = content.replaceAll(targetStr, `const user_id = 1;`);
    fs.writeFileSync(file, content);
    console.log(`Fixed exact findFirst string in ${file}`);
  }
}
