const fs = require('fs');
let code = fs.readFileSync('src/components/PackageDetailModal.tsx', 'utf8');

const oldStr = `{pkg.slots && pkg.slots.length > 0 ? (
                        <div className="relative w-full sm:w-[240px] lg:w-[280px] group shrink-0">
                           <select 
                            value={selectedSlotIndex}
                            onChange={(e) => setSelectedSlotIndex(e.target.value)}
                            className="w-full h-14 rounded-full border border-forest/10 bg-forest/[0.02] pl-6 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-forest/10 text-forest font-bold text-xs tracking-[0.1em] uppercase cursor-pointer outline-none transition-all group-hover:bg-white truncate"
                          >
                            <option value="">Select Date</option>
                            {pkg.slots.map((slot: any, i: number) => { const start = new Date(slot.startDate); const today = new Date(); today.setHours(0, 0, 0, 0); if (start < today) return null;
                              const start = new Date(slot.startDate);
                              let endStr = '';
                              if (slot.endDate) {
                                endStr = \` - \${new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}\`;
                              } else if (duration) {
                                const daysMatch = duration.match(/(\\d+)/);
                                const days = daysMatch ? parseInt(daysMatch[1]) : 1;
                                const end = new Date(start);
                                end.setDate(start.getDate() + days - 1);
                                endStr = \` - \${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}\`;
                              }
                              return (
                                <option key={i} value={i}>
                                  {start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{endStr}
                                </option>
                              );
                            })}
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/40 pointer-events-none group-hover:text-forest transition-colors" />
                        </div>
                      ) : (`;

const newStr = `{(() => {
  const futureSlots = pkg.slots ? pkg.slots.filter((slot) => {
    const start = new Date(slot.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return start >= today;
  }) : [];
  
  return futureSlots.length > 0 ? (
    <div className="relative w-full sm:w-[240px] lg:w-[280px] group shrink-0">
      <select 
        value={selectedSlotIndex}
        onChange={(e) => setSelectedSlotIndex(e.target.value)}
        className="w-full h-14 rounded-full border border-forest/10 bg-forest/[0.02] pl-6 pr-12 appearance-none focus:outline-none focus:ring-2 focus:ring-forest/10 text-forest font-bold text-xs tracking-[0.1em] uppercase cursor-pointer outline-none transition-all group-hover:bg-white truncate"
      >
        <option value="">Select Date</option>
        {futureSlots.map((slot: any) => {
          const originalIndex = pkg.slots.indexOf(slot);
          const start = new Date(slot.startDate);
          let endStr = '';
          if (slot.endDate) {
            endStr = \` - \${new Date(slot.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}\`;
          } else if (duration) {
            const daysMatch = duration.match(/(\\d+)/);
            const days = daysMatch ? parseInt(daysMatch[1]) : 1;
            const end = new Date(start);
            end.setDate(start.getDate() + days - 1);
            endStr = \` - \${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}\`;
          }
          return (
            <option key={originalIndex} value={originalIndex}>
              {start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}{endStr}
            </option>
          );
        })}
      </select>
      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-forest/40 pointer-events-none group-hover:text-forest transition-colors" />
    </div>
  ) : (
`;

code = code.replace(oldStr.replace(/\s+/g, ''), newStr);
// wait, replacing by stripping whitespace isn't straightforward.
// Instead I will just read file, find substring ignoring space, or just use regex.
