const generateProductMetaTags = (product) => {
  const baseUrl = 'https://seedheads.de';
  const productUrl = `${baseUrl}/Artikel/${product.seoName}`;
  const imageUrl = product.pictureList && product.pictureList.trim() 
    ? `${baseUrl}/assets/images/prod${product.pictureList.split(',')[0].trim()}.jpg`
    : `${baseUrl}/assets/images/nopicture.jpg`;
  
  // Clean description for meta (remove HTML tags and limit length)
  const cleanDescription = product.description 
    ? product.description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ').substring(0, 160)
    : `${product.name} - Art.-Nr.: ${product.articleNumber}`;

  return `
    <!-- SEO Meta Tags -->
    <meta name="description" content="${cleanDescription}">
    <meta name="keywords" content="${product.name}, ${product.manufacturer || ''}, ${product.articleNumber}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${product.name}">
    <meta property="og:description" content="${cleanDescription}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:url" content="${productUrl}">
    <meta property="og:type" content="product">
    <meta property="og:site_name" content="SeedHeads.de">
    <meta property="product:price:amount" content="${product.price}">
    <meta property="product:price:currency" content="EUR">
    <meta property="product:availability" content="${product.available ? 'in stock' : 'out of stock'}">
    
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

const generateProductJsonLd = (product) => {
  const baseUrl = 'https://seedheads.de';
  const productUrl = `${baseUrl}/Artikel/${product.seoName}`;
  const imageUrl = product.pictureList && product.pictureList.trim() 
    ? `${baseUrl}/assets/images/prod${product.pictureList.split(',')[0].trim()}.jpg`
    : `${baseUrl}/assets/images/nopicture.jpg`;
  
  // Clean description for JSON-LD (remove HTML tags)
  const cleanDescription = product.description 
    ? product.description.replace(/<[^>]*>/g, '').replace(/\n/g, ' ')
    : product.name;

  // Calculate price valid date (current date + 3 months)
  const priceValidDate = new Date();
  priceValidDate.setMonth(priceValidDate.getMonth() + 3);
  
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [imageUrl],
    "description": cleanDescription,
    "sku": product.articleNumber,
    "brand": {
      "@type": "Brand",
      "name": product.manufacturer || "Unknown"
    },
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "EUR",
      "price": product.price.toString(),
      "priceValidUntil": priceValidDate.toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "SeedHeads"
      }
    }
  };

  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
};

const generateCategoryJsonLd = (category, products = []) => {
  const baseUrl = 'https://seedheads.de';
  const categoryUrl = `${baseUrl}/Kategorie/${category.seoName}`;
  
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "CollectionPage",
    "name": category.name,
    "url": categoryUrl,
    "description": `${category.name} - Entdecken Sie unsere Auswahl an hochwertigen Produkten`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": category.name,
          "item": categoryUrl
        }
      ]
    }
  };

  // Add product list if products are available
  if (products && products.length > 0) {
    jsonLd.mainEntity = {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 20).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "url": `${baseUrl}/Artikel/${product.seoName}`,
          "image": product.pictureList && product.pictureList.trim() 
            ? `${baseUrl}/assets/images/prod${product.pictureList.split(',')[0].trim()}.jpg`
            : `${baseUrl}/assets/images/nopicture.jpg`,
          "offers": {
            "@type": "Offer",
            "price": product.price.toString(),
            "priceCurrency": "EUR",
            "availability": product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }
      }))
    };
  }

  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
};

const generateHomepageJsonLd = () => {
  const baseUrl = 'https://seedheads.de';
  
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "WebSite",
    "name": "SeedHeads",
    "url": baseUrl,
    "description": "SeedHeads - Ihr Online-Shop für hochwertige Samen, Pflanzen und Gartenbedarf",
    "publisher": {
      "@type": "Organization",
      "name": "SeedHeads",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/assets/images/sh.png`
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "mainEntity": {
      "@type": "WebPage",
      "name": "Sitemap",
      "url": `${baseUrl}/sitemap`,
      "description": "Vollständige Sitemap mit allen Kategorien und Seiten"
    },
    "sameAs": [
      // Add your social media URLs here if available
    ]
  };

  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
};

const generateSitemapJsonLd = (allCategories = []) => {
  const baseUrl = 'https://seedheads.de';
  
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "WebPage",
    "name": "Sitemap",
    "url": `${baseUrl}/sitemap`,
    "description": "Sitemap - Übersicht aller Kategorien und Seiten auf SeedHeads.de",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Sitemap",
          "item": `${baseUrl}/sitemap`
        }
      ]
    }
  };

  // Add all categories as site navigation elements
  if (allCategories && allCategories.length > 0) {
    jsonLd.mainEntity = {
      "@type": "SiteNavigationElement",
      "name": "Kategorien",
      "hasPart": allCategories.map(category => ({
        "@type": "SiteNavigationElement",
        "name": category.name,
        "url": `${baseUrl}/Kategorie/${category.seoName}`,
        "description": `${category.name} Kategorie`
      }))
    };
  }

  return `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
};

const generateXmlSitemap = (allCategories = [], allProducts = []) => {
  const baseUrl = 'https://seedheads.de';
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
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
    { path: '/datenschutz', changefreq: 'monthly', priority: '0.3' },
    { path: '/impressum', changefreq: 'monthly', priority: '0.3' },
    { path: '/batteriegesetzhinweise', changefreq: 'monthly', priority: '0.3' },
    { path: '/widerrufsrecht', changefreq: 'monthly', priority: '0.3' },
    { path: '/sitemap', changefreq: 'weekly', priority: '0.5' },
    { path: '/agb', changefreq: 'monthly', priority: '0.3' }
  ];

  staticPages.forEach(page => {
    sitemap += `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  // Category pages
  allCategories.forEach(category => {
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
  allProducts.forEach(productSeoName => {
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

const generateRobotsTxt = () => {
  const baseUrl = 'https://seedheads.de';
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay (optional - adjust as needed)
Crawl-delay: 0

# Disallow admin/internal paths (if any exist)
# Disallow: /admin/
# Disallow: /api/
# Disallow: /private/

# Allow all major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /
`;

  return robotsTxt;
};

module.exports = {
  generateProductMetaTags,
  generateProductJsonLd,
  generateCategoryJsonLd,
  generateHomepageJsonLd,
  generateSitemapJsonLd,
  generateXmlSitemap,
  generateRobotsTxt
}; 