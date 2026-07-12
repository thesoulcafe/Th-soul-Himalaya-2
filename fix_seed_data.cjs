const fs = require('fs');
const path = 'src/lib/seedData.ts';
let contentStr = fs.readFileSync(path, 'utf8');

// The injected string has class="my-12..." which breaks the TS string. 
// It starts with <div class="my-12
contentStr = contentStr.replace(/<div class="my-12/g, "<div class='my-12");
contentStr = contentStr.replace(/<div class="absolute -top-20/g, "<div class='absolute -top-20");
contentStr = contentStr.replace(/<h3 class="text-2xl/g, "<h3 class='text-2xl");
contentStr = contentStr.replace(/<p class="text-lg/g, "<p class='text-lg");

fs.writeFileSync(path, contentStr);
