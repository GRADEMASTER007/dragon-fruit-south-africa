export type Product = {
  sku: string;
  name: string;
  price: number;
  stock: number;
  category: string;
};

export const PRODUCTS: Product[] = [
  // SWEET WHITE CRYSTAL
  { sku: "FARM-1000-SW", name: "SWEET-WHITE-CRYSTAL™ — 1000 Plant Tray", price: 45000, stock: 100, category: "Sweet White Crystal" },
  { sku: "FARM-900-SW", name: "SWEET-WHITE-CRYSTAL™ — 900 Plant Tray", price: 41400, stock: 100, category: "Sweet White Crystal" },
  { sku: "FARM-800-SW", name: "SWEET-WHITE-CRYSTAL™ — 800 Plant Tray", price: 37600, stock: 100, category: "Sweet White Crystal" },
  { sku: "FARM-700-SW", name: "SWEET-WHITE-CRYSTAL™ — 700 Plant Tray", price: 33600, stock: 100, category: "Sweet White Crystal" },
  { sku: "FARM-600-SW", name: "SWEET-WHITE-CRYSTAL™ — 600 Plant Tray", price: 29400, stock: 100, category: "Sweet White Crystal" },
  { sku: "FARM-500-SW", name: "SWEET-WHITE-CRYSTAL™ — 500 Plant Tray", price: 25000, stock: 100, category: "Sweet White Crystal" },
  { sku: "FARM-400-SW", name: "SWEET-WHITE-CRYSTAL™ — 400 Plant Tray", price: 20400, stock: 100, category: "Sweet White Crystal" },
  { sku: "FARM-300-SW", name: "SWEET-WHITE-CRYSTAL™ — 300 Plant Tray", price: 15600, stock: 100, category: "Sweet White Crystal" },
  { sku: "FARM-250-SW", name: "SWEET-WHITE-CRYSTAL™ — 250 Plant Tray", price: 13250, stock: 100, category: "Sweet White Crystal" },
  { sku: "FARM-200-SW", name: "SWEET-WHITE-CRYSTAL™ — 200 Plant Tray", price: 10800, stock: 100, category: "Sweet White Crystal" },
  { sku: "FARM-150-SW", name: "SWEET-WHITE-CRYSTAL™ — 150 Plant Tray", price: 8250, stock: 100, category: "Sweet White Crystal" },

  // RUBY
  { sku: "FARM-1000-RUBY", name: "RUBY™ — 1000 Plant Tray", price: 26000, stock: 100, category: "Ruby" },
  { sku: "FARM-900-RUBY", name: "RUBY™ — 900 Plant Tray", price: 24300, stock: 100, category: "Ruby" },
  { sku: "FARM-800-RUBY", name: "RUBY™ — 800 Plant Tray", price: 22400, stock: 100, category: "Ruby" },
  { sku: "FARM-700-RUBY", name: "RUBY™ — 700 Plant Tray", price: 20300, stock: 100, category: "Ruby" },
  { sku: "FARM-600-RUBY", name: "RUBY™ — 600 Plant Tray", price: 18000, stock: 100, category: "Ruby" },
  { sku: "FARM-500-RUBY", name: "RUBY™ — 500 Plant Tray", price: 16000, stock: 100, category: "Ruby" },
  { sku: "FARM-400-RUBY", name: "RUBY™ — 400 Plant Tray", price: 13200, stock: 100, category: "Ruby" },
  { sku: "FARM-300-RUBY", name: "RUBY™ — 300 Plant Tray", price: 10200, stock: 100, category: "Ruby" },
  { sku: "FARM-250-RUBY", name: "RUBY™ — 250 Plant Tray", price: 9000, stock: 100, category: "Ruby" },
  { sku: "FARM-200-RUBY", name: "RUBY™ — 200 Plant Tray", price: 7600, stock: 100, category: "Ruby" },
  { sku: "FARM-150-RUBY", name: "RUBY™ — 150 Plant Tray", price: 6000, stock: 100, category: "Ruby" },
  { sku: "FARM-100-RUBY", name: "RUBY™ — 100 Plant Tray", price: 4300, stock: 100, category: "Ruby" },
  { sku: "FARM-050-RUBY", name: "RUBY™ — 50 Plant Tray", price: 2400, stock: 100, category: "Ruby" },

  // Black Dragon Africana Hybrid
  { sku: "BDF-AH-600TRAY", name: "Black Dragon Fruit Africana Hybrid — 600 Plant Tray", price: 48000, stock: 100, category: "Black Dragon" },
  { sku: "BDF-AH-1000PK", name: "Black Dragon Fruit Africana Hybrid — 1000 Plant Tray", price: 78000, stock: 10, category: "Black Dragon" },
  { sku: "BDF-AH-2026-SA", name: "Black Dragon Fruit Africana Hybrid (Premium Rare Variety)", price: 4500, stock: 100, category: "Black Dragon" },

  // Sweet White commercial packs (extras)
  { sku: "DF-SW-600PK", name: "Sweet White Dragon Fruit Plants — 600 Plant Tray", price: 18000, stock: 10, category: "Sweet White Crystal" },
  { sku: "DF-SW-1000PK", name: "Sweet White Dragon Fruit Plants — 1000 Plant Tray", price: 28000, stock: 10, category: "Sweet White Crystal" },

  // Business plans / resources
  { sku: "DF-BP-COMBO-1500", name: "Complete Dragon Fruit Business Plan Combo", price: 1500, stock: 10, category: "Business Resources" },
  { sku: "BP-1HA-001", name: "1 Hectare Dragon Fruit Business Plan", price: 1500, stock: 999, category: "Business Resources" },
  { sku: "BP-2HA-001", name: "2 Hectare Dragon Fruit Business Plan", price: 1500, stock: 999, category: "Business Resources" },
  { sku: "BP-3HA-001", name: "3 Hectare Dragon Fruit Business Plan", price: 1500, stock: 999, category: "Business Resources" },
  { sku: "BP-5HA-001", name: "5 Hectare Dragon Fruit Business Plan", price: 1500, stock: 999, category: "Business Resources" },
  { sku: "FM-FUNDING-001", name: "Agricultural Funding Manual & Contact Directory", price: 250, stock: 999, category: "Business Resources" },

  // Services
  { sku: "DFSA-1ON1-SVC-107", name: "One-on-One Consultation", price: 250, stock: 1000, category: "Consultation" },
  { sku: "DFSA-VIDEO-SVC-108", name: "Video Consultation", price: 250, stock: 1000, category: "Consultation" },
  { sku: "DFSA-VISIT-SVC-109", name: "Farm Visit & Consultation Package", price: 850, stock: 1000, category: "Consultation" },
  { sku: "DFSA-GENETICS-SVC-110", name: "Premium Genetics Consultation", price: 850, stock: 1000, category: "Consultation" },
  { sku: "DFSA-SETUP-SVC-111", name: "Farm Setup Consulting Package", price: 1850, stock: 1000, category: "Consultation" },
  { sku: "DFSA-ROOT-SVC-106", name: "Cutting Rooting Service (per plant)", price: 30, stock: 1000, category: "Services" },

  // Membership
  { sku: "DFSA-MEM-1M-101", name: "Dragon Fruit Association Membership (1 Month)", price: 3000, stock: 100, category: "Membership" },
  { sku: "DFSA-MEM-3M-102", name: "Dragon Fruit Association Membership (3 Months)", price: 6000, stock: 100, category: "Membership" },
  { sku: "DFSA-MEM-6M-103", name: "Dragon Fruit Association Membership (6 Months)", price: 12000, stock: 100, category: "Membership" },
  { sku: "DFSA-MEM-12M-104", name: "Dragon Fruit Association Membership (12 Months)", price: 25000, stock: 100, category: "Membership" },

  // Purple Haze / Zamorano / Golden Israel commercial trays
  { sku: "DF-1000PH-095", name: "Purple Haze — 1000 Plant Tray", price: 45000, stock: 10, category: "Purple Haze" },
  { sku: "DF-600PH-094", name: "Purple Haze — 600 Plant Tray", price: 32000, stock: 10, category: "Purple Haze" },
  { sku: "DF-150PH-093", name: "Purple Haze — 150 Plant Tray", price: 15000, stock: 10, category: "Purple Haze" },
  { sku: "DF-600ZM-097", name: "Zamorano — 600 Plant Tray", price: 18000, stock: 10, category: "Zamorano" },
  { sku: "DF-1000ZM-098", name: "Zamorano — 1000 Plant Tray", price: 23000, stock: 10, category: "Zamorano" },
  { sku: "DF-150ZM-096", name: "Zamorano — 150 Plant Tray", price: 15000, stock: 10, category: "Zamorano" },
  { sku: "DF-1000GI-100", name: "Golden (Israel) — 1000 Plant Tray", price: 78000, stock: 10, category: "Golden Israel" },
  { sku: "DF-600GI-099", name: "Golden (Israel) — 600 Plant Tray", price: 45000, stock: 10, category: "Golden Israel" },
  { sku: "DF-150RB-090", name: "Ruby — 150 Plant Tray (Retail)", price: 5700, stock: 10, category: "Ruby" },
  { sku: "DF-600RB-091", name: "Ruby — 600 Plant Tray (Retail)", price: 18000, stock: 10, category: "Ruby" },
  { sku: "DF-1000RB-092", name: "Ruby — 1000 Plant Tray (Retail)", price: 28000, stock: 10, category: "Ruby" },

  // Cuttings & Cultivars
  { sku: "DF-BDDFC-085", name: "Black Dragon Dark Flesh Cutting", price: 1799.97, stock: 10, category: "Cuttings" },
  { sku: "DF-PHC-087", name: "Purple Haze Cutting", price: 400, stock: 10, category: "Cuttings" },
  { sku: "DF-RRPFC-086", name: "Ruby Red Purple Flesh Cutting", price: 350, stock: 40, category: "Cuttings" },
  { sku: "DF-WORTH-VAR-CUT", name: "Worth Variegated Dragon Fruit — Unrooted Cutting", price: 1000, stock: 10, category: "Cuttings" },
  { sku: "DF-LL-VAR-CUT", name: "Lemon Lime Variegated Dragon Fruit — Unrooted Cutting", price: 1000, stock: 10, category: "Cuttings" },

  // Rare variegates & specials
  { sku: "DF-GV-069", name: "Golden Variegated", price: 3000, stock: 10, category: "Rare Variegates" },
  { sku: "DF-LV-068", name: "Lime Variegated", price: 1500, stock: 10, category: "Rare Variegates" },
  { sku: "DF-GZ-073", name: "Godzilla", price: 2800, stock: 10, category: "Rare Variegates" },
  { sku: "DF-YG-064", name: "Yellow Gold", price: 3500, stock: 10, category: "Yellow" },
  { sku: "DF-AY-057", name: "Amazon Yellow", price: 3000, stock: 10, category: "Yellow" },
  { sku: "DF-PG-065", name: "Pure Gold", price: 2000, stock: 10, category: "Yellow" },
  { sku: "DF-BD-052", name: "Black Dragon", price: 850, stock: 10, category: "Cultivars" },
  { sku: "DF-LVR-018", name: "La Verne Red", price: 1000, stock: 10, category: "Cultivars" },
  { sku: "DF-RGC-072", name: "Red Green Chimera", price: 1000, stock: 10, category: "Cultivars" },

  // Standard cultivars (R 400 tier)
  ...[
    ["DF-LS-083", "Lisa"], ["DF-RF-080", "Rixford"], ["DF-SS-078", "S. Setaceus"],
    ["DF-AX-079", "Ax"], ["DF-BR-082", "Bruni"], ["DF-ZM-081", "Zamorano"],
    ["DF-CC-077", "Cosmic Charlie"], ["DF-TP-075", "Townsend Pink"], ["DF-OR-076", "Orejona"],
    ["DF-PM-056", "Purple Megalanthus"], ["DF-SE-061", "Sin Espinas"], ["DF-PT-045", "Paul Thompson"],
    ["DF-TK-053", "Thick King"], ["DF-SK-044", "Seoul Kitchen"], ["DF-HR-047", "Hawaiian Red"],
    ["DF-VR-048", "Valdivia Roja"], ["DF-AP-054", "Arizona Purple"], ["DF-CD-050", "Condor"],
    ["DF-AR-051", "Armando"], ["DF-RJ-043", "Red Jaina"], ["DF-TR-049", "Tricia"],
    ["DF-BM-031", "Bloody Mary"], ["DF-MR-039", "Maria Rosa"], ["DF-HC-035", "Halleys Comet"],
    ["DF-CM-040", "Connie Mayer"], ["DF-DL-034", "Delight"], ["DF-LA-037", "Lake Atitlan"],
    ["DF-DS-032", "Dark Star"], ["DF-MK-038", "Makisupa"], ["DF-PG-041", "Physical Graffiti"],
    ["DF-PH-042", "Purple Haze"], ["DF-HP-036", "Harpua"], ["DF-DB-033", "David Bowie"],
    ["DF-A2-023", "Asunta 2"], ["DF-SDS8-030", "Sugar Dragon S8"], ["DF-A1-022", "Asunta 1"],
    ["DF-A5-025", "Asunta 5"], ["DF-VC-029", "Voodoo Child"], ["DF-AB-028", "American Beauty"],
    ["DF-M1-026", "M1"], ["DF-KK-021", "King Kong"], ["DF-RC-027", "Red Crystal"],
    ["DF-BH-020", "Bahamut"], ["DF-SS-019", "Super Shenro"], ["DF-A3-024", "Asunta 3"],
    ["DF-BR-012", "Boreal Red"], ["DF-TR-009", "Trish Red"], ["DF-ZR-016", "Zorro"],
    ["DF-BRH-008", "Bundy Red Hybrid"], ["DF-HB-011", "Hells Boy"], ["DF-BC-013", "Baby Cerrado"],
    ["DF-OC-014", "Ocamponis"], ["DF-WC-001", "White Crystal"], ["DF-WS-004", "White Supreme"],
    ["DF-WSP-006", "White Sapphire"], ["DF-WKH-005", "White King Hollywood"], ["DF-AS-003", "Alice Sweet"],
    ["DF-HT-002", "Houghton"],
  ].map(([sku, name]) => ({ sku, name, price: 400, stock: 10, category: "Cultivars" })),

  // R 600 tier
  ...[
    ["DF-CY-058", "Colombian Yellow"], ["DF-DK-066", "Desert King"], ["DF-RB-067", "Rainbow"],
    ["DF-CH-074", "Chameleon"], ["DF-DP-015", "Desert Princess"],
    ["DF-VGSRF-010", "Vietnam Green Skin Red Flesh"], ["DF-EB-017", "Edgars Baby"],
  ].map(([sku, name]) => ({ sku, name, price: 600, stock: 10, category: "Cultivars" })),

  // R 800 / R 1000 misc
  { sku: "DF-PY-059", name: "Peruvian Yellow", price: 800, stock: 10, category: "Yellow" },
  { sku: "DF-EP-060", name: "Ecuador Palora", price: 800, stock: 10, category: "Yellow" },
  { sku: "DF-YA-062", name: "Yellow Amarillo", price: 1000, stock: 10, category: "Yellow" },
  { sku: "DF-YP-063", name: "Yellow Phalora", price: 1000, stock: 10, category: "Yellow" },
  { sku: "DF-RR-055", name: "Ruby Red", price: 350, stock: 10, category: "Cultivars" },
  { sku: "DF-VJ-046", name: "Vietnamese Jaina", price: 320, stock: 50, category: "Cultivars" },
];

export const CATEGORIES = Array.from(new Set(PRODUCTS.map((p) => p.category)));

export const formatZAR = (n: number) =>
  "R " + n.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
