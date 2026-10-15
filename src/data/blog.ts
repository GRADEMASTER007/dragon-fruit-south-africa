import imgStart from "@/assets/blog/start-a-farm.jpg";
import imgCultivars from "@/assets/blog/cultivars.jpg";
import imgEconomics from "@/assets/blog/economics.jpg";
import imgTrellis from "@/assets/blog/trellis.jpg";
import imgCuttings from "@/assets/blog/cuttings.jpg";
import imgIrrigation from "@/assets/blog/irrigation.jpg";
import imgPests from "@/assets/blog/pests.jpg";
import imgHarvest from "@/assets/blog/harvest.jpg";
import imgExport from "@/assets/blog/export.jpg";
import imgFuture from "@/assets/blog/future.jpg";

export type BlogSection = { heading?: string; paragraphs: string[]; bullets?: string[] };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  imageAlt: string;
  sections: BlogSection[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-start-a-dragon-fruit-farm-in-south-africa",
    title: "How to Start a Dragon Fruit Farm in South Africa",
    excerpt:
      "From soil preparation to your first sale — a practical, season-by-season roadmap for new South African dragon fruit growers.",
    category: "Getting Started",
    date: "2026-09-02",
    readTime: "9 min read",
    image: imgStart,
    imageAlt: "Young dragon fruit rows on red-brown African soil at sunrise",
    sections: [
      {
        heading: "Why dragon fruit, and why now",
        paragraphs: [
          "Dragon fruit (pitaya) has quietly become one of the most attractive high-value crops available to South African farmers. It thrives in our warm, low-rainfall regions, needs a fraction of the water of citrus or stone fruit, and fetches premium prices both locally and abroad. Demand for fresh pitaya keeps climbing in Europe, the Middle East and Asia, while local supermarket shelves still rely heavily on imports — a gap South African growers are perfectly placed to fill.",
          "Because the crop is a climbing cactus, it also suits marginal land that is unsuitable for traditional orchards. Rocky, well-drained slopes that would never carry a citrus tree can produce excellent dragon fruit, provided the climate is frost-free.",
        ],
      },
      {
        heading: "Choose your land and climate carefully",
        paragraphs: [
          "Dragon fruit grows best in areas with warm days, mild nights and no frost. Temperatures above 40°C can scorch stems, while frost kills young plants outright. Ideal growing regions in South Africa include parts of Limpopo, Mpumalanga, KwaZulu-Natal and the northern areas of the Eastern and Western Cape.",
          "Drainage matters more than fertility. The one thing a pitaya cactus cannot tolerate is waterlogged roots. Choose soil that drains within an hour of heavy irrigation, or plant on ridges and mounds.",
        ],
        bullets: [
          "Frost-free or very light frost only — protect young plants for the first two winters.",
          "Well-drained sandy or loamy soil with pH between 5.5 and 7.",
          "Access to at least 4,000–6,000 m³ of irrigation water per hectare per year.",
          "Labour and a market route — dragon fruit is hand-harvested and hand-graded.",
        ],
      },
      {
        heading: "Plan your orchard layout",
        paragraphs: [
          "The standard commercial layout uses concrete posts roughly 2 m tall with a cross-arm or frame on top, planted at 2–3 m in-row and 3–4 m between rows. That gives you about 830–1,100 posts per hectare, with two to four plants per post. Plants spiral up the post and hang over the frame into an umbrella shape that carries the crop.",
          "Install irrigation before planting: two dripline laterals per row is the common minimum, plus mulch to conserve moisture and suppress weeds.",
        ],
      },
      {
        heading: "Buy the right planting material",
        paragraphs: [
          "The single biggest mistake new growers make is planting unverified material. Seedling fruit quality is a lottery — cuttings and plants from a reputable nursery are true to type, vigorous and disease-screened. At DFSA we supply hardened, farm-ready plants in trays and commercial packs, each traceable to a named cultivar with known yield and Brix data.",
          "Expect first light harvests 14–18 months after planting, with full commercial production from year three to four. Plan your cash flow accordingly: the first two seasons are for establishment, the third pays the bills.",
        ],
      },
      {
        heading: "Your first 24 months, month by month",
        paragraphs: [
          "Months 1–3: soil preparation, trellis and irrigation installation, planting. Months 4–12: training stems onto posts, weekly monitoring, feeding little and often. Months 13–18: first flower flushes and light fruit set — remove weak fruit and let the canopy strengthen. Months 19–24: first meaningful harvests and your first market relationships.",
          "Keep simple records from day one: irrigation volumes, fertiliser applications, flowering dates and yields per post. Those numbers become your farm's most valuable asset when you seek funding or scale up.",
        ],
      },
    ],
  },
  {
    slug: "best-dragon-fruit-cultivars-for-commercial-growers",
    title: "The Best Dragon Fruit Cultivars for Commercial Growers",
    excerpt:
      "Not all pitaya is equal. We compare white, red and rare hybrids on yield, Brix, shelf life and market demand — so you plant what sells.",
    category: "Cultivars",
    date: "2026-09-12",
    readTime: "8 min read",
    image: imgCultivars,
    imageAlt: "Dew-covered magenta dragon fruit on dark green vines",
    sections: [
      {
        heading: "Cultivar choice is a market decision",
        paragraphs: [
          "A dragon fruit farm is a 15-to-20-year commitment. The cultivar you plant today determines your yields, your cold-chain costs and — most importantly — whether buyers actually want your fruit. Choose based on data: Brix (sweetness), flesh colour, fruit weight, skin durability and shipping performance.",
        ],
      },
      {
        heading: "White-flesh types: the reliable workhorses",
        paragraphs: [
          "White-flesh cultivars such as Sweet-White-Crystal™ set the standard for commercial reliability. They crop heavily, pollinate well with hand or bee assistance, and their clean, sweet flavour profile suits both local retail and export. Brix readings of 16–19 are achievable in good years.",
          "Their weakness is shelf life: white flesh bruises slightly faster than red types, so pack carefully and keep harvest-to-cold-chain times short.",
        ],
      },
      {
        heading: "Red-flesh types: the premium shelf",
        paragraphs: [
          "Deep red-flesh cultivars like RUBY™ deliver striking colour, high antioxidants and excellent shelf life — the traits that win shelf space in export markets. Flesh colour also holds through juice, powder and dried-fruit processing, opening value-add channels beyond the fresh market.",
          "Red types generally benefit from cross-pollination with a second cultivar planted nearby, so plan your block layout accordingly.",
        ],
      },
      {
        heading: "Rare hybrids: the head-turners",
        paragraphs: [
          "Africa-adapted hybrids such as the Black Dragon Africana Hybrid were selected for exceptional Brix and thick, durable skin. Volumes are still limited, which keeps prices high — ideal for growers who want a differentiated, high-margin product line rather than commodity volumes.",
        ],
      },
      {
        heading: "Our planting recommendation",
        paragraphs: [
          "For most commercial blocks we recommend a portfolio: 60% proven white or red workhorse, 25% premium export type, 15% rare hybrid to command top prices and learn the market. Plant at least two cultivars for pollination insurance, and always buy from a nursery that can show you trial data, not just photos.",
        ],
      },
    ],
  },
  {
    slug: "dragon-fruit-farming-economics-south-africa",
    title: "Dragon Fruit Farming Economics: What a Hectare Really Earns",
    excerpt:
      "Establishment costs, yield curves and realistic revenue per hectare for South African dragon fruit — with the numbers growers actually ask us for.",
    category: "Business",
    date: "2026-09-20",
    readTime: "10 min read",
    image: imgEconomics,
    imageAlt: "Wooden crates of freshly harvested dragon fruit on a farm trailer",
    sections: [
      {
        heading: "What it costs to establish a hectare",
        paragraphs: [
          "Establishment is where most of your capital goes. A typical commercial hectare needs 830–1,100 concrete posts, cross-arms, dripline, mulch and roughly 1,600–2,200 plants. Depending on your region and how much work you do yourself, expect establishment costs in the low hundreds of thousands of rand per hectare, spread mostly across the first year.",
          "The plants themselves are the cheapest part of the system to over-specify and the most expensive to get wrong. Cheap, unverified material can cost you two seasons; certified plants pay for themselves in fruit type and vigour.",
        ],
      },
      {
        heading: "The yield curve",
        paragraphs: [
          "Dragon fruit does not pay in year one — and planning for that is what separates successful farms from failed ones.",
        ],
        bullets: [
          "Year 1: establishment, no commercial harvest.",
          "Year 2: light harvest, roughly 3–5 t/ha on strong blocks.",
          "Year 3–4: climb toward 10–15 t/ha.",
          "Year 5 onward: mature yields of 15–25+ t/ha under good management.",
        ],
      },
      {
        heading: "Where the revenue comes from",
        paragraphs: [
          "Fresh fruit is the anchor, but not the only income. Grade-outs become juice, purée, dried fruit and powder — all of which extend shelf life and open food-service and wellness channels. Later, propagating your own proven cultivars into planting material for other growers can become a second, highly profitable business line.",
          "Local retail prices for quality pitaya have consistently sat well above imported equivalents, and export windows into Europe and the Middle East reward fruit that survives the cold chain with premium grades.",
        ],
      },
      {
        heading: "The numbers that decide profitability",
        paragraphs: [
          "Three variables dominate: your yield curve, your pack-out percentage, and your average realised price. A hectare yielding 15 t with an 85% pack-out at a mid-range price comfortably services debt; the same hectare with poor fruit type and sloppy grading struggles. That is why cultivar selection and post-harvest discipline matter more than raw hectareage.",
          "We maintain a funding manual and business-plan templates for growers approaching agricultural finance institutions — request them through our quotation form and we will include current figures.",
        ],
      },
      {
        heading: "A realistic 5-year picture",
        paragraphs: [
          "A well-run hectare in a suitable region typically moves from heavy capital outlay in year one, to break-even in year three, to strong positive cash flow from year four onward — with a productive lifespan well beyond fifteen years. The crop rewards patience, records and attention to fruit quality over quick volume.",
        ],
      },
    ],
  },
  {
    slug: "trellis-systems-and-plant-spacing",
    title: "Trellis Systems and Spacing: Getting the Structure Right",
    excerpt:
      "Posts, cross-arms, in-row spacing and plant numbers per hectare — the structural decisions that shape every harvest for the next 15 years.",
    category: "Growing",
    date: "2026-09-28",
    readTime: "7 min read",
    image: imgTrellis,
    imageAlt: "Concrete-post trellis rows supporting umbrella-shaped dragon fruit plants",
    sections: [
      {
        heading: "Why structure comes first",
        paragraphs: [
          "A dragon fruit plant is a climbing cactus that can reach 5 m if unsupported. Every commercial system exists to do one thing: get the stems up onto a frame so they cascade outward into a fruiting 'umbrella'. Build that structure correctly and pruning, harvesting and spraying become easy; build it badly and you will fight the orchard for a decade.",
        ],
      },
      {
        heading: "The standard post system",
        paragraphs: [
          "Most South African plantings use 2–2.2 m concrete posts (about 0.5 m underground), with a steel or galvanised cross-arm on top. Stems are trained up the post with soft ties and allowed to hang over the arms. Concrete is preferred over timber in wet regions: it will not rot, and it outlives the planting.",
        ],
        bullets: [
          "Post height above ground: 1.5–1.8 m for comfortable harvest access.",
          "In-row spacing: 2–3 m between posts.",
          "Between rows: 3–4 m to keep machinery and airflow working.",
          "Plants: 2–3 per post, depending on cultivar vigour.",
        ],
      },
      {
        heading: "Single-post vs. row systems",
        paragraphs: [
          "Single posts with cross-arms are the global standard for good reason: simple, strong and forgiving. Some growers use A-frame or fence-row systems for higher early density, but these demand tighter pruning discipline. For a first orchard, stay with single posts — you can always densify later.",
        ],
      },
      {
        heading: "Planting numbers per hectare",
        paragraphs: [
          "At 2.5 m × 3.5 m spacing you install about 1,140 posts and, with three plants per post, roughly 3,400 plants per hectare. At a more generous 3 m × 4 m layout, expect about 830 posts and 2,500 plants. Denser blocks come into production sooner but cost more upfront and need earlier pruning.",
          "Whatever spacing you choose, align rows with your prevailing wind and install windbreaks on exposed sites — pitaya stems snap off posts in strong wind events, especially when carrying fruit.",
        ],
      },
      {
        heading: "Build for the next 15 years",
        paragraphs: [
          "Do not economise on post concrete, cross-arm fixings or irrigation laterals — these are permanent infrastructure. The plants are replaceable; the structure is not. Overbuild once, and the orchard repays you every harvest season.",
        ],
      },
    ],
  },
  {
    slug: "growing-dragon-fruit-from-cuttings",
    title: "Growing Dragon Fruit from Cuttings vs. Nursery Plants",
    excerpt:
      "Seedlings, cuttings or nursery-raised plants? Here is the honest trade-off between cost, speed and fruit quality for each route.",
    category: "Growing",
    date: "2026-10-04",
    readTime: "6 min read",
    image: imgCuttings,
    imageAlt: "Farmers planting young dragon fruit cuttings beside concrete posts",
    sections: [
      {
        heading: "Three routes to a planted field",
        paragraphs: [
          "Every dragon fruit orchard starts from one of three things: seed, a fresh cutting, or a nursery-raised plant. They differ enormously in time, cost and certainty — and the difference compounds over the life of the orchard.",
        ],
      },
      {
        heading: "Seed: cheap, slow, unpredictable",
        paragraphs: [
          "Seed germinates readily and costs almost nothing, but seedlings are genetically mixed. Fruit size, colour, sweetness and thorniness all vary — you will not know what a seedling produces for two to three years. Seeds are for breeding and curiosity, never for a commercial block.",
        ],
      },
      {
        heading: "Fresh cuttings: fast, but quality depends on the source",
        paragraphs: [
          "A healthy 30–50 cm cutting roots within weeks and can fruit in 12–18 months. Cuttings are the fastest route — but only if the mother plant is verified. A cutting is a clone: whatever the mother plant is, your orchard becomes. Buying anonymous cuttings at a market is how growers end up with fields of mediocre, spiny, low-Brix fruit.",
        ],
        bullets: [
          "Cut at the base of a mature, healthy stem segment — never from fruiting tips.",
          "Cure (dry) cut ends for 5–7 days in shade before planting.",
          "Root in free-draining media; overwatering rots cuttings faster than drought kills them.",
        ],
      },
      {
        heading: "Nursery-raised plants: the commercial standard",
        paragraphs: [
          "Nursery plants arrive rooted, hardened and true to a named cultivar. They establish faster than raw cuttings because they already have a functioning root system, they are disease-screened, and they come with cultivar data — yield behaviour, Brix, maturity window. For commercial plantings, this is the route that protects your 15-year investment.",
          "At DFSA, plants ship hardened-off in trays and commercial packs, ready to go straight into prepared ground — with agronomic backup included.",
        ],
      },
      {
        heading: "Our recommendation",
        paragraphs: [
          "Use nursery plants for your production blocks. If you enjoy propagation, buy a few extra certified plants and root your own replacement and expansion material from year two — once you have verified the fruit, cloning your own best plants is excellent economics.",
        ],
      },
    ],
  },
  {
    slug: "water-irrigation-and-climate",
    title: "Water, Irrigation and Climate: How Much Is Enough?",
    excerpt:
      "Dragon fruit is famously drought-hardy — but yield lives and dies on irrigation discipline. Schedules, volumes and climate limits explained.",
    category: "Growing",
    date: "2026-10-09",
    readTime: "8 min read",
    image: imgIrrigation,
    imageAlt: "Drip irrigation lines watering dragon fruit plants at dusk",
    sections: [
      {
        heading: "A cactus, but not a desert crop",
        paragraphs: [
          "Pitaya stores water in its stems and survives long dry spells — but survival and production are different things. Consistent moisture during flowering and fruit development is what turns a 5 t/ha block into a 15 t/ha block. Water stress at flowering causes bud drop; water swings during fruit fill cause cracking and small fruit.",
        ],
      },
      {
        heading: "How much water a hectare needs",
        paragraphs: [
          "Mature plantings typically use 4,000–6,000 m³ per hectare per year in South African conditions, delivered as frequent, light irrigations rather than deep soakings. Roots are shallow — most sit in the top 30 cm — so long dry gaps followed by heavy irrigation do more harm than steady daily supply.",
          "Two dripline laterals per row with pressure-compensating emitters is the baseline. Install soil moisture probes or at minimum a simple tensiometer before your first summer; guessing is expensive.",
        ],
      },
      {
        heading: "A seasonal irrigation rhythm",
        paragraphs: [
          "Spring (flower initiation): increase frequency as buds form — this is the most water-sensitive window. Summer (fruit fill): maintain steady supply; never let the block dry out between pickings. Autumn: taper as harvest ends. Winter: minimal irrigation, just enough to prevent stem shrivel.",
        ],
      },
      {
        heading: "Climate limits to respect",
        paragraphs: [
          "Dragon fruit tolerates heat better than almost any fruit crop, but above 38–40°C stems sunburn and fruit colour suffers — shade cloth or inter-row mulch helps. Frost is the hard boundary: young plants die at -1 to -2°C. In marginal areas, plant on slopes where cold air drains away, keep the block free of frost pockets, and protect first-winter plants with covers.",
          "Rain is welcome but unwelcome in excess: more than about 600 mm of rain, and you must manage drainage, disease pressure and fruit splitting actively.",
        ],
      },
      {
        heading: "Quality of water matters",
        paragraphs: [
          "Test your water before planting. Pitaya tolerates moderately saline water better than many crops, but high sodium or boron accumulates in shallow-rooted systems over years. A once-off water analysis is the cheapest insurance you will ever buy.",
        ],
      },
    ],
  },
  {
    slug: "dragon-fruit-pests-and-diseases",
    title: "Pests and Diseases: A Grower's Field Guide",
    excerpt:
      "Stem canker, anthracnose, mealybug, fruit fly and sunburn — what to look for on your stems and fruit, and how to respond before it spreads.",
    category: "Growing",
    date: "2026-10-14",
    readTime: "8 min read",
    image: imgPests,
    imageAlt: "A farmer inspecting a dragon fruit stem and fruit for damage",
    sections: [
      {
        heading: "Prevention beats cure, always",
        paragraphs: [
          "Dragon fruit is a tough, low-disease crop by fruit standards — but the diseases it does get move fast in humid weather. The management principle for the whole category: keep the canopy open, keep foliage dry where possible, and scout weekly. A walk-through every week catches 90% of problems while they are still small.",
        ],
      },
      {
        heading: "Stem and fruit diseases",
        paragraphs: [
          "Anthracnose and stem canker are the two to know. Both show as sunken, orange-brown to black lesions on stems, sometimes with concentric rings; on fruit they cause rot that makes the fruit unmarketable. Both flourish in warm, wet, still air.",
        ],
        bullets: [
          "Prune for airflow — an open umbrella canopy dries fast after rain.",
          "Remove and destroy infected stems; do not compost them.",
          "Copper-based protectants and registered fungicides applied before wet spells keep pressure down.",
          "Widen row spacing and orient rows to the prevailing wind where disease pressure is chronic.",
        ],
      },
      {
        heading: "Insect pests",
        paragraphs: [
          "Mealybugs shelter in stem crevices and under fruit bracts, producing sooty mould; ants farm them, so ant control is part of mealybug control. Fruit fly can sting fruit in summer — bait stations and orchard sanitation (no fallen fruit left on the ground) are the core defences. Scale insects and mites appear in dry, dusty conditions; a strong water jet and natural predators usually hold them.",
        ],
      },
      {
        heading: "Biotic stress: sunburn, wind and rot",
        paragraphs: [
          "The most common 'disease' in new plantings is actually sunburn: bleached, corky patches on west-facing stems after heatwaves. Shade cloth over the row, or allowing modest canopy density, prevents it. Wind damage snaps stems at the tie — check ties before storm season. Root and stem rot follows waterlogging almost every time; if you see yellowing, soft basal stems, check drainage before reaching for chemicals.",
        ],
      },
      {
        heading: "Build a scouting routine",
        paragraphs: [
          "Walk every row weekly with a notebook or app. Record what you find, where, and the weather that week. After two seasons your scouting log becomes the most precise agronomic database on your farm — and the reason your block stays ahead of problems instead of chasing them.",
        ],
      },
    ],
  },
  {
    slug: "harvesting-and-post-harvest-handling",
    title: "Harvesting and Post-Harvest: Protecting Every Rand",
    excerpt:
      "Pick timing, field heat, grading and cold chain — where quality is won or lost between the vine and the buyer.",
    category: "Harvest & Market",
    date: "2026-10-18",
    readTime: "7 min read",
    image: imgHarvest,
    imageAlt: "Freshly harvested dragon fruit picked into padded bags on the farm",
    sections: [
      {
        heading: "Harvest timing is everything",
        paragraphs: [
          "Dragon fruit does not ripen further after picking — sugar stops rising the moment the fruit leaves the vine. Pick too early and the fruit is flat and pale; too late and it softens and splits in transit. The classic maturity signs: skin colour fully developed, bracts (wings) beginning to dry and fade at the tips, and roughly 30–35 days after flowering for most cultivars.",
        ],
      },
      {
        heading: "Handle the fruit like the premium product it is",
        paragraphs: [
          "The bracts and skin bruise easily. Harvest with shears, leave a short stem stub, and place fruit directly into padded picking bags or crates — never into sacks, never dropped. Keep picked fruit shaded in the field; heat is the enemy.",
        ],
        bullets: [
          "Pick in the cool of early morning wherever possible.",
          "Move fruit to the packhouse within 1–2 hours of picking.",
          "Cool the fruit as soon as possible; the cold chain starts on the farm, not at the port.",
        ],
      },
      {
        heading: "Grading decides your price",
        paragraphs: [
          "Buyers pay for uniformity. Grade by weight, colour and skin condition into at least three classes — premium export, local retail and processing. Discard or divert anything with blemish, cracking or pest damage into the processing line where it still earns. Clean, uniform presentation is worth more than any single yield improvement you can make.",
        ],
      },
      {
        heading: "Storage and shelf life",
        paragraphs: [
          "At 8–10°C and high humidity, quality pitaya stores for two to three weeks. Below about 5°C the skin chills and pitting appears — do not over-cool. Ventilated cartons, correct stacking and steady temperatures will carry export fruit to distant markets in good condition.",
          "Post-harvest discipline is also where small growers beat large ones: a two-hectare block that picks at dawn, packs by ten and cools by noon will out-deliver a careless corporate operation every season.",
        ],
      },
    ],
  },
  {
    slug: "exporting-dragon-fruit-from-south-africa",
    title: "Exporting Dragon Fruit from South Africa: The Opportunity",
    excerpt:
      "Sea and air freight windows, phytosanitary requirements and which markets pay — a plain-language guide to taking pitaya offshore.",
    category: "Harvest & Market",
    date: "2026-10-22",
    readTime: "8 min read",
    image: imgExport,
    imageAlt: "Pallets of boxed dragon fruit wrapped for export in a packhouse",
    sections: [
      {
        heading: "Why the world wants South African pitaya",
        paragraphs: [
          "Northern-hemisphere buyers face a supply gap in their own summer-offseason, and South Africa sits in the perfect position to counter-seasonally supply Europe and the Middle East. Our fruit reaches those markets when competing origins are scarce — and counter-seasonal fruit earns counter-seasonal prices.",
          "Add South Africa's reputation for clean fruit and reliable phytosanitary systems, and the export proposition is strong for growers who get quality right.",
        ],
      },
      {
        heading: "Start with the paperwork",
        paragraphs: [
          "Export fruit needs to comply with the importing country's plant-health rules. In practice this means registration with the national plant protection organisation, orchard and packhouse registration, traceability records, and phytosanitary certification for each consignment. Markets differ: the EU has strict rules, Middle Eastern markets are often more accessible, and Asian markets open market-by-market as protocols are agreed.",
        ],
        bullets: [
          "Register your orchard and packhouse before the season starts.",
          "Keep spray records and traceability from day one — auditors will ask.",
          "Work with an established export agent for your first seasons; their market contacts and consignment handling are worth their commission.",
        ],
      },
      {
        heading: "Air vs. sea freight",
        paragraphs: [
          "Air freight suits launch volumes and premium grades: fast, small lots, high cost per kilogram. Sea freight in reefer containers is the volume game — it only works with cultivars and handling protocols proven to hold quality for the voyage duration. Growers typically start on air freight, gather arrival-quality data, then transition their best cultivars to sea.",
        ],
      },
      {
        heading: "What buyers look for",
        paragraphs: [
          "Consistency beats peak quality. Export buyers reorder from growers whose fruit arrives the same, week after week: uniform grade, stable Brix, intact bracts, no chilling injury. Build your reputation on your worst week, not your best.",
        ],
      },
      {
        heading: "A practical entry path",
        paragraphs: [
          "Year one: sell locally, learn your cultivars' pack-out and shelf life. Year two: trial small air-freight consignments through an agent. Year three: scale the cultivars that arrived best. Export is a staircase — climb it one verified step at a time, and every step compounds.",
        ],
      },
    ],
  },
  {
    slug: "pitaya-the-future-of-african-agriculture",
    title: "Why Dragon Fruit Could Reshape African Agriculture",
    excerpt:
      "Low water, high value, marginal land, global demand — the case that pitaya is more than a niche crop for African growers.",
    category: "Insight",
    date: "2026-10-26",
    readTime: "6 min read",
    image: imgFuture,
    imageAlt: "A vast young dragon fruit plantation in the African bushveld at sunrise",
    sections: [
      {
        heading: "A crop built for the African century",
        paragraphs: [
          "African agriculture faces a hard equation: more heat, less reliable rain, rising input costs and young populations that need viable farm livelihoods. Dragon fruit answers nearly every clause. It is heat-loving, thrives on a fraction of the water of traditional orchard crops, grows on marginal, well-drained land, and produces a high-value product with global demand.",
        ],
      },
      {
        heading: "Low inputs, high value",
        paragraphs: [
          "Compared with citrus, avocado or table grapes, pitaya needs modest fertiliser, minimal spraying, no cold storage at the farm gate for its first week of life, and hand labour that scales with orchard size. The value per hectare at maturity rivals or exceeds traditional high-value orchards, with a much lighter water footprint — a decisive advantage in water-stressed regions.",
        ],
      },
      {
        heading: "A ladder for small-scale growers",
        paragraphs: [
          "Because dragon fruit comes into production within two to three years from planting and can start from a fraction of a hectare, it is one of the few orchard crops where a small-scale grower can build a genuinely commercial operation incrementally — five posts this season, fifty next, five hundred the year after. The crop scales with the farmer instead of demanding capital upfront.",
        ],
      },
      {
        heading: "The opportunity is early, not saturated",
        paragraphs: [
          "Commercial pitaya in sub-Saharan Africa is still in its infancy. Local supermarket supply is dominated by imports; export protocols are opening market by market. Growers establishing now — with verified cultivars and sound records — will be the incumbents of a category that is only beginning to form.",
          "That is the quiet thesis behind everything we do at DFSA: build the plant supply, the agronomic knowledge and the market pathways so African growers can own this crop's future rather than watch it develop elsewhere.",
        ],
      },
      {
        heading: "Start where you are",
        paragraphs: [
          "You do not need a hundred hectares to begin. A well-drained corner, reliable water, certified plants and honest records will take you further than any grand plan. The growers who started small and started right are the ones building tomorrow's orchards.",
        ],
      },
    ],
  },
];

export function getPost(slug: string) {
  return blogPosts.find((p) => p.slug === slug);
}
