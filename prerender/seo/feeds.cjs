const generateRobotsTxt = (baseUrl) => {
  // Ensure URLs are properly formatted
  const canonicalUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

  const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${canonicalUrl}/sitemap.xml
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
      186: "Business & Industrial > Science & Laboratory", // Wiegen & Verpacken
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
      222: "Hardware > Plumbing Fixtures", // PE-Teile
      374: "Hardware > Plumbing Fixtures", // Verbindungsteile
      
      // Electronics & Control
      314: "Electronics > Electronics Accessories", // Steuergeräte
      408: "Electronics > Electronics Accessories", // GrowControl
      344: "Business & Industrial > Science & Laboratory > Lab Equipment", // Messgeräte
      555: "Business & Industrial > Science & Laboratory > Lab Equipment", // Mikroskope
      
      // Camping & Outdoor
      226: "Sporting Goods > Outdoor Recreation > Camping & Hiking", // Zeltzubehör
      
      // Plant Care & Protection
      239: "Home & Garden > Lawn & Garden > Pest Control", // Pflanzenschutz
      240: "Home & Garden > Plants", // Anbauzubehör
      
      // Office & Media
      424: "Business & Industrial > Office Supplies", // Etiketten & Schilder
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
    
    const category = categoryMappings[categoryId] || "Home & Garden > Plants";
    
    // Validate that the category is not empty or too generic
    if (!category || category.trim() === "") {
      return "Home & Garden > Plants";
    }
    
    return category;
  };

  let productsXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>${config.descriptions.short}</title>
    <link>${baseUrl}</link>
    <description>${config.descriptions.short}</description>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <language>de-DE</language>`;

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

      // Generate GTIN/EAN if available
      const gtin = product.gtin ? escapeXml(product.gtin.toString().trim()) : null;

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

module.exports = {
  generateRobotsTxt,
  generateProductsXml,
}; 