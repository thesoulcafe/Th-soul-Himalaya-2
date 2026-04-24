import fs from 'fs';
import path from 'path';

// We'll read the constants.ts file as text to avoid ESM/TS import issues in various environments
const constantsPath = path.join(process.cwd(), 'src', 'constants.ts');
const content = fs.readFileSync(constantsPath, 'utf-8');

function extractArray(name: string) {
  const regex = new RegExp(`export const ${name} = \\[(.*?)\\];`, 's');
  const match = content.match(regex);
  if (!match) return [];
  
  // This is a bit hacky but works for extracting the basic structure
  // We'll use a more robust way by just looking for the objects
  const objects: any[] = [];
  const objectRegex = /\{[\s\S]*?id:\s*['"](.*?)['"][\s\S]*?\}/g;
  let objMatch;
  
  // Scoped to the specific array
  const arrayContent = match[1];
  while ((objMatch = objectRegex.exec(arrayContent)) !== null) {
    const objStr = objMatch[0];
    const id = objMatch[1];
    
    const titleMatch = objStr.match(/title:\s*['"](.*?)['"]/);
    const descMatch = objStr.match(/description:\s*['"](.*?)['"]/);
    const imageMatch = objStr.match(/image:\s*['"](.*?)['"]/);
    const durationMatch = objStr.match(/duration:\s*['"](.*?)['"]/);
    
    objects.push({
      id,
      title: titleMatch ? titleMatch[1] : '',
      description: descMatch ? descMatch[1] : '',
      image: imageMatch ? imageMatch[1] : '',
      duration: durationMatch ? durationMatch[1] : ''
    });
  }
  return objects;
}

const allMetadata = {
  tours: extractArray('DEFAULT_TOURS'),
  trekks: extractArray('DEFAULT_TREKKS'),
  yoga: extractArray('DEFAULT_YOGA'),
  meditation: extractArray('DEFAULT_MEDITATION'),
  adventure: extractArray('DEFAULT_ADVENTURE'),
  wfh: extractArray('DEFAULT_WFH')
};

// Flatten for easy lookup
const flatMetadata: Record<string, any> = {};
Object.values(allMetadata).flat().forEach((pkg: any) => {
  if (pkg.id) flatMetadata[pkg.id] = pkg;
});

// Add specific overrides
if (flatMetadata['med-1']) {
  flatMetadata['med-1'].description = "Experience deep stillness in the high-altitude motor-free wilderness of Tosh toKutla.";
}

const outputPath = path.join(process.cwd(), 'package-metadata-ssr.json');
fs.writeFileSync(outputPath, JSON.stringify(flatMetadata, null, 2));

console.log(`Successfully generated metadata for ${Object.keys(flatMetadata).length} packages.`);
