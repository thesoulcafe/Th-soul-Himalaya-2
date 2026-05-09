import fs from 'fs';
import { globSync } from 'glob';

// using node's built-in fs and path instead since glob might not be installed, or we can just iterate known files.
const filesToProcess = [
  'src/pages/Yoga.tsx',
  'src/pages/Meditation.tsx',
  'src/pages/Checkout.tsx',
  'src/pages/Tours.tsx',
  'src/pages/ParvatiValley.tsx',
  'src/pages/Adventure.tsx',
  'src/pages/Cart.tsx'
];

filesToProcess.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace image logic in sliders
  content = content.replace(/\(\([^)]+\.toLowerCase\(\)\.includes\('valley of shadows'\)\s*\n?\s*\?\s*\["https:\/\/i\.postimg\.cc\/TYqctVvr\/IMG-8144\.jpg"\]\s*\n?\s*:\s*\[(.*?\.image),\s*\.\.\.\((.*?\.images)\s*\|\|\s*\[\]\)/g, "[$1, ...($2 || [])");

  // Replace image logic in cart/checkout
  content = content.replace(/src=\{\([^)]+\.toLowerCase\(\)\.includes\("valley of shadows"\)\s*\?\s*"https:\/\/i\.postimg\.cc\/TYqctVvr\/IMG-8144\.jpg"\s*:\s*item\.image\}/g, "src={item.image}");

  // General fallback replacement
  content = content.replace(/"https:\/\/i\.postimg\.cc\/TYqctVvr\/IMG-8144\.jpg"/g, '"https://images.unsplash.com/photo-1544333323-167bb3098522?auto=format&fit=crop&w=1200&h=630&q=80"');

  fs.writeFileSync(file, content);
});
console.log("Done");
