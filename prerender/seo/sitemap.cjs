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

module.exports = {
  generateSitemapJsonLd,
  generateXmlSitemap,
}; 