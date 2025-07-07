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

// Helper function to determine unit pricing data based on product data
const determineUnitPricingData = (product) => {
  const result = {
    unit_pricing_measure: null,
    unit_pricing_base_measure: null
  };
  
  // unit_pricing_measure: The quantity unit of the product as it's sold
  if (product.fEinheitMenge && product.cEinheit) {
    const amount = parseFloat(product.fEinheitMenge);
    const unit = product.cEinheit.trim();
    
    if (amount > 0 && unit) {
      result.unit_pricing_measure = `${amount}${unit}`;
    }
  }
  
  // unit_pricing_base_measure: The base quantity unit for unit pricing
  if (product.cGrundEinheit && product.cGrundEinheit.trim()) {
    result.unit_pricing_base_measure = product.cGrundEinheit.trim();
  }
  
  return result;
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
      689: "543561", // Seeds (Saatgut)
      706: "543561", // Stecklinge (cuttings) – ebenfalls Pflanzen/Saatgut
      376: "2802",   // Grow-Sets – Pflanzen- & Kräuteranbausets
      
      // Headshop & Accessories
      709: "4082",   // Headshop – Rauchzubehör
      711: "4082",   // Headshop > Bongs – Rauchzubehör
      714: "4082",   // Headshop > Bongs > Zubehör – Rauchzubehör
      748: "4082",   // Headshop > Bongs > Köpfe – Rauchzubehör
      749: "4082",   // Headshop > Bongs > Chillums/Diffusoren/Kupplungen – Rauchzubehör
      896: "3151",   // Headshop > Vaporizer – Vaporizer
      710: "5109",   // Headshop > Grinder – Gewürzmühlen (Küchenhelfer)
      
      // Measuring & Packaging
      186: "5631",   // Headshop > Wiegen & Verpacken – Aufbewahrung/Zubehör
      187: "4767",   // Headshop > Waagen – Personenwaagen (Medizinisch)
      346: "7118",   // Headshop > Vakuumbeutel – Vakuumierer-Beutel
      355: "606",    // Headshop > Boveda & Integra Boost – Luftentfeuchter (nächstmögliche)
      407: "3561",   // Headshop > Grove Bags – Aufbewahrungsbehälter
      449: "1496",   // Headshop > Cliptütchen – Lebensmittelverpackungsmaterial
      539: "3110",   // Headshop > Gläser & Dosen – Lebensmittelbehälter
      
      // Lighting & Equipment
      694: "3006",   // Lampen – Lampen (Beleuchtung)
      261: "3006",   // Zubehör > Lampenzubehör – Lampen
      
      // Plants & Growing
      691: "500033", // Dünger – Dünger
      692: "5633",   // Zubehör > Dünger-Zubehör – Zubehör für Gartenarbeit
      693: "5655",   // Zelte – Zelte
      
      // Pots & Containers
      219: "113",    // Töpfe – Blumentöpfe & Pflanzgefäße
      220: "3173",   // Töpfe > Untersetzer – Gartentopfuntersetzer und Trays
      301: "113",    // Töpfe > Stofftöpfe – (Blumentöpfe/Pflanzgefäße)
      317: "113",    // Töpfe > Air-Pot – (Blumentöpfe/Pflanzgefäße)
      364: "113",    // Töpfe > Kunststofftöpfe – (Blumentöpfe/Pflanzgefäße)
      292: "3568",   // Bewässerung > Trays & Fluttische – Bewässerungssysteme
      
      // Ventilation & Climate
      703: "2802",   // Grow-Sets > Abluft-Sets – (verwendet Pflanzen-Kräuter-Anbausets)
      247: "1700",   // Belüftung – Ventilatoren (Klimatisierung)
      214: "1700",   // Belüftung > Umluft-Ventilatoren – Ventilatoren
      308: "1700",   // Belüftung > Ab- und Zuluft – Ventilatoren
      609: "1700",   // Belüftung > Ab- und Zuluft > Schalldämpfer – Ventilatoren
      248: "1700",   // Belüftung > Aktivkohlefilter – Ventilatoren (nächstmögliche)
      392: "1700",   // Belüftung > Ab- und Zuluft > Zuluftfilter – Ventilatoren
      658: "606",    // Belüftung > Luftbe- und -entfeuchter – Luftentfeuchter
      310: "2802",   // Anzucht > Heizmatten – Pflanzen- & Kräuteranbausets
      379: "5631",   // Belüftung > Geruchsneutralisation – Haushaltsbedarf: Aufbewahrung
      
      // Irrigation & Watering
      221: "3568",   // Bewässerung – Bewässerungssysteme (Gesamt)
      250: "6318",   // Bewässerung > Schläuche – Gartenschläuche
      297: "500100", // Bewässerung > Pumpen – Bewässerung-/Sprinklerpumpen
      354: "3780",   // Bewässerung > Sprüher – Sprinkler & Sprühköpfe
      372: "3568",   // Bewässerung > AutoPot – Bewässerungssysteme
      389: "3568",   // Bewässerung > Blumat – Bewässerungssysteme
      405: "6318",   // Bewässerung > Schläuche – Gartenschläuche
      425: "3568",   // Bewässerung > Wassertanks – Bewässerungssysteme
      480: "3568",   // Bewässerung > Tropfer – Bewässerungssysteme
      519: "3568",   // Bewässerung > Pumpsprüher – Bewässerungssysteme
      
      // Growing Media & Soils
      242: "543677", // Böden – Gartenerde
      243: "543677", // Böden > Erde – Gartenerde
      269: "543677", // Böden > Kokos – Gartenerde
      580: "543677", // Böden > Perlite & Blähton – Gartenerde
      
      // Propagation & Starting
      286: "2802",   // Anzucht – Pflanzen- & Kräuteranbausets
      298: "2802",   // Anzucht > Steinwolltrays – Pflanzen- & Kräuteranbausets
      421: "2802",   // Anzucht > Vermehrungszubehör – Pflanzen- & Kräuteranbausets
      489: "2802",   // Anzucht > EazyPlug & Jiffy – Pflanzen- & Kräuteranbausets
      359: "3103",   // Anzucht > Gewächshäuser – Gewächshäuser
      
      // Tools & Equipment
      373: "3568",   // Bewässerung > GrowTool – Bewässerungssysteme
      403: "3999",   // Bewässerung > Messbecher & mehr – Messbecher & Dosierlöffel
      259: "756",    // Zubehör > Ernte & Verarbeitung > Pressen – Nudelmaschinen
      280: "2948",   // Zubehör > Ernte & Verarbeitung > Erntescheeren – Küchenmesser
      258: "684",    // Zubehör > Ernte & Verarbeitung – Abfallzerkleinerer
      278: "5057",   // Zubehör > Ernte & Verarbeitung > Extraktion – Slush-Eis-Maschinen
      302: "7332",   // Zubehör > Ernte & Verarbeitung > Erntemaschinen – Gartenmaschinen
      
      // Hardware & Plumbing
      222: "3568",   // Bewässerung > PE-Teile – Bewässerungssysteme
      374: "1700",   // Belüftung > Ab- und Zuluft > Verbindungsteile – Ventilatoren
      
      // Electronics & Control
      314: "1700",   // Belüftung > Steuergeräte – Ventilatoren
      408: "1700",   // Belüftung > Steuergeräte > GrowControl – Ventilatoren
      344: "1207",   // Zubehör > Messgeräte – Messwerkzeuge & Messwertgeber
      555: "4555",   // Zubehör > Anbauzubehör > Mikroskope – Mikroskope
      
      // Camping & Outdoor
      226: "5655",   // Zubehör > Zeltzubehör – Zelte
      
      // Plant Care & Protection
      239: "4085",   // Zubehör > Anbauzubehör > Pflanzenschutz – Herbizide
      240: "5633",   // Zubehör > Anbauzubehör – Zubehör für Gartenarbeit
      
      // Office & Media
      424: "4377",   // Zubehör > Anbauzubehör > Etiketten & Schilder – Etiketten & Anhängerschilder
      387: "543541", // Zubehör > Anbauzubehör > Literatur – Bücher
      
      // General categories
      705: "2802",   // Grow-Sets > Set-Konfigurator – (ebenfalls Pflanzen-Anbausets)
      686: "1700",   // Belüftung > Aktivkohlefilter > Zubehör – Ventilatoren
      741: "1700",   // Belüftung > Ab- und Zuluft > Zubehör – Ventilatoren
      294: "3568",   // Bewässerung > Zubehör – Bewässerungssysteme
      695: "5631",   // Zubehör – Haushaltsbedarf: Aufbewahrung
      293: "5631",   // Zubehör > Ernte & Verarbeitung > Trockennetze – Haushaltsbedarf: Aufbewahrung
      4: "5631",     // Zubehör > Anbauzubehör > Sonstiges – Haushaltsbedarf: Aufbewahrung
      450: "5631",   // Zubehör > Anbauzubehör > Restposten – Haushaltsbedarf: Aufbewahrung
    };
    
    const categoryId_str = categoryMappings[categoryId] || "5631"; // Default to Haushaltsbedarf: Aufbewahrung
    
    // Validate that the category ID is not empty
    if (!categoryId_str || categoryId_str.trim() === "") {
      return "5631"; // Haushaltsbedarf: Aufbewahrung
    }
    
    return categoryId_str;
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

      // Add unit pricing data (required by German law for many products)
      const unitPricingData = determineUnitPricingData(product);
      if (unitPricingData.unit_pricing_measure) {
        productsXml += `
      <g:unit_pricing_measure>${unitPricingData.unit_pricing_measure}</g:unit_pricing_measure>`;
      }
      if (unitPricingData.unit_pricing_base_measure) {
        productsXml += `
      <g:unit_pricing_base_measure>${unitPricingData.unit_pricing_base_measure}</g:unit_pricing_base_measure>`;
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