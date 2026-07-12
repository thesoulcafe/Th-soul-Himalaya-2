const fs = require('fs');

const path = 'src/pages/CosmicManifestation.tsx';
let contentStr = fs.readFileSync(path, 'utf8');

const additionalParagraphs = [
  "The ecological diversity of this region is as profound as its spiritual heritage. Ranging from dense, subtropical cedar forests in the lower elevations to stark, alpine tundra near the glacial peaks, the environment demands respect and adaptability. Every rustling leaf and rushing stream seems to echo ancient mantras, creating a natural symphony that aids deeply in meditative practices.",
  "Travelers embarking on this journey often describe a profound sense of temporal dislocation. Away from the relentless pace of modernity, time here is measured not by clocks, but by the movement of the sun across the jagged peaks and the seasonal swelling of the rivers. This deep connection to the natural cycles fosters a unique environment for introspection and psychological healing.",
  "In maintaining the sanctity of these spaces, sustainable interaction is paramount. The fragile high-altitude ecosystems are highly susceptible to human impact. By practicing 'leave no trace' principles, supporting local conservation efforts, and approaching the land as a living, breathing entity rather than a mere backdrop for tourism, visitors ensure that the cosmic manifestation remains unblemished for future generations of seekers."
];

const replacement = '],\n    theme:';

// We can replace '],\n    theme:' with '  ...additionalParagraphs],\n    theme:' but additionalParagraphs needs to be injected.
// Since it's an array of strings in TS, we can just insert the strings.

const extraStr = additionalParagraphs.map(p => `      "${p}"`).join(',\n') + '\n    ';

contentStr = contentStr.replace(/\"\n    \],/g, '",\n' + extraStr + '],');

fs.writeFileSync(path, contentStr);
console.log("Expanded CosmicManifestation.");
