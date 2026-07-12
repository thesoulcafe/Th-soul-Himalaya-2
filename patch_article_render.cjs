const fs = require('fs');

const path = 'src/pages/ArticleDetail.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add highlight-box support
const highlightBoxRender = `
            if (block.type === 'highlight-box') {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="my-16 p-10 md:p-14 bg-gradient-to-br from-forest to-forest/90 text-white rounded-[2.5rem] shadow-2xl shadow-forest/20 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-1000" />
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-2xl md:text-3xl font-heading font-black italic tracking-tight">{block.title}</h3>
                    <p className="text-lg text-white/80 leading-relaxed font-medium">{block.text}</p>
                  </div>
                </motion.div>
              );
            }
`;

// Add image-banner support
const imageBannerRender = `
            if (block.type === 'image-banner') {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="my-16 relative aspect-[21/9] w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/10 group"
                >
                  <img src={block.url} alt="Article imagery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-10">
                    <p className="text-white font-medium text-lg tracking-wide drop-shadow-md">{block.caption}</p>
                  </div>
                </motion.div>
              );
            }
`;

content = content.replace("if (block.type === 'internal-links') {", highlightBoxRender + imageBannerRender + "\n            if (block.type === 'internal-links') {");

fs.writeFileSync(path, content);
console.log("Patched render types.");
