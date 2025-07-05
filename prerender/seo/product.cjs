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

const generateProductJsonLd = (product, baseUrl, config, categoryInfo = null) => {
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

  // Add breadcrumb if category information is available
  if (categoryInfo && categoryInfo.name && categoryInfo.seoName) {
    jsonLd.breadcrumb = {
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
          name: categoryInfo.name,
          item: `${baseUrl}/Kategorie/${categoryInfo.seoName}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.name,
          item: productUrl,
        },
      ],
    };
  }

  return `<script type="application/ld+json">${JSON.stringify(
    jsonLd
  )}</script>`;
};

module.exports = {
  generateProductMetaTags,
  generateProductJsonLd,
}; 