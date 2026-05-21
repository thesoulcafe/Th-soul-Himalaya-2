const fs = require('fs');
const file = 'src/pages/ArticleDetail.tsx';
let content = fs.readFileSync(file, 'utf8');

// The error was caused by `}\n\n      {\n        type: "paragraph",`
// Let's replace `}\n\n      {\n        type: "paragraph",` with `},\n      {\n        type: "paragraph",`

content = content.replace(/\}\s*\{\s*type: "paragraph",/g, '},\n      {\n        type: "paragraph",');

// Ensure that `internal-links` also doesn't have syntax errors before it.
content = content.replace(/\}\s*\{\s*type: "internal-links"/g, '},\n      {\n        type: "internal-links"');

fs.writeFileSync(file, content, 'utf8');
