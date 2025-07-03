const generateProductMetaTags = (product, baseUrl, config) => {
  const productUrl = `${baseUrl}/Artikel/${product.seoName}`;
  const imageUrl =
    product.pictureList && product.pictureList.trim()
      ? `${baseUrl}/assets/images/prod${product.pictureList
          .split(",")[0]
          .trim()}.jpg`
      : `${baseUrl}/assets/images/nopicture.jpg`;

  // Clean description for meta (remove HTML tags and limit length)
  const cleanDescription = product.description
    ? product.description
        .replace(/<[^>]*>/g, "")
        .replace(/\n/g, " ")
        .substring(0, 160)
    : `${product.name} - Art.-Nr.: ${product.articleNumber}`;

  return `
    <!-- SEO Meta Tags -->
    <meta name="description" content="${cleanDescription}">
    <meta name="keywords" content="${product.name}, ${
    product.manufacturer || ""
  }, ${product.articleNumber}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${product.name}">
    <meta property="og:description" content="${cleanDescription}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${productUrl}">
    <meta property="og:type" content="product">
    <meta property="og:site_name" content="${config.siteName}">
    <meta property="product:price:amount" content="${product.price}">
    <meta property="product:price:currency" content="${config.currency}">
    <meta property="product:availability" content="${
      product.available ? "in stock" : "out of stock"
    }">
    ${product.gtin ? `<meta property="product:gtin" content="${product.gtin}">` : ''}
    ${product.articleNumber ? `<meta property="product:retailer_item_id" content="${product.articleNumber}">` : ''}
    ${product.manufacturer ? `<meta property="product:brand" content="${product.manufacturer}">` : ''}
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${product.name}">
    <meta name="twitter:description" content="${cleanDescription}">
    <meta name="twitter:image" content="${imageUrl}">
    
    <!-- Additional Meta Tags -->
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${productUrl}">
  `;
};

const generateProductJsonLd = (product, baseUrl, config) => {
  const productUrl = `${baseUrl}/Artikel/${product.seoName}`;
  const imageUrl =
    product.pictureList && product.pictureList.trim()
      ? `${baseUrl}/assets/images/prod${product.pictureList
          .split(",")[0]
          .trim()}.jpg`
      : `${baseUrl}/assets/images/nopicture.jpg`;

  // Clean description for JSON-LD (remove HTML tags)
  const cleanDescription = product.description
    ? product.description.replace(/<[^>]*>/g, "").replace(/\n/g, " ")
    : product.name;

  // Calculate price valid date (current date + 3 months)
  const priceValidDate = new Date();
  priceValidDate.setMonth(priceValidDate.getMonth() + 3);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: [imageUrl],
    description: cleanDescription,
    sku: product.articleNumber,
    ...(product.gtin && { gtin: product.gtin }),
    brand: {
      "@type": "Brand",
      name: product.manufacturer || "Unknown",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: config.currency,
      price: product.price.toString(),
      priceValidUntil: priceValidDate.toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: config.brandName,
      },
    },
  };

  return `<script type="application/ld+json">${JSON.stringify(
    jsonLd
  )}</script>`;
};

const generateCategoryJsonLd = (category, products = [], baseUrl, config) => {
  const categoryUrl = `${baseUrl}/Kategorie/${category.seoName}`;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "CollectionPage",
    name: category.name,
    url: categoryUrl,
    description: `${category.name} - Entdecken Sie unsere Auswahl an hochwertigen Produkten`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: category.name,
          item: categoryUrl,
        },
      ],
    },
  };

  // Add product list if products are available
  if (products && products.length > 0) {
    jsonLd.mainEntity = {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 20).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          url: `${baseUrl}/Artikel/${product.seoName}`,
          image:
            product.pictureList && product.pictureList.trim()
              ? `${baseUrl}/assets/images/prod${product.pictureList
                  .split(",")[0]
                  .trim()}.jpg`
              : `${baseUrl}/assets/images/nopicture.jpg`,
          offers: {
            "@type": "Offer",
            price: product.price.toString(),
            priceCurrency: config.currency,
            availability: product.available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          },
        },
      })),
    };
  }

  return `<script type="application/ld+json">${JSON.stringify(
    jsonLd
  )}</script>`;
};

const generateHomepageMetaTags = (baseUrl, config) => {
  const description = config.descriptions.long;
  const keywords = config.keywords;
  const imageUrl = `${baseUrl}${config.images.logo}`;

  return `
    <!-- SEO Meta Tags -->
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${config.descriptions.short}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${baseUrl}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${config.siteName}">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${config.descriptions.short}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    
    <!-- Additional Meta Tags -->
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${baseUrl}">
  `;
};

const generateHomepageJsonLd = (baseUrl, config) => {

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "WebSite",
    name: config.brandName,
    url: baseUrl,
    description: config.descriptions.long,
    publisher: {
      "@type": "Organization",
      name: config.brandName,
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}${config.images.logo}`,
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    mainEntity: {
      "@type": "WebPage",
      name: "Sitemap",
      url: `${baseUrl}/sitemap`,
      description: "Vollständige Sitemap mit allen Kategorien und Seiten",
    },
    sameAs: [
      // Add your social media URLs here if available
    ],
  };

  return `<script type="application/ld+json">${JSON.stringify(
    jsonLd
  )}</script>`;
};

const generateSitemapJsonLd = (allCategories = [], baseUrl, config) => {

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "WebPage",
    name: "Sitemap",
    url: `${baseUrl}/sitemap`,
    description: `Sitemap - Übersicht aller Kategorien und Seiten auf ${config.siteName}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Sitemap",
          item: `${baseUrl}/sitemap`,
        },
      ],
    },
  };

  // Add all categories as site navigation elements
  if (allCategories && allCategories.length > 0) {
    jsonLd.mainEntity = {
      "@type": "SiteNavigationElement",
      name: "Kategorien",
      hasPart: allCategories.map((category) => ({
        "@type": "SiteNavigationElement",
        name: category.name,
        url: `${baseUrl}/Kategorie/${category.seoName}`,
        description: `${category.name} Kategorie`,
      })),
    };
  }

  return `<script type="application/ld+json">${JSON.stringify(
    jsonLd
  )}</script>`;
};

const generateXmlSitemap = (allCategories = [], allProducts = [], baseUrl) => {
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Homepage
  sitemap += `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

  // Static pages
  const staticPages = [
    { path: "/datenschutz", changefreq: "monthly", priority: "0.3" },
    { path: "/impressum", changefreq: "monthly", priority: "0.3" },
    { path: "/batteriegesetzhinweise", changefreq: "monthly", priority: "0.3" },
    { path: "/widerrufsrecht", changefreq: "monthly", priority: "0.3" },
    { path: "/sitemap", changefreq: "weekly", priority: "0.5" },
    { path: "/agb", changefreq: "monthly", priority: "0.3" },
    { path: "/404", changefreq: "monthly", priority: "0.1" },
    { path: "/Konfigurator", changefreq: "weekly", priority: "0.8" },
  ];

  staticPages.forEach((page) => {
    sitemap += `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  // Category pages
  allCategories.forEach((category) => {
    if (category.seoName) {
      sitemap += `  <url>
    <loc>${baseUrl}/Kategorie/${category.seoName}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }
  });

  // Product pages
  allProducts.forEach((productSeoName) => {
    sitemap += `  <url>
    <loc>${baseUrl}/Artikel/${productSeoName}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  return sitemap;
};

const generateKonfiguratorMetaTags = (baseUrl, config) => {
  const description = "Unser interaktiver Growbox Konfigurator hilft dir dabei, das perfekte Indoor Growing Setup zusammenzustellen. Wähle aus verschiedenen Growbox-Größen, Beleuchtung, Belüftung und Extras. Bundle-Rabatte bis 36%!";
  const keywords = "Growbox Konfigurator, Indoor Growing, Growzelt, Beleuchtung, Belüftung, Growbox Setup, Indoor Garden";
  const imageUrl = `${baseUrl}${config.images.placeholder}`; // Placeholder image

  return `
    <!-- SEO Meta Tags -->
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="Growbox Konfigurator - Stelle dein perfektes Indoor Grow Setup zusammen">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${baseUrl}/Konfigurator">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${config.siteName}">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Growbox Konfigurator - Indoor Grow Setup">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    
    <!-- Additional Meta Tags -->
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${baseUrl}/Konfigurator">
  `;
};

const generateRobotsTxt = (baseUrl) => {

  const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
Crawl-delay: 0
`;

  return robotsTxt;
};

const generateProductsXml = (allProductsData = [], baseUrl, config) => {
  const currentDate = new Date().toISOString();

  // Validate input
  if (!Array.isArray(allProductsData) || allProductsData.length === 0) {
    throw new Error("No valid product data provided");
  }

  // Category mapping function
  const getGoogleProductCategory = (categoryId) => {
    const categoryMappings = {
      // Seeds & Plants
      689: "Home & Garden > Plants > Seeds",
      706: "Home & Garden > Plants", // Stecklinge (cuttings)
      376: "Home & Garden > Plants > Plant & Herb Growing Kits", // Grow-Sets
      
      // Headshop & Accessories
      709: "Arts & Entertainment > Hobbies & Creative Arts", // Headshop
      711: "Arts & Entertainment > Hobbies & Creative Arts", // Bongs
      714: "Arts & Entertainment > Hobbies & Creative Arts", // Zubehör
      748: "Arts & Entertainment > Hobbies & Creative Arts", // Köpfe
      749: "Arts & Entertainment > Hobbies & Creative Arts", // Chillums / Diffusoren / Kupplungen
      896: "Electronics > Electronics Accessories", // Vaporizer
      710: "Home & Garden > Kitchen & Dining > Kitchen Tools & Utensils", // Grinder
      
      // Measuring & Packaging
      186: "Business & Industrial", // Wiegen & Verpacken
      187: "Business & Industrial > Science & Laboratory > Lab Equipment", // Waagen
      346: "Home & Garden > Kitchen & Dining > Food Storage", // Vakuumbeutel
      355: "Home & Garden > Kitchen & Dining > Food Storage", // Boveda & Integra Boost
      407: "Home & Garden > Kitchen & Dining > Food Storage", // Grove Bags
      449: "Home & Garden > Kitchen & Dining > Food Storage", // Cliptütchen
      539: "Home & Garden > Kitchen & Dining > Food Storage", // Gläser & Dosen
      
      // Lighting & Equipment
      694: "Home & Garden > Lighting", // Lampen
      261: "Home & Garden > Lighting", // Lampenzubehör
      
      // Plants & Growing
      691: "Home & Garden > Lawn & Garden > Fertilizers", // Dünger
      692: "Home & Garden > Lawn & Garden > Fertilizers", // Dünger - Zubehör
      693: "Sporting Goods > Outdoor Recreation > Camping & Hiking > Tents", // Zelte
      
      // Pots & Containers
      219: "Home & Garden > Decor > Planters & Pots", // Töpfe
      220: "Home & Garden > Decor > Planters & Pots", // Untersetzer
      301: "Home & Garden > Decor > Planters & Pots", // Stofftöpfe
      317: "Home & Garden > Decor > Planters & Pots", // Air-Pot
      364: "Home & Garden > Decor > Planters & Pots", // Kunststofftöpfe
      292: "Home & Garden > Decor > Planters & Pots", // Trays & Fluttische
      
      // Ventilation & Climate
      703: "Home & Garden > Outdoor Power Tools", // Abluft-Sets
      247: "Home & Garden > Outdoor Power Tools", // Belüftung
      214: "Home & Garden > Outdoor Power Tools", // Umluft-Ventilatoren
      308: "Home & Garden > Outdoor Power Tools", // Ab- und Zuluft
      609: "Home & Garden > Outdoor Power Tools", // Schalldämpfer
      248: "Home & Garden > Pool & Spa > Pool & Spa Filters", // Aktivkohlefilter
      392: "Home & Garden > Pool & Spa > Pool & Spa Filters", // Zuluftfilter
      658: "Home & Garden > Climate Control > Dehumidifiers", // Luftbe- und entfeuchter
      310: "Home & Garden > Climate Control > Heating", // Heizmatten
      379: "Home & Garden > Household Supplies > Air Fresheners", // Geruchsneutralisation
      
      // Irrigation & Watering
      221: "Home & Garden > Lawn & Garden > Watering Equipment", // Bewässerung
      250: "Home & Garden > Lawn & Garden > Watering Equipment", // Schläuche
      297: "Home & Garden > Lawn & Garden > Watering Equipment", // Pumpen
      354: "Home & Garden > Lawn & Garden > Watering Equipment", // Sprüher
      372: "Home & Garden > Lawn & Garden > Watering Equipment", // AutoPot
      389: "Home & Garden > Lawn & Garden > Watering Equipment", // Blumat
      405: "Home & Garden > Lawn & Garden > Watering Equipment", // Schläuche
      425: "Home & Garden > Lawn & Garden > Watering Equipment", // Wassertanks
      480: "Home & Garden > Lawn & Garden > Watering Equipment", // Tropfer
      519: "Home & Garden > Lawn & Garden > Watering Equipment", // Pumpsprüher
      
      // Growing Media & Soils
      242: "Home & Garden > Lawn & Garden > Fertilizers", // Böden
      243: "Home & Garden > Lawn & Garden > Fertilizers", // Erde
      269: "Home & Garden > Lawn & Garden > Fertilizers", // Kokos
      580: "Home & Garden > Lawn & Garden > Fertilizers", // Perlite & Blähton
      
      // Propagation & Starting
      286: "Home & Garden > Plants", // Anzucht
      298: "Home & Garden > Plants", // Steinwolltrays
      421: "Home & Garden > Plants", // Vermehrungszubehör
      489: "Home & Garden > Plants", // EazyPlug & Jiffy
      359: "Home & Garden > Outdoor Structures > Greenhouses", // Gewächshäuser
      
      // Tools & Equipment
      373: "Home & Garden > Tools > Hand Tools", // GrowTool
      403: "Home & Garden > Kitchen & Dining > Kitchen Tools & Utensils", // Messbecher & mehr
      259: "Home & Garden > Tools > Hand Tools", // Pressen
      280: "Home & Garden > Tools > Hand Tools", // Erntescheeren
      258: "Home & Garden > Tools", // Ernte & Verarbeitung
      278: "Home & Garden > Tools", // Extraktion
      302: "Home & Garden > Tools", // Erntemaschinen
      
      // Hardware & Plumbing
      222: "Hardware > Plumbing", // PE-Teile
      374: "Hardware > Plumbing > Plumbing Fittings", // Verbindungsteile
      
      // Electronics & Control
      314: "Electronics > Electronics Accessories", // Steuergeräte
      408: "Electronics > Electronics Accessories", // GrowControl
      344: "Business & Industrial > Science & Laboratory > Lab Equipment", // Messgeräte
      555: "Business & Industrial > Science & Laboratory > Lab Equipment > Microscopes", // Mikroskope
      
      // Camping & Outdoor
      226: "Sporting Goods > Outdoor Recreation > Camping & Hiking", // Zeltzubehör
      
      // Plant Care & Protection
      239: "Home & Garden > Lawn & Garden > Pest Control", // Pflanzenschutz
      240: "Home & Garden > Plants", // Anbauzubehör
      
      // Office & Media
      424: "Office Supplies > Labels", // Etiketten & Schilder
      387: "Media > Books", // Literatur
      
      // General categories
      705: "Home & Garden", // Set-Konfigurator
      686: "Home & Garden", // Zubehör
      741: "Home & Garden", // Zubehör
      294: "Home & Garden", // Zubehör
      695: "Home & Garden", // Zubehör
      293: "Home & Garden", // Trockennetze
      4: "Home & Garden", // Sonstiges
      450: "Home & Garden", // Restposten
    };
    
    return categoryMappings[categoryId] || "Home & Garden > Plants";
  };

  let productsXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${config.descriptions.short}</title>
    <link>${baseUrl}</link>
    <description>${config.descriptions.short}</description>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <language>${config.language}</language>`;

  // Helper function to clean text content of problematic characters
  const cleanTextContent = (text) => {
    if (!text) return "";
    
    return text.toString()
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove non-printable characters and control characters
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      // Remove BOM and other Unicode formatting characters
      .replace(/[\uFEFF\u200B-\u200D\u2060]/g, '')
      // Replace multiple whitespace with single space
      .replace(/\s+/g, ' ')
      // Remove leading/trailing whitespace
      .trim();
  };

  // Helper function to properly escape XML content and remove invalid characters
  const escapeXml = (unsafe) => {
    if (!unsafe) return "";
    
    // Convert to string and remove invalid XML characters
    const cleaned = unsafe.toString()
      // Remove control characters except tab (0x09), newline (0x0A), and carriage return (0x0D)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Remove invalid Unicode characters and surrogates
      .replace(/[\uD800-\uDFFF]/g, '')
      // Remove other problematic characters
      .replace(/[\uFFFE\uFFFF]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
    
    // Escape XML entities
    return cleaned
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  let processedCount = 0;
  let skippedCount = 0;

  // Category IDs to skip (seeds, plants, headshop items)
  const skipCategoryIds = [689, 706, 709, 711, 714, 748, 749, 896, 710];

  // Add each product as an item
  allProductsData.forEach((product, index) => {
    try {
      // Skip products without essential data
      if (!product || !product.seoName) {
        skippedCount++;
        return;
      }

      // Skip products from excluded categories
      const productCategoryId = product.categoryId || product.category_id || product.category || null;
      if (productCategoryId && skipCategoryIds.includes(parseInt(productCategoryId))) {
        skippedCount++;
        return;
      }

      // Skip products without GTIN
      if (!product.gtin || !product.gtin.toString().trim()) {
        skippedCount++;
        return;
      }

      // Skip products without pictures
      if (!product.pictureList || !product.pictureList.trim()) {
        skippedCount++;
        return;
      }

      // Clean description for feed (remove HTML tags and limit length)
      const rawDescription = product.description
        ? cleanTextContent(product.description).substring(0, 500)
        : `${product.name || 'Product'} - Art.-Nr.: ${product.articleNumber || 'N/A'}`;
      
      const cleanDescription = escapeXml(rawDescription) || "Produktbeschreibung nicht verfügbar";

      // Clean product name
      const rawName = product.name || "Unnamed Product";
      const cleanName = escapeXml(cleanTextContent(rawName)) || "Unnamed Product";

      // Validate essential fields
      if (!cleanName || cleanName.length < 2) {
        skippedCount++;
        return;
      }

      // Generate product URL
      const productUrl = `${baseUrl}/Artikel/${encodeURIComponent(product.seoName)}`;

      // Generate image URL
      const imageUrl = product.pictureList && product.pictureList.trim()
        ? `${baseUrl}/assets/images/prod${product.pictureList.split(",")[0].trim()}.jpg`
        : `${baseUrl}/assets/images/nopicture.jpg`;

      // Generate brand (manufacturer)
      const rawBrand = product.manufacturer || config.brandName;
      const brand = escapeXml(cleanTextContent(rawBrand));

      // Generate condition (always new for this type of shop)
      const condition = "new";

      // Generate availability
      const availability = product.available ? "in stock" : "out of stock";

      // Generate price (ensure it's a valid number)
      const price = product.price && !isNaN(product.price) 
        ? `${parseFloat(product.price).toFixed(2)} ${config.currency}`
        : `0.00 ${config.currency}`;

      // Skip products with price == 0
      if (!product.price || parseFloat(product.price) === 0) {
        skippedCount++;
        return;
      }

      // Generate GTIN/EAN if available (using articleNumber as fallback)
      const rawGtin = product.gtin || "";
      const gtin = escapeXml(rawGtin.toString().trim());

      // Generate product ID (using articleNumber or seoName)
      const rawProductId = product.articleNumber || product.seoName || `product_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const productId = escapeXml(rawProductId.toString().trim()) || `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      // Get Google product category based on product's category ID
      const categoryId = product.categoryId || product.category_id || product.category || null;
      const googleCategory = getGoogleProductCategory(categoryId);
      const escapedGoogleCategory = escapeXml(googleCategory);

      // Build item XML with proper formatting
      productsXml += `
    <item>
      <g:id>${productId}</g:id>
      <g:title>${cleanName}</g:title>
      <g:description>${cleanDescription}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:shipping>
        <g:country>${config.country}</g:country>
        <g:service>${config.shipping.defaultService}</g:service>
        <g:price>${config.shipping.defaultCost}</g:price>
      </g:shipping>
      <g:brand>${brand}</g:brand>
      <g:google_product_category>${escapedGoogleCategory}</g:google_product_category>
      <g:product_type>Gartenbedarf</g:product_type>`;

      // Add GTIN if available
      if (gtin && gtin.trim()) {
        productsXml += `
      <g:gtin>${gtin}</g:gtin>`;
      }

      // Add weight if available
      if (product.weight && !isNaN(product.weight)) {
        productsXml += `
      <g:shipping_weight>${parseFloat(product.weight).toFixed(2)} g</g:shipping_weight>`;
      }

      productsXml += `
    </item>`;

      processedCount++;

    } catch (itemError) {
      console.log(`   ⚠️ Skipped product ${index + 1}: ${itemError.message}`);
      skippedCount++;
    }
  });

  productsXml += `
</channel>
</rss>`;

  console.log(`   📊 Processing summary: ${processedCount} products included, ${skippedCount} skipped`);

  return productsXml;
};

const generateLlmsTxt = (allCategories = [], allProductsData = [], baseUrl, config) => {
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  // Group products by category for statistics
  const productsByCategory = {};
  allProductsData.forEach((product) => {
    const categoryId = product.categoryId || 'uncategorized';
    if (!productsByCategory[categoryId]) {
      productsByCategory[categoryId] = [];
    }
    productsByCategory[categoryId].push(product);
  });

  // Find category names for organization
  const categoryMap = {};
  allCategories.forEach((cat) => {
    categoryMap[cat.id] = cat.name;
  });

  let llmsTxt = `# ${config.siteName} - Site Map for LLMs

Generated: ${currentDate}
Base URL: ${baseUrl}

## About ${config.brandName}
GrowHeads.de is a German online shop and local store in Dresden specializing in high-quality seeds, plants, and gardening supplies for cannabis cultivation. 

## Site Structure

### Static Pages
- **Home** - ${baseUrl}/
- **Datenschutz (Privacy Policy)** - ${baseUrl}/datenschutz
- **Impressum (Legal Notice)** - ${baseUrl}/impressum
- **AGB (Terms & Conditions)** - ${baseUrl}/agb
- **Widerrufsrecht (Right of Withdrawal)** - ${baseUrl}/widerrufsrecht
- **Batteriegesetzhinweise (Battery Law Notice)** - ${baseUrl}/batteriegesetzhinweise
- **Sitemap** - ${baseUrl}/sitemap
- **Growbox Konfigurator** - ${baseUrl}/Konfigurator - Interactive tool to configure grow box setups with bundle discounts
- **Profile** - ${baseUrl}/profile - User account and order management

### Site Features
- **Language**: German (${config.language})
- **Currency**: ${config.currency} (Euro)
- **Shipping**: ${config.country}
- **Payment Methods**: Credit Cards, PayPal, Bank Transfer, Cash on Delivery, Cash on Pickup

### Product Categories (${allCategories.length} categories)

`;

  // Add categories with links to their detailed LLM files
  allCategories.forEach((category) => {
    if (category.seoName) {
      const productCount = productsByCategory[category.id]?.length || 0;
      const categorySlug = category.seoName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      llmsTxt += `#### ${category.name} (${productCount} products)
- **Product Catalog**: ${baseUrl}/llms-${categorySlug}.txt

`;
    }
  });

  llmsTxt += `
---

*This sitemap is automatically generated during the site build process and includes all publicly accessible content. For technical inquiries, please refer to our contact information in the Impressum.*
`;

  return llmsTxt;
};

const generateCategoryLlmsTxt = (category, categoryProducts = [], baseUrl, config) => {
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  let categoryLlmsTxt = `# ${category.name} - Product Catalog

Generated: ${currentDate}
Base URL: ${baseUrl}
Category: ${category.name} (ID: ${category.id})
Category URL: ${baseUrl}/Kategorie/${category.seoName}

## Category Overview
This file contains all products in the "${category.name}" category from ${config.siteName}. 

**Statistics:**
- **Total Products**: ${categoryProducts.length}
- **Category ID**: ${category.id}
- **Category URL**: ${baseUrl}/Kategorie/${category.seoName}
- **Back to Main Sitemap**: ${baseUrl}/llms.txt

`;

  if (categoryProducts.length > 0) {
    categoryProducts.forEach((product, index) => {
      if (product.seoName) {
        // Clean description for markdown (remove HTML tags and limit length)
        const cleanDescription = product.description
          ? product.description
              .replace(/<[^>]*>/g, "")
              .replace(/\n/g, " ")
              .trim()
              .substring(0, 300)
          : "";

        categoryLlmsTxt += `## ${index + 1}. ${product.name}

- **Product URL**: ${baseUrl}/Artikel/${product.seoName}
- **Article Number**: ${product.articleNumber || 'N/A'}
- **Price**: €${product.price || '0.00'}
- **Brand**: ${product.manufacturer || config.brandName}
- **Availability**: ${product.available ? 'In Stock' : 'Out of Stock'}`;

        if (product.gtin) {
          categoryLlmsTxt += `
- **GTIN**: ${product.gtin}`;
        }

        if (product.weight && !isNaN(product.weight)) {
          categoryLlmsTxt += `
- **Weight**: ${product.weight}g`;
        }

        if (cleanDescription) {
          categoryLlmsTxt += `

**Description:**
${cleanDescription}${product.description && product.description.length > 300 ? '...' : ''}`;
        }

        categoryLlmsTxt += `

---

`;
      }
    });
  } else {
    categoryLlmsTxt += `## No Products Available

This category currently contains no products.

`;
  }

  categoryLlmsTxt += `---

*This category product list is automatically generated during the site build process. Product availability and pricing are updated in real-time on the main website.*
`;

  return categoryLlmsTxt;
};

module.exports = {
  generateProductMetaTags,
  generateProductJsonLd,
  generateCategoryJsonLd,
  generateHomepageMetaTags,
  generateHomepageJsonLd,
  generateSitemapJsonLd,
  generateKonfiguratorMetaTags,
  generateXmlSitemap,
  generateRobotsTxt,
  generateProductsXml,
  generateLlmsTxt,
  generateCategoryLlmsTxt,
};
