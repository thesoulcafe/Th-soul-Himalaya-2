import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft,
  Clock, 
  MapPin, 
  Calendar, 
  Share2, 
  BookOpen, 
  Wind,
  Star,
  Compass,
  History,
  Sparkles,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';
import { 
  DEFAULT_TOURS, DEFAULT_TREKKS, DEFAULT_SHOP, 
  DEFAULT_YOGA, DEFAULT_MEDITATION, DEFAULT_ADVENTURE, 
  DEFAULT_WFH, DEFAULT_SERVICES 
} from '@/constants';

// Enhanced Intelligence Database for 2026
const ARTICLE_CONTENT: Record<string, any> = {
  "tosh-treks-guide": {
    title: "Treks from Tosh: Ultimate Guide to High-Altitude Trails",
    category: "Trekking Guide",
    readTime: "8 min read",
    date: "May 2026",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80",
    author: "Soul Expeditions",
    authorRole: "Trekking Coordinators",
    content: [
      {
        type: "paragraph",
        text: "Tosh isn't just a place to relax; it is the ultimate basecamp for some of the most spectacular treks in the Parvati Valley. Whether you are seeking a short day hike to high-altitude meadows or a multi-day expedition into the deep Himalayas, Tosh is your starting point."
      },
      {
        type: "heading",
        text: "1. Kutla Glacier Point Trek"
      },
      {
        type: "paragraph",
        text: "Just a few hours hike above Tosh lies the pristine meadow of Kutla. Surrounded by pine forests and offering uninterrupted views of the Tosh Glacier ice tongues, Kutla is perfect for those who want to escape the growing crowds of Tosh."
      },
      {
        type: "paragraph",
        text: "The trail is steep but incredibly rewarding. It begins at the waterfall above Tosh and winds through apple orchards before entering the dense alpine forest. You can explore our dedicated Kutla expedition below."
      },
      {
        type: "tour-link",
        tourId: "trekk-1",
        tourTitle: "Kutla Glacier Expedition",
        url: "/trekks/trekk-1"
      },
      {
        type: "heading",
        text: "2. The Kheerganga Trek (Via Nakthan / Tosh)"
      },
      {
        type: "paragraph",
        text: "While the traditional route to Kheerganga starts at Barshaini, many trekkers prefer to stay in Tosh and start their journey from here. The trail converges near the Nakthan village and leads you through breathtaking gorges, ancient Shiva temples, and dense canopies until you reach the divine hot springs at the summit."
      },
      {
        type: "paragraph",
        text: "Kheerganga is a moderate 12km trek. Soaking your tired muscles in the natural hot springs while watching the snow-capped peaks is an experience you won't easily forget. We offer comprehensive guided packages with camping included."
      },
      {
        type: "tour-link",
        tourId: "tour-18",
        tourTitle: "Kheerganga & Tosh Special",
        url: "/tours/tour-18"
      },
      {
        type: "heading",
        text: "3. Animal Pass (For Experienced Trekkers)"
      },
      {
        type: "paragraph",
        text: "For the highly experienced and physically fit, the trail continues past Kutla towards the challenging Animal Pass. Reaching heights over 4,500 meters, this is a technical trek that requires proper acclimatization, guides, and camping gear. The views of the deep Himalayan divides are unparalleled, but it is not recommended for beginners."
      },
      {
        type: "quote",
        text: "Tosh is where the road ends, but for the true explorer, it is where the real journey begins.",
        author: "Himalayan Proverb"
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "tosh-guide-2026": {
    title: "The Ultimate Guide to Tosh Village (2026 Edition)",
    category: "Strategic Guide",
    readTime: "12 min read",
    date: "April 2026",
    image: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=2000&auto=format&fit=crop",
    author: "Arjun Sharma",
    authorRole: "Senior Soul Guide",
    content: [
      {
        type: "paragraph",
        text: "Tosh in 2026 is no longer the hidden secret it was a decade ago, but it has retained its position as the sentinel of the Pin Parvati Pass. As the village evolves into a hub for digital nomads and serious high-altitude trekkers, understanding the new logistics is critical for a smooth journey."
      },
      {
        type: "quote",
        text: "In Tosh, the mountains don't just surround you; they speak to you in the silence between the falling cedar needles.",
        author: "Local Elder"
      },
      {
        type: "heading",
        text: "The 2026 Infrastructure Upgrade"
      },
      {
        type: "paragraph",
        text: "Last year, the local Panchayat implemented a solar-powered path lighting grid, making evening walks to the higher cafes significantly safer. Additionally, a new fiber-optic corridor has brought stable 50Mbps internet to over 60% of the village, a revolution for those balancing work with wanderlust."
      },
      {
        type: "paragraph",
        text: "Despite these modern touches, the core of Tosh remains untouched. The smell of cedar smoke in the evening remains the olfactory signature of this Himalayan sentinel. The cobblestone paths still ring with the sound of mules carrying essential supplies, a rhythmic reminder of the village's persistent isolation."
      },
      {
        type: "list",
        title: "Key Ground Updates",
        items: [
          "Road Connectivity: The shared taxi stand has moved 200m closer to the village gate, easing the final ascent for those with heavy packs.",
          "Waste Management: A mandatory 'Carry Back' policy for plastic is now strictly enforced at the Barshaini bridge. There is a small deposit fee for plastic bottles that is returned upon exit.",
          "Regional Permits: No special permits are needed for Tosh, but keep your original ID ready for the police check-post at Jari."
        ]
      },
      {
        type: "heading",
        text: "Navigating the Social Fabric"
      },
      {
        type: "paragraph",
        text: "As you walk through the narrow lanes, you'll see a mix of traditional wooden carvings and new-age mural art. It's a village in transition, where the ancient and the digital coexist in a delicate dance. Remember to greet the locals with a 'Namaste'—it opens more doors than any amount of money ever could."
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "malana-democracy": {
    title: "Malana: Decoding the World's Oldest Democracy",
    category: "Historical Study",
    readTime: "15 min read",
    date: "March 2026",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000&auto=format&fit=crop",
    author: "Elena Petrova",
    authorRole: "Anthropologist & Researcher",
    content: [
      {
        type: "paragraph",
        text: "Malana stands apart from the rest of the world, not just geographically but through a social contract that has survived thousands of years. Known as the 'Oldest Democracy', its judicial system is governed by the edicts of Jamlu Devta, delivered through a chosen oracle."
      },
      {
        type: "quote",
        text: "To enter Malana is to step through a portal into a time where gods still walk among men, giving judgment from the high peaks.",
        author: "Historical Archive"
      },
      {
        type: "heading",
        text: "The Edicts of Jamlu Devta"
      },
      {
        type: "paragraph",
        text: "In Malana, the law is simple: do not touch. Visitors are strictly prohibited from touching the walls, temples, or the inhabitants. This isn't just a cultural norm; it is an administrative requirement that maintains the 'purity' of the village lineage. The council of elders, known as the Upper and Lower Houses, ensures that these edicts are followed precisely."
      },
      {
        type: "list",
        title: "Protocols for Visitors",
        items: [
          "Stay on the designated stone paths at all times. Wandering into private courtyards is a grave offense.",
          "Currency Exchange: Payment should be placed on the designated stone slabs or counters, never handed over directly to avoid contact.",
          "Sacred Architecture: Photography of the Upper Court (Parliament) building is strictly forbidden to preserve its sanctity."
        ]
      },
      {
        type: "heading",
        text: "The Myth of Greek Ancestry"
      },
      {
        type: "paragraph",
        text: "The lore of Alexander the Great's soldiers settling here is pervasive. While genetic studies provide a nuanced view, the presence of distinct facial features and a unique governing structure keep the legend alive. Whether Greek or autochthonous, the Malanese are a people fiercely protective of their heritage."
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "fairy-forest-pulga": {
    title: "The Fairy Forest: A Botanical & Spiritual Study",
    category: "Regional Wisdom",
    readTime: "10 min read",
    date: "May 2026",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2000&auto=format&fit=crop",
    author: "Rahul Varma",
    authorRole: "Eco-Guide & Naturalist",
    content: [
      {
        type: "paragraph",
        text: "The Fairy Forest in Pulga is an ancient deodar grove where the light filters through needles like liquid gold. It is a place of profound silence, favored by those seeking meditation or a reset from the digital noise of the cities. During the magic hour, the emerald moss on the trees seems to glow with an inner luminescence."
      },
      {
        type: "quote",
        text: "The forest does not just exist; it breathes. Every breath you take here is a gift from the ancient cedar spirits.",
        author: "Pulga Resident"
      },
      {
        type: "heading",
        text: "The Ecology of Silence"
      },
      {
        type: "paragraph",
        text: "In 2026, the forest remains one of the few 'Silent Zones' in the Parvati Valley. Here, the local community has successfully petitioned against any loudspeakers or large organized parties. This has led to a return of rare Himalayan birds, their songs now the primary soundtrack to your morning stroll."
      },
      {
        type: "list",
        title: "Ethical Exploration Tips",
        items: [
          "Footprint-Free: Stick to the soft trails to avoid compacting the delicate moss layers.",
          "Flora Protection: Plucking wildflowers or collecting rare fungi is prohibited by village edict.",
          "Mindful Media: If filming, use minimal gear and respect the silence of those meditating nearby."
        ]
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "social-taboos": {
    title: "Social Taboos: A Guide for Respectful Exploration",
    category: "Cultural Intelligence",
    readTime: "10 min read",
    date: "April 2026",
    image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=2000&auto=format&fit=crop",
    author: "Tenzing Norgay",
    authorRole: "Cultural Liaison",
    content: [
      {
        type: "paragraph",
        text: "Navigating the cultural landscape of Malana requires more than just a map; it requires an understanding of a social contract that has remained unchanged for thousands of years. The 'taboos' here are not mere suggestions—they are the survival mechanisms of an ancient lineage."
      },
      {
        type: "heading",
        text: "The Core Invariant: Purity Through Distance"
      },
      {
        type: "paragraph",
        text: "The most famous taboo is the 'No-Touch' rule. This extends to people, temples, and even the external walls of many houses. In the Malanese worldview, contact with outsiders is seen as a form of spiritual pollution that requires expensive ritual cleansing."
      },
      {
        type: "list",
        title: "The Non-Negotiables",
        items: [
          "Handing Objects: Never hand anything directly to a resident. Place it on the designated stones or counters.",
          "Temple Boundaries: The temples are for the initiated only. Crossing the threshold without permission is a serious violation.",
          "Sacred Flora: Do not pluck any flowers or plants within the village boundaries. They are considered property of the Devta."
        ]
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "malana-heritage": {
    title: "The Legend of Alexander: Greek DNA in the Himalayas?",
    category: "Genetic History",
    readTime: "14 min read",
    date: "March 2026",
    image: "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=2000&auto=format&fit=crop",
    author: "Dr. Sofia Katsaros",
    authorRole: "Historian",
    content: [
      {
        type: "paragraph",
        text: "For centuries, the legend has persisted: that the people of Malana are the descendants of Alexander the Great's soldiers. These men, wounded or weary from the campaign, are said to have found refuge in this inaccessible valley, forging a new society based on their homeland's democratic principles."
      },
      {
        type: "heading",
        text: "Linguistic Evidence"
      },
      {
        type: "paragraph",
        text: "The language of Malana, 'Kanashi', is an isolate. It has no clear connection to the surrounding Indo-Aryan or Tibeto-Burman languages. This linguistic anomaly is one of the strongest arguments for a distinct, and perhaps foreign, origin story."
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "tosh-roads-2026": {
    title: "The Road to Tosh: 2026 Transit Intelligence",
    category: "Logistics",
    readTime: "6 min read",
    date: "May 2026",
    image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=2000&auto=format&fit=crop",
    author: "Vikram Negi",
    authorRole: "Local Logistics Expert",
    content: [
      {
        type: "paragraph",
        text: "Reaching Tosh in 2026 is an exercise in mountain navigation. The road from Bhuntar has seen widening projects, but the final stretch from Barshaini remains a test of both vehicle and driver. Understanding the timing is key to avoiding the tourist bottlenecks."
      },
      {
        type: "list",
        title: "Strategic Transit Tips",
        items: [
          "Early Arrivals: Aim to cross Manikaran before 8:00 AM to avoid the pilgrimage traffic.",
          "Taxi Coordination: Shared taxis from Barshaini operate on a 'full-load' basis. For private transit, booking 24 hours in advance is now required.",
          "Monsoon Readiness: During July-August, check the status of the Jari bridge hourly for potential closures."
        ]
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "tosh-cafes": {
    title: "Best Cafes in Tosh for Workations & Views",
    category: "Lifestyle",
    readTime: "8 min read",
    date: "April 2026",
    image: "https://images.unsplash.com/photo-1544120190-275d3122c366?q=80&w=2000&auto=format&fit=crop",
    author: "Zoe Miller",
    authorRole: "Digital Nomad",
    content: [
      {
        type: "paragraph",
        text: "Tosh has evolved into the ultimate 'Office with a View'. The 2026 cafe scene is characterized by two things: high-speed satellite internet and world-class organic mountain produce."
      },
      {
        type: "list",
        title: "The Nomad's Shortlist",
        items: [
          "The Soul Cafe: Best for deep work and high-fidelity coffee.",
          "Pink Floyd: Still the undisputed king of sunset vistas.",
          "Woodside Inn: A quiet retreat for those who need silence between meetings."
        ]
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "tosh-kheerganga-trek": {
    title: "Tosh to Kheerganga: Latest Rules and Updates",
    category: "Adventure Lore",
    readTime: "10 min read",
    date: "May 2026",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop",
    author: "Sunil Thapa",
    authorRole: "Lead Mountain Guide",
    content: [
      {
        type: "paragraph",
        text: "The trek from Tosh to Kheerganga via Nakthan is the most iconic route in the valley. In 2026, the trail has been streamlined with new ecological markers and designated rest zones to manage the increasing visitor throughput."
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "tosh-packing": {
    title: "What to Pack for Tosh in May: 2026 Gear Guide",
    category: "Logistics",
    readTime: "5 min read",
    date: "May 2026",
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef23a6f8?q=80&w=2000&auto=format&fit=crop",
    author: "Maya Singh",
    authorRole: "Outdoor Gear specialist",
    content: [
      {
        type: "paragraph",
        text: "Packing for the Himalayas in May is an exercise in versatility. You must plan for both the biting alpine cold of the night and the intense UV radiation of the midday sun."
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "pulga-architecture": {
    title: "Slow Living: The Pulga Architecture Manual",
    category: "Design study",
    readTime: "11 min read",
    date: "May 2026",
    image: "https://images.unsplash.com/photo-1449156001437-3a144f0083bb?q=80&w=2000&auto=format&fit=crop",
    author: "Kabir Das",
    authorRole: "Architect & Historian",
    content: [
      {
        type: "paragraph",
        text: "Pulga's architecture is a testament to Himalayan ingenuity. The 'Kath-Kuni' style—alternating layers of stone and deodar wood—allows structures to breathe and withstand seismic activity. These houses aren't just buildings; they are living thermal regulators."
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "pulga-nomads": {
    title: "Digital Nomads in the Woods: Survival Guide",
    category: "Intelligence",
    readTime: "9 min read",
    date: "June 2026",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2000&auto=format&fit=crop",
    author: "Zoe Miller",
    authorRole: "Digital Nomad",
    content: [
      {
        type: "paragraph",
        text: "Pulga has emerged as the forest capital for digital nomads. With the arrival of high-speed satellite internet in 2026, the 'Fairy Forest Cafes' now offer a level of connectivity previously unthinkable in such remote terrain."
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "trekking-guide": {
    title: "High Altitude Survival: The 12km Spiritual Trek",
    category: "Adventure Logic",
    readTime: "15 min read",
    date: "July 2026",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop",
    author: "Sunil Thapa",
    authorRole: "Lead Mountain Guide",
    content: [
      {
        type: "paragraph",
        text: "Trekking in the Parvati Valley requires respect for the topography. At 2,960 meters, Kheerganga is where many trekkers first experience altitude-related fatigue. Proper hydration and a rhythmic pace are critical for a safe ascent."
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "hot-springs": {
    title: "Thermal Sanctity: The Science & Myth of the Springs",
    category: "Natural Science",
    readTime: "7 min read",
    date: "July 2026",
    image: "https://images.unsplash.com/photo-1544120190-275d3122c366?q=80&w=2000&auto=format&fit=crop",
    author: "Dr. Amit Roy",
    authorRole: "Geologist",
    content: [
      {
        type: "paragraph",
        text: "The natural hot springs of Kheerganga are a geological marvel. Rich in sulfur and other minerals, these waters have been used for centuries to cure skin ailments and muscle exhaustion. The science of their heat is connected to deep subterranean tectonic shifts."
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "internal-links"
      }
    ]
  },
  "kheerganga-legend": {
    title: "The Legend of Kartikeya: Sacred Peaks & Silence",
    category: "Spiritual Archive",
    readTime: "12 min read",
    date: "June 2026",
    image: "https://images.unsplash.com/photo-1618572425332-29ada2e188a5?q=80&w=2000&auto=format&fit=crop",
    author: "Swami Vishwananda",
    authorRole: "Himalayan Scholar",
    content: [
      {
        type: "paragraph",
        text: "Kheerganga is more than just a destination; it is a pilgrimage site for the soul. Perched at nearly 3,000 meters, this meadow is where many seekers find their first true connection to the Himalayan void. The name itself—meaning 'Milky River'—hints at its divine origins."
      },
      {
        type: "heading",
        text: "The Cosmic Kheer"
      },
      {
        type: "paragraph",
        text: "According to local lore, Lord Shiva's son, Kartikeya, meditated in a cave here for thousands of years. It is said that Goddess Parvati made 'Kheer' (rice pudding) for him, and the white, frothing waters of the springs are a remnant of that divine meal. The waters are naturally heated, a warm embrace from the earth's core."
      },
      {
        type: "quote",
        text: "To bathe in Kheerganga is to wash away the karmic dust of the plains.",
        author: "Traditional Proverb"
      },
      {
        type: "heading",
        text: "The Kartikeya Cave"
      },
      {
        type: "paragraph",
        text: "While most visitors focus on the hot springs, the true spiritual heart of Kheerganga is the Kartikeya Cave, located a short climb above the plateau. The cave is managed by local ascetics who maintain a vow of partial silence. Entering the cave requires a quiet mind and a humble heart."
      },
      {
        type: "list",
        title: "Spiritual Etiquette",
        items: [
          "Silence in the Hot Springs: Respect the meditative state of others by keeping conversations low.",
          "Offerings: Traditional offerings like dhup (incense) or local flowers are welcomed at the cave entrance.",
          "Dress Code: Maintain modesty when visiting the temple and cave areas."
        ]
      }
    ]
  }
};

import { HAMLET_DETAILS } from './HamletDetail';

// Auto-generates a rich 500-word SEO article structure for undefined articles
const generateContent = (hamletId: string, articleMeta: any, articleId: string) => {
  const hId = hamletId ? hamletId.charAt(0).toUpperCase() + hamletId.slice(1) : "The Himalayas";
  const slugToTitle = (slug: string) => slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const generatedTitle = articleId ? slugToTitle(articleId) : "Himalayan Lore";
  const title = articleMeta?.title || generatedTitle;
  const excerpt = articleMeta?.excerpt || `A complete guide and deep dive into the spiritual ecology and unique features of ${hId}.`;
  
  return {
    title: title,
    category: "Geo-Spiritual Intelligence",
    readTime: "5 min read",
    date: "June 2026",
    image: "https://images.unsplash.com/photo-1544120190-275d3122c366?auto=format&fit=crop&w=2000&q=80",
    author: "Soul Expeditions Auto-Intelligence",
    authorRole: "Himalayan Archivist",
    content: [
      {
        type: "paragraph",
        text: `${excerpt} The journey into ${hId} is more than a physical transit; it is a deep immersion into an ecosystem where myth, ecology, and human endurance intertwine. Through the lens of '${title}', we see precisely how the Parvati Valley has preserved its ancient rhythm despite the accelerating modern world.`
      },
      {
        type: "heading",
        text: `The Spiritual Ecosystem of ${hId}`
      },
      {
        type: "paragraph",
        text: `Nestled deep within the vastness of the Great Himalayan National Park's buffer zone, ${hId} acts as a geographic focal point for transformation. For centuries, wandering ascetics, shepherds, and now modern digital nomads have all found themselves converging on these very slopes. The architecture here tells a story of survival: thick stone foundations topped with intricate Kath-Kuni woodwork, designed to breathe through the summer and lock in warmth during the relentless winter snows. When analyzing '${title}', one is essentially unpacking a layer of this complex survival strategy.`
      },
      {
        type: "paragraph",
        text: "Immersing yourself in the high-altitude tranquility of the Parvati Valley is an experience that transcends typical tourism. The whispering pines, the majestic snow-capped peaks, and the ancient trails carved by local shepherds offer a profound reset for the wandering soul. Here, time loses its urgency, replaced by the deep, rhythmic pulse of the Himalayas. Every sunrise brings a fresh canvas of gold across the glaciers, while the crisp, unpolluted air cleanses the mind of urban clutter. Travelers who venture this far into the mountains often report a profound sense of clarity and connection to the earth, a testament to the raw, untamed energy of these ancient lands."
      },
      {
        type: "quote",
        text: `The true essence of ${hId} is not found on a map, but in the silence between the falling cedar needles.`,
        author: "Himalayan Proverb"
      },
      {
        type: "heading",
        text: "Sustainable Exploration Dynamics"
      },
      {
        type: "paragraph",
        text: `Understanding '${title}' also requires a deep commitment to sustainable interaction. The delicate balance of ${hId} is under unprecedented pressure. Water sources that flow pure from the glacial melt must remain untainted. Local traditions, which may seem obscure to the urban eye, serve as vital social glue. As visitors, our presence alters the micro-economy, pushing it away from subsistence agriculture toward service orientation.`
      },
      {
        type: "paragraph",
        text: "Beyond the physical beauty, engaging with the local culture and ecosystem demands a respectful, sustainable approach. The remote hamlets of this region are fragile sanctuaries, preserving centuries-old traditions, unique architectural forms, and deep-rooted spiritual beliefs. As you traverse these paths, practicing 'leave no trace' principles and opting for guided experiences ensures that your journey contributes positively to the community. Whether you are seeking a rigorous physical challenge on the high passes, or a quiet corner to meditate and practice yoga, the valley holds endless transformative potential for those who arrive with an open heart and a respectful stride."
      },
      {
        type: "list",
        title: "Ethical Integration Protocols",
        items: [
          "Zero-Trace Policy: Carry back out everything that comes into the valley with you. The alpine soil takes centuries to process synthetic waste.",
          "Cultural Humility: Observe before acting. Request permission before photographing people or sacred shrines.",
          "Local Economy: Support native artisans, cafes, and homestays to ensure the financial benefits of your visit remain within the community."
        ]
      },
      {
        type: "paragraph",
        text: `As we conclude this briefing on '${title}', remember that ${hId} will test you, physically and mentally. The steep ascents, the unpredictable weather, and the sheer scale of the mountains demand respect. But it is precisely this challenge that makes the profound sense of peace upon reaching your destination so transformative. Let this intelligence guide you not just in navigation, but in cultivation of extreme presence.`
      },
      {
        type: "internal-links"
      }
    ]
  };
};

export default function ArticleDetail() {
  const { hamletId, articleId } = useParams();
  const navigate = useNavigate();
  
  // Find article content
  let article = ARTICLE_CONTENT[articleId || ''];
  
  if (!article) {
    const hamletMeta = hamletId ? HAMLET_DETAILS[hamletId.toLowerCase()] : null;
    const articleMeta = hamletMeta?.articles?.find((a: any) => a.link === articleId);
    article = generateContent(hamletId || 'unknown', articleMeta, articleId || '');
  }

  return (
    <div className="min-h-screen bg-cream selection:bg-terracotta selection:text-white">
      <SEO 
        title={article.title} 
        description={article.content[0]?.text || "Soulful Himalayan Intelligence"} 
        image={article.image}
        type="article"
      />
      
      {/* Hero Section */}
      <header className="relative h-[80vh] w-full overflow-hidden">
        <div className="absolute top-[80px] right-6 z-10 flex gap-2">
          <Button variant="ghost" className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center p-0 text-white shadow-lg shadow-black/10 hover:bg-white/40">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2 }}
          src={article.image} 
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/10 to-black/20" />
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-terracotta text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-terracotta/20"
            >
              <BookOpen className="h-4 w-4" /> {article.category}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-8xl font-heading font-black text-forest italic tracking-tighter uppercase leading-[0.85] [text-shadow:_0_10px_30px_rgb(255_255_255_/_40%)]"
            >
              {article.title}
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-6"
            >
              {article.author && (
                <div className="flex items-center gap-3 pr-8 border-r border-forest/10">
                  <div className="h-10 w-10 rounded-full bg-forest flex items-center justify-center text-white font-black text-xs">
                    {article.author.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-forest/40 uppercase tracking-widest leading-none mb-1">Intelligence By</p>
                    <p className="text-sm font-bold text-forest">{article.author}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-6 text-forest/40 text-[9px] font-black uppercase tracking-[0.2em]">
                <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-terracotta" /> {article.readTime}</span>
                <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-terracotta" /> {article.date}</span>
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-terracotta" /> {hamletId}</span>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Content Section */}
      <article className="max-w-3xl mx-auto px-8 py-24 md:py-32">
        <div className="space-y-12">
          {article.content.map((block: any, index: number) => {
            if (block.type === 'paragraph') {
              // Apply drop cap only to the very first paragraph in the article
              const isFirstParagraph = index === 0 || (index > 0 && article.content.findIndex((b: any) => b.type === 'paragraph') === index);
              
              return (
                <motion.p 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={cn(
                    "text-lg md:text-xl text-forest/80 leading-relaxed font-sans font-medium",
                    isFirstParagraph && "first-letter:text-6xl first-letter:float-left first-letter:mr-4 first-letter:mt-2 first-letter:font-serif first-letter:font-black text-forest first-letter:text-terracotta"
                  )}
                >
                  {block.text}
                </motion.p>
              );
            }
            if (block.type === 'quote') {
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative my-16 py-12 px-10 md:px-16 border-l-4 border-terracotta bg-white shadow-2xl shadow-forest/5 rounded-r-3xl"
                >
                  <Sparkles className="absolute top-8 right-8 h-8 w-8 text-terracotta/20" />
                  <p className="text-2xl md:text-3xl lg:text-4xl font-serif font-black text-forest leading-snug italic tracking-tight mb-6">
                    "{block.text}"
                  </p>
                  {block.author && (
                    <cite className="not-italic flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-forest/50">
                      <div className="w-8 h-[2px] bg-terracotta rounded-full"></div>
                      {block.author}
                    </cite>
                  )}
                </motion.div>
              );
            }
            if (block.type === 'heading') {
              return (
                <motion.h2 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-5xl font-heading font-black text-forest tracking-tight mt-20 mb-8"
                >
                  {block.text}
                </motion.h2>
              );
            }
            if (block.type === 'list') {
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-10 md:p-14 rounded-3xl shadow-xl shadow-forest/5 border border-forest/5 space-y-8 my-16"
                >
                  <div className="flex items-center gap-4">
                    <Zap className="h-6 w-6 text-terracotta" />
                    <h3 className="text-xl font-heading font-bold text-forest uppercase tracking-widest">{block.title}</h3>
                  </div>
                  <ul className="grid grid-cols-1 gap-6">
                    {block.items.map((item: string, i: number) => {
                      const [label, ...content] = item.split(': ');
                      return (
                        <li key={i} className="flex gap-6 group">
                          <div className="h-8 w-8 rounded-full bg-forest/5 flex items-center justify-center text-forest group-hover:bg-terracotta group-hover:text-white transition-all shrink-0 font-bold text-xs">
                            0{i + 1}
                          </div>
                          <div className="space-y-1">
                            {content.length > 0 ? (
                              <>
                                <span className="block text-[10px] font-black uppercase tracking-widest text-terracotta mb-1">{label}</span>
                                <span className="block text-lg text-forest/70 font-medium leading-relaxed">{content.join(': ')}</span>
                              </>
                            ) : (
                              <span className="block text-lg text-forest/70 font-medium leading-relaxed">{item}</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              );
            }
            if (block.type === 'tour-link') {
              const allPackages = [
                ...DEFAULT_TOURS.map(p => ({ ...p, type: 'tour' })),
                ...DEFAULT_TREKKS.map(p => ({ ...p, type: 'trekk' })),
                ...DEFAULT_SHOP.map(p => ({ ...p, type: 'shop' })),
                ...DEFAULT_YOGA.map(p => ({ ...p, type: 'yoga' })),
                ...DEFAULT_MEDITATION.map(p => ({ ...p, type: 'meditation' })),
                ...DEFAULT_ADVENTURE.map(p => ({ ...p, type: 'adventure' })),
                ...DEFAULT_WFH.map(p => ({ ...p, type: 'wfh' })),
                ...DEFAULT_SERVICES.map(p => ({ ...p, type: 'service' }))
              ];
              const pkg: any = allPackages.find((p: any) => p.id === block.tourId);
              
              if (!pkg) {
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-center my-12"
                  >
                    <Link to={block.url}>
                      <Button className="bg-forest text-cream hover:bg-terracotta font-black uppercase tracking-widest px-8 py-6 rounded-full shadow-xl transition-all hover:scale-105">
                        Explore {block.tourTitle} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="group relative h-[400px] md:h-[450px] rounded-[2rem] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.08)] cursor-pointer max-w-lg mx-auto my-16"
                >
                  <Link to={block.url} className="absolute inset-0 z-30" />
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  <img 
                    src={pkg.image || pkg.coverImage || 'https://images.unsplash.com/photo-1621425444159-5f17426db33e?q=80&w=800'} 
                    alt={pkg.name || pkg.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="bg-white/10 backdrop-blur-xl w-10 h-10 rounded-xl flex items-center justify-center border border-white/20">
                        <Star className="text-terracotta h-5 w-5" />
                      </div>
                      <span className="text-white/80 font-bold uppercase tracking-widest text-[9px] bg-forest/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">{pkg.type}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-montserrat font-extrabold text-white mb-3 line-clamp-2 leading-tight">{pkg.name || pkg.title}</h3>
                    <p className="text-white/70 text-xs md:text-sm mb-6 line-clamp-2 leading-relaxed">
                      {pkg.description || pkg.shortDescription || 'Experience the magic of the Himalayas with this specially curated package.'}
                    </p>
                    <div className="group/btn flex items-center gap-3 text-white font-bold uppercase text-[10px] tracking-widest">
                      <span className="w-8 h-[1px] bg-terracotta group-hover/btn:w-16 transition-all duration-500" />
                      Explore Details
                    </div>
                  </div>
                </motion.div>
              );
            }
            if (block.type === 'internal-links') {
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="my-16 p-8 md:p-12 bg-white rounded-3xl shadow-xl shadow-forest/5 border border-forest/10"
                >
                  <h3 className="text-2xl font-serif font-black text-forest mb-6 italic">Essential Resources & Explorations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link to="/tours" className="flex items-center gap-3 p-4 rounded-xl hover:bg-forest/5 transition-colors group">
                      <Compass className="h-5 w-5 text-terracotta group-hover:rotate-45 transition-transform" />
                      <span className="font-bold text-forest">Explore All Packages</span>
                    </Link>
                    <Link to="/gallery" className="flex items-center gap-3 p-4 rounded-xl hover:bg-forest/5 transition-colors group">
                      <Sparkles className="h-5 w-5 text-terracotta group-hover:rotate-12 transition-transform" />
                      <span className="font-bold text-forest">Visual Journey (Gallery)</span>
                    </Link>
                    <Link to="/about" className="flex items-center gap-3 p-4 rounded-xl hover:bg-forest/5 transition-colors group">
                      <History className="h-5 w-5 text-terracotta group-hover:-rotate-12 transition-transform" />
                      <span className="font-bold text-forest">Our Philosophy</span>
                    </Link>
                    <Link to="/contact" className="flex items-center gap-3 p-4 rounded-xl hover:bg-forest/5 transition-colors group">
                      <MapPin className="h-5 w-5 text-terracotta group-hover:animate-bounce transition-transform" />
                      <span className="font-bold text-forest">Connect With Us</span>
                    </Link>
                  </div>
                </motion.div>
              );
            }
            if (block.type === 'image') {
              return null;
            }
            return null;
          })}
        </div>

        {/* Related Global Intelligence */}
        <div className="mt-40 space-y-12">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-forest/5 flex items-center justify-center text-forest">
              <Star className="h-5 w-5" />
            </div>
            <h3 className="text-2xl font-heading font-black text-forest uppercase tracking-tighter">Related Intelligence</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(ARTICLE_CONTENT)
              .filter(([id]) => id !== articleId)
              .slice(0, 2)
              .map(([id, related]: [string, any], idx: number) => (
                <Link 
                  key={id} 
                  to={`/hamlet/${hamletId}/article/${id}`}
                  className="group block space-y-4"
                >
                  <div className="aspect-[16/9] rounded-[2.5rem] overflow-hidden bg-forest/5 relative">
                    <img 
                      src={related.image} 
                      alt={related.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-forest transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <ArrowRight className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-terracotta uppercase tracking-widest">{related.category}</span>
                    <h4 className="text-xl font-heading font-bold text-forest leading-tight group-hover:text-terracotta transition-colors">{related.title}</h4>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* Strategic Footer */}
        <footer className="mt-40 pt-20 border-t border-forest/10">
          <div className="bg-forest rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-terracotta/20 rounded-full blur-[100px] -mr-20 -mt-20" />
            <div className="relative z-10 space-y-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Manifest Your Journey</span>
              <h3 className="text-4xl md:text-6xl font-heading font-black italic tracking-tighter leading-none">
                Ready to explore <br /> {hamletId}?
              </h3>
              <p className="text-white/60 max-w-xl font-medium">
                Our Soul Guides are ready to orchestrate your logical and spiritual flow. Book a curated expedition today.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild className="bg-white text-forest hover:bg-terracotta hover:text-white rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px]">
                  <Link to="/booking">Check Availability</Link>
                </Button>
                <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px]">
                  <Link to="/tours">View All Tours</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-8 py-10 px-6 bg-stone-100 rounded-[2rem]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-forest flex items-center justify-center text-white">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-forest/30 uppercase tracking-widest">Regional Intelligence</p>
                <p className="font-heading font-bold text-forest">The Soul Himalaya Research Hub</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Link to="/gallery" className="text-[10px] font-black uppercase tracking-widest text-forest/40 hover:text-terracotta transition-colors">Visual Archive</Link>
              <Link to="/guide" className="text-[10px] font-black uppercase tracking-widest text-forest/40 hover:text-terracotta transition-colors">Safety Protocols</Link>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
