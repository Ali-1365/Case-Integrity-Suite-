import * as fs from 'fs';

const file = 'lib/AIAnalysisEngine.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/'pro'/g, "'system'");
content = content.replace(/'flash'/g, "'system'");

fs.writeFileSync(file, content, 'utf8');
